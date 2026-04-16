import { apiClient } from './client';

export interface AuthConfig {
  loginUrl: string;
  message: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  username: string;
  role: 'ADMIN' | 'LECTURER' | 'STUDENT';
  token: string;
}

export async function fetchAuthConfig(): Promise<AuthConfig> {
  const { data } = await apiClient.get<AuthConfig>('/auth/config');
  return data;
}

export async function loginWithCredentials(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
  return data;
}
