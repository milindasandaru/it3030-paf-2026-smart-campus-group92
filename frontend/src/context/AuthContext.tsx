import { useState, type PropsWithChildren } from 'react';
import { AuthContext, type AuthContextValue } from './auth-context';

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>({
    name: 'Campus Admin',
    role: 'Admin',
  });

  const value: AuthContextValue = {
    user,
    login: () => setUser({ name: 'Campus Admin', role: 'Admin' }),
    logout: () => setUser(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
