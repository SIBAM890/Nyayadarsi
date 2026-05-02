/**
 * Authentication service — login, register, profile retrieval.
 */
import { apiFetch } from './apiClient';
import type { ApiResponse } from '@/types/api';
import type { TokenResponse, LoginRequest, RegisterRequest, User } from '@/types/auth';

const TOKEN_KEY = 'nyayadarsi_token';

export function persistToken(token: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearToken(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export async function login(
  payload: LoginRequest
): Promise<ApiResponse<TokenResponse>> {
  return apiFetch<TokenResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function register(
  payload: RegisterRequest
): Promise<ApiResponse<TokenResponse>> {
  return apiFetch<TokenResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMe(): Promise<ApiResponse<User>> {
  return apiFetch<User>('/api/auth/me');
}
