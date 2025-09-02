import { useSelector, useDispatch } from 'react-redux';
import { login, logout, fetchUser, clearError } from './Authslice';
import type{ RootState, AppDispatch } from './Store';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, status, error, token } = useSelector((state: RootState) => state.auth);

  const isAuthenticated = !!user && !!token;
  const isAdmin = isAuthenticated && ['SUPERUSER', 'ADMIN'].includes(user!.role);
  const canPostTender = isAuthenticated && ['SUPERUSER', 'ADMIN', 'DATAENTRY'].includes(user!.role);
  const canAccessTenders = isAuthenticated && ['SUPERUSER', 'ADMIN', 'CUSTOMER'].includes(user!.role);

  return {
    user,
    status,
    error,
    isAuthenticated,
    isAdmin,
    canPostTender,
    canAccessTenders,
    login: (email: string, password: string) => dispatch(login({ email, password })),
    logout: () => dispatch(logout()),
    fetchUser: () => dispatch(fetchUser()),
    clearError: () => dispatch(clearError()),
  };
};