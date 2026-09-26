import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import type {PropsWithChildren} from 'react';
import type {Session} from '@supabase/supabase-js';
import type {AuthSession} from '../../services/auth/types';
import {
  signInWithGoogle,
  signOutOfGoogle,
} from '../../services/auth/googleAuth';
import type {SignInResult} from '../../services/auth/googleAuth';
import {getSupabaseClient} from '../../supabase/client';

type AuthContextValue = {
  session: AuthSession | null;
  signInWithGoogle: () => Promise<SignInResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthSession(session: Session | null): AuthSession {
  if (!session) return {kind: 'guest'};
  const meta = session.user.user_metadata ?? {};
  return {
    kind: 'authenticated',
    userId: session.user.id,
    displayName: meta.full_name || meta.name || undefined,
    email: session.user.email || undefined,
  };
}

export function AuthProvider({children}: PropsWithChildren) {
  // null means the saved Supabase session is still being restored.
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setSession({kind: 'guest'});
      return;
    }
    let mounted = true;
    let eventReceived = false;
    // Only store the session here: Supabase awaits this callback, so it must not call Supabase itself.
    const {data: listener} = supabase.auth.onAuthStateChange((_event, next) => {
      if (!mounted) return;
      eventReceived = true;
      setSession(toAuthSession(next));
    });
    supabase.auth.getSession()
      .then(({data}) => {
        if (mounted && !eventReceived) setSession(toAuthSession(data.session));
      })
      .catch(() => {
        if (mounted && !eventReceived) setSession({kind: 'guest'});
      });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      signInWithGoogle,
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
