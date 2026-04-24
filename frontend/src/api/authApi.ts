import { apiClient } from './client';
import type { CreateUserPayload, UserRole, UserSummary } from './types';

export interface AuthConfig {
  loginUrl: string;
  message: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
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

export async function fetchUsers(): Promise<UserSummary[]> {
  const { data } = await apiClient.get<UserSummary[]>('/auth/users');
  return data;
}

export async function createUser(payload: CreateUserPayload): Promise<UserSummary> {
  const { data } = await apiClient.post<UserSummary>('/auth', payload);
  return data;
}

export async function fetchUserById(id: string): Promise<UserSummary> {
  const { data } = await apiClient.get<UserSummary>(`/auth/${id}`);
  return data;
}

export async function updateUserProfile(
  id: string,
  payload: { fullName: string; newPassword?: string },
): Promise<UserSummary> {
  const { data } = await apiClient.patch<UserSummary>(`/auth/${id}/profile`, payload);
  return data;
}

export async function updateUserAdmin(
  id: string,
  payload: CreateUserPayload,
): Promise<UserSummary> {
  const { data } = await apiClient.put<UserSummary>(`/auth/${id}`, payload);
  return data;
}
