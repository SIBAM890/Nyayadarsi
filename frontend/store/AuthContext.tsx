/**
 * Authentication context — manages user session state and token lifecycle.
 */
import React, { createContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@/types/auth';
import {
  getToken,
  persistToken,
  clearToken,
  getMe,
  login as loginService,
  register as registerService,
} from '@/services/authService';
import type { LoginRequest, RegisterRequest } from '@/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'SET_USER'; user: User; token: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; isLoading: boolean };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return {
        user: action.user,
        token: action.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    default:
      return state;
  }
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

export interface AuthContextValue extends AuthState {
  login: (payload: LoginRequest) => Promise<string | null>;
  register: (payload: RegisterRequest) => Promise<string | null>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On mount, check for existing token and restore session
  useEffect(() => {
    const token = getToken();
    if (!token) {
      dispatch({ type: 'SET_LOADING', isLoading: false });
      return;
    }

    getMe().then(({ data }) => {
      if (data) {
        dispatch({ type: 'SET_USER', user: data, token });
      } else {
        clearToken();
        dispatch({ type: 'LOGOUT' });
      }
    });
  }, []);

  const login = useCallback(async (payload: LoginRequest): Promise<string | null> => {
    const { data, error } = await loginService(payload);
    if (error || !data) return error || 'Login failed';
    persistToken(data.access_token);
    dispatch({ type: 'SET_USER', user: data.user, token: data.access_token });
    return null;
  }, []);

  const register = useCallback(async (payload: RegisterRequest): Promise<string | null> => {
    const { data, error } = await registerService(payload);
    if (error || !data) return error || 'Registration failed';
    persistToken(data.access_token);
    dispatch({ type: 'SET_USER', user: data.user, token: data.access_token });
    return null;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
