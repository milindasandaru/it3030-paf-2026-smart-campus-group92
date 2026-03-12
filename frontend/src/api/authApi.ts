import { apiClient } from './client';

export interface AuthConfig {
  loginUrl: string;
  message: string;
}

export async function fetchAuthConfig(): Promise<AuthConfig> {
  const { data } = await apiClient.get<AuthConfig>('/auth/config');
  return data;
}
