import { loginWithCredentials, type LoginResponse } from '../api/authApi';

export const AUTH_STORAGE_KEY = 'smartCampus.auth';

export async function authenticate(identifier: string, password: string): Promise<LoginResponse> {
  return loginWithCredentials({ identifier, password });
}

export function loadAuthSession(): LoginResponse | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as LoginResponse;
    if (!parsed?.token || !parsed?.role || !parsed?.username) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveAuthSession(session: LoginResponse): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}