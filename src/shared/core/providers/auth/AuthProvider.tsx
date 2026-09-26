import React, {createContext, useContext, useMemo} from 'react';
import type {PropsWithChildren} from 'react';
import type {AuthSession} from '../../services/auth/types';

type AuthContextValue = {
  session: AuthSession;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: PropsWithChildren) {
  // Local-first MVP: account providers can be connected without changing screens.
  const value = useMemo<AuthContextValue>(() => ({session: {kind: 'guest'}}), []);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}
