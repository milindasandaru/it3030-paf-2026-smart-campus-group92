import { useMemo, useState, type PropsWithChildren } from 'react';
import {
  authenticate,
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
} from '../services/authService';
import { AuthContext, type AuthContextValue, type AuthUser } from './auth-context';

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(() => loadAuthSession());

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user?.token),
      login: async (identifier: string, password: string) => {
        const session = await authenticate(identifier, password);
        saveAuthSession(session);
        setUser(session);
        return session;
      },
      logout: () => {
        clearAuthSession();
        setUser(null);
      },
      hasRole: (roles) => Boolean(user && roles.includes(user.role)),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
