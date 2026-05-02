/**
 * Authentication types — mirrors backend/schemas/auth.py
 */

export type UserRole = 'gov_officer' | 'evaluation_officer' | 'builder';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}
