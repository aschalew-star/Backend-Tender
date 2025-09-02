type UserRole = 'SUPERUSER' | 'ADMIN' | 'CUSTOMER' | 'DATAENTRY';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  type: 'systemuser' | 'customer';
}

interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}