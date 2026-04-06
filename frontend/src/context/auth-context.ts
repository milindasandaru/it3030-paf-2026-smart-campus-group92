import { createContext } from 'react';

export interface AuthUser {
  name: string;
  role: 'Admin' | 'Technician' | 'Staff';
}

export interface AuthContextValue {
  user: AuthUser | null;
  login: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
