import axios from 'axios';
import { AUTH_STORAGE_KEY } from '../services/authService';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const url = config.url ?? '';
  if (url.includes('/auth/login')) {
    return config;
  }

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return config;
  }

  try {
    const parsed = JSON.parse(raw) as { token?: string };
    if (parsed.token) {
      config.headers.Authorization = `Bearer ${parsed.token}`;
    }
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if ((status === 401 || status === 403) && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    const serverMessage = error?.response?.data?.message;
    if (serverMessage && typeof serverMessage === 'string') {
      error.message = serverMessage;
    }
    return Promise.reject(error);
  },
);
