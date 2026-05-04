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

// Demo credentials — auto-login for demo mode (no real user needed)
const DEMO_CREDENTIALS = { email: 'demo@nyayadarsi.gov.in', password: 'nyayadarsi_demo_2026' };

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On mount: restore existing session OR silently auto-login with demo account
  useEffect(() => {
    const token = getToken();

    if (token) {
      // Existing session — verify it's still valid
      getMe().then(({ data }) => {
        if (data) {
          dispatch({ type: 'SET_USER', user: data, token });
        } else {
          // Token expired — attempt demo auto-login
          clearToken();
          autoLoginDemo();
        }
      });
    } else {
      // No token at all — attempt demo auto-login silently
      autoLoginDemo();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function autoLoginDemo() {
    try {
      const { data } = await loginService(DEMO_CREDENTIALS);
      if (data?.access_token) {
        persistToken(data.access_token);
        dispatch({ type: 'SET_USER', user: data.user, token: data.access_token });
        return;
      }
    } catch {
      // Backend offline — fall through to unauthenticated state
      // apiClient mock fallbacks will handle data display
    }
    // Backend unreachable — mark as not loading so UI renders with mock data
    dispatch({ type: 'SET_LOADING', isLoading: false });
  }

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
