import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {getAuth, onAuthStateChanged} from '@react-native-firebase/auth';
import type {AuthSession} from '../../services/auth/types';
import {
  signInWithGoogle,
  signOutOfGoogle,
} from '../../services/auth/googleAuth';

type AuthContextValue = {
  session: AuthSession | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: PropsWithChildren) {
  // null means Firebase is still restoring its persisted session.
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    return onAuthStateChanged(getAuth(), (user: {uid: string; displayName: string | null} | null) => {
      setSession(
        user
          ? {
              kind: 'authenticated',
              userId: user.uid,
              displayName: user.displayName || undefined,
            }
          : {kind: 'guest'},
      );
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      signInWithGoogle: async () => {
        await signInWithGoogle();
      },
      signOut: signOutOfGoogle,
    }),
    [session],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}
