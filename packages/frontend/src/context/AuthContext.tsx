import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { UserRole } from '@attendandt/shared';
import { 
  loginApi, 
  registerApi, 
  refreshTokenApi, 
  logoutApi,
  forgotPasswordApi,
  resetPasswordApi
} from '../api/auth.api';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' }
  | { type: 'AUTH_UPDATE_USER'; payload: User }
  | { type: 'AUTH_UPDATE_TOKENS'; payload: AuthTokens };

// Initial state
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'AUTH_UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'AUTH_UPDATE_TOKENS':
      return {
        ...state,
        tokens: action.payload,
      };
    default:
      return state;
  }
}

// Context type
interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage helpers
const TOKEN_STORAGE_KEY = 'attendandt_tokens';
const USER_STORAGE_KEY = 'attendandt_user';

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

const getFromStorage = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to read from localStorage:', error);
    return null;
  }
};

const removeFromStorage = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
};

// API base URL (leave empty to use relative paths, with Vite proxy in dev)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedTokens = getFromStorage(TOKEN_STORAGE_KEY);
      const storedUser = getFromStorage(USER_STORAGE_KEY);

      if (storedTokens && storedUser) {
        // Check if tokens are still valid
        if (storedTokens.expiresAt > Date.now()) {
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: storedUser,
              tokens: storedTokens,
            },
          });
        } else {
          // Access token expired and refresh flow not implemented yet on backend.
          // Clear stored credentials and force login.
          handleLogout();
        }
      }
    };

    initializeAuth();
  }, []);

  const refreshTokens = async (refreshToken: string) => {
    const response = await refreshTokenApi({ refreshToken });
    const { user, tokens: tokenPayload } = response.data;
    const tokens: AuthTokens = {
      accessToken: tokenPayload.accessToken,
      refreshToken: tokenPayload.refreshToken,
      expiresAt: Date.now() + tokenPayload.expiresIn * 1000,
    };

    dispatch({
      type: 'AUTH_SUCCESS',
      payload: { user, tokens },
    });

    saveToStorage(TOKEN_STORAGE_KEY, tokens);
    saveToStorage(USER_STORAGE_KEY, user);
  };

  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await loginApi({ email, password });
      const { user, tokens: tokenPayload } = response.data;
      const tokens: AuthTokens = {
        accessToken: tokenPayload.accessToken,
        refreshToken: tokenPayload.refreshToken,
        expiresAt: Date.now() + tokenPayload.expiresIn * 1000,
      };

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, tokens },
      });

      saveToStorage(TOKEN_STORAGE_KEY, tokens);
      saveToStorage(USER_STORAGE_KEY, user);
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await registerApi(data);
      const { user, tokens: tokenPayload } = response.data;
      const tokens: AuthTokens = {
        accessToken: tokenPayload.accessToken,
        refreshToken: tokenPayload.refreshToken,
        expiresAt: Date.now() + tokenPayload.expiresIn * 1000,
      };

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, tokens },
      });

      saveToStorage(TOKEN_STORAGE_KEY, tokens);
      saveToStorage(USER_STORAGE_KEY, user);
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      throw error;
    }
  };

  const handleLogout = () => {
    dispatch({ type: 'AUTH_LOGOUT' });
    removeFromStorage(TOKEN_STORAGE_KEY);
    removeFromStorage(USER_STORAGE_KEY);
  };

  const logout = async () => {
    const tokens = getFromStorage(TOKEN_STORAGE_KEY);
    if (tokens?.refreshToken) {
      try {
        await logoutApi({ refreshToken: tokens.refreshToken });
      } catch (error) {
        console.error('Logout failed on server, clearing client state anyway.', error);
      }
    }
    handleLogout();
  };

  const refreshToken = async () => {
    const tokens = getFromStorage(TOKEN_STORAGE_KEY);
    if (!tokens?.refreshToken) {
      throw new Error('No refresh token available.');
    }
    await refreshTokens(tokens.refreshToken);
  };

  const clearError = () => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  };

  const forgotPassword = async (email: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      await forgotPasswordApi({ email });
    } catch (error: any) {
      // We don't dispatch an error to prevent user enumeration
      console.error(error);
    } finally {
      // Simulate success to the user
      dispatch({ type: 'AUTH_SUCCESS', payload: state });
    }
  };

  const resetPassword = async (data: ResetPasswordData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      await resetPasswordApi({ 
        token: data.token, 
        password: data.password, 
        passwordConfirmation: data.confirmPassword 
      });
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      throw error;
    }
  };

  const value = {
    state,
    login,
    register,
    logout,
    refreshToken,
    clearError,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context - This is now superseded by hooks/useAuth.ts
// export function useAuthContext() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuthContext must be used within an AuthProvider');
//   }
//   return context;
// } 