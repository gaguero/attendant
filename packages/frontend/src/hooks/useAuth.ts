import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, User, UserRole } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const navigate = useNavigate();

  const { state, login, register, logout, refreshToken, clearError, forgotPassword, resetPassword } = context;

  const loginWithRedirect = async (email: string, password: string, from: string) => {
    await login(email, password);
    navigate(from, { replace: true });
  };

  const registerWithRedirect = async (data: any, from: string) => {
    await register(data);
    navigate(from, { replace: true });
  };

  const logoutWithRedirect = async (from = '/login') => {
    await logout();
    navigate(from, { replace: true });
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!state.user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(state.user.role);
    }
    return state.user.role === roles;
  };

  const getDisplayName = (): string => {
    if (!state.user) return '';
    if (state.user.firstName && state.user.lastName) {
      return `${state.user.firstName} ${state.user.lastName}`;
    }
    return state.user.email;
  };

  const getUserInitials = (): string => {
    if (!state.user) return '';
    if (state.user.firstName && state.user.lastName) {
      return `${state.user.firstName[0]}${state.user.lastName[0]}`.toUpperCase();
    }
    return state.user.email.substring(0, 2).toUpperCase();
  };

  const hasAnyRole = (roles: UserRole[]): boolean => roles.some(r => hasRole(r));
  const isAdmin = () => hasRole('ADMIN');
  const isManager = () => hasRole('MANAGER');
  const isStaff = () => hasRole('STAFF');
  const canManageUsers = () => hasAnyRole(['ADMIN','MANAGER']);

  return {
    ...state,
    login: loginWithRedirect,
    register: registerWithRedirect,
    logout: logoutWithRedirect,
    refreshToken,
    clearError,
    forgotPassword,
    resetPassword,
    hasRole,
    hasAnyRole,
    isAdmin,
    isManager,
    isStaff,
    canManageUsers,
    getDisplayName,
    getUserInitials,
    user: state.user as User | null,
  };
}; 