import axios from 'axios';
import { AUTH_STORAGE_KEY } from '../services/authService';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8090/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
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
    // Ignore malformed auth payloads and continue without an auth header.
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const serverMessage = error?.response?.data?.message;
    if (serverMessage && typeof serverMessage === 'string') {
      error.message = serverMessage;
    }
    return Promise.reject(error);
  },
);
