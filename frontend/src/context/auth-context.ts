import { createContext } from 'react';

export type UserRole = 'ADMIN' | 'LECTURER' | 'STUDENT';

export interface AuthUser {
  username: string;
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
