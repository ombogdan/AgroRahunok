import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import type {PropsWithChildren} from 'react';
import type {Session} from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
const LAST_USER_KEY = 'agrorahunok-last-user-v1';

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
    let decisiveAuthEvent = false;
    // Only store the session here: Supabase awaits this callback, so it must not call Supabase itself.
    const {data: listener} = supabase.auth.onAuthStateChange((event, next) => {
      if (!mounted) return;
      if (next) {
        decisiveAuthEvent = true;
        const identity = toAuthSession(next);
        setSession(identity);
        AsyncStorage.setItem(LAST_USER_KEY, JSON.stringify(identity)).catch(() => undefined);
      } else if (event === 'SIGNED_OUT') {
        decisiveAuthEvent = true;
        setSession({kind: 'guest'});
        AsyncStorage.removeItem(LAST_USER_KEY).catch(() => undefined);
      }
    });
    // A previously signed-in person can open their local records even when token refresh is offline.
    AsyncStorage.getItem(LAST_USER_KEY).catch(() => null).then(saved => {
      if (mounted && !decisiveAuthEvent && saved) {
        try {
          const identity = JSON.parse(saved) as AuthSession;
          if (identity.kind === 'authenticated' && identity.userId) setSession(identity);
        } catch { /* A malformed identity never replaces the Supabase session. */ }
      }
      return supabase.auth.getSession();
    }).then(({data}) => {
      if (!mounted || decisiveAuthEvent) return;
      if (data.session) {
        const identity = toAuthSession(data.session);
        setSession(identity);
        AsyncStorage.setItem(LAST_USER_KEY, JSON.stringify(identity)).catch(() => undefined);
      } else {
        setSession(current => current ?? {kind: 'guest'});
      }
    }).catch(() => {
      if (mounted && !decisiveAuthEvent) setSession(current => current ?? {kind: 'guest'});
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
      signOut: async () => {
        await signOutOfGoogle();
        await AsyncStorage.removeItem(LAST_USER_KEY);
        setSession({kind: 'guest'});
      },
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
