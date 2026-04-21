import { createContext } from 'react';
import type { UserRole } from '../api/types';

export interface AuthUser {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  token: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
