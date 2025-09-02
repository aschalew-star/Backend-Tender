import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
   import axios from 'axios';

   interface AuthState {
     user: null | { id: string; email: string; role: string };
     status: 'idle' | 'loading' | 'succeeded' | 'failed';
     error: string | null;
   }

   const initialState: AuthState = {
     user: null,
     status: 'idle',
     error: null,
   };

   export const login = createAsyncThunk(
     'auth/login',
     async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
       try {
         const response = await axios.post('http://localhost:4000/api/users/login', { email, password });
         console.log(response.data);

         return response.data;
       } catch (error: any) {
         return rejectWithValue(error.response?.data?.message || 'Invalid email or password');
       }
     }
   );

   export const fetchUser = createAsyncThunk(
     'auth/fetchUser',
     async (_, { rejectWithValue }) => {
       try {
         const response = await axios.get('/api/users/me');
         return response.data;
       } catch (error: any) {
         return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
       }
     }
   );

   export const logout = createAsyncThunk(
     'auth/logout',
     async (_, { rejectWithValue }) => {
       try {
        const response= await axios.post('http://localhost:4000/api/users/logout');
         console.log(response.data);
         return null;
       } catch (error: any) {
         return rejectWithValue(error.response?.data?.message || 'Failed to log out');
       }
     }
   );

   const authSlice = createSlice({
     name: 'auth',
     initialState,
     reducers: {
       clearError: (state) => {
         state.error = null;
       },
     },
     extraReducers: (builder) => {
       builder
         .addCase(login.pending, (state) => {
           state.status = 'loading';
           state.error = null;
         })
         .addCase(login.fulfilled, (state, action) => {
           state.status = 'succeeded';
           state.user = action.payload;
         })
         .addCase(login.rejected, (state, action) => {
           state.status = 'failed';
           state.error = action.payload as string;
         })
         .addCase(fetchUser.pending, (state) => {
           state.status = 'loading';
           state.error = null;
         })
         .addCase(fetchUser.fulfilled, (state, action) => {
           state.status = 'succeeded';
           state.user = action.payload;
         })
         .addCase(fetchUser.rejected, (state, action) => {
           state.status = 'failed';
           state.error = action.payload as string;
           state.user = null;
         })
         .addCase(logout.pending, (state) => {
           state.status = 'loading';
           state.error = null;
         })
         .addCase(logout.fulfilled, (state) => {
           state.status = 'idle';
           state.user = null;
         })
         .addCase(logout.rejected, (state, action) => {
           state.status = 'failed';
           state.error = action.payload as string;
           state.user = null;
         });
     },
   });

   export const { clearError } = authSlice.actions;
   export default authSlice.reducer;