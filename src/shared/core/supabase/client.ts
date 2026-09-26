import 'react-native-url-polyfill/auto';
import {getAuth} from '@react-native-firebase/auth';
import {createClient} from '@supabase/supabase-js';
import type {SupabaseClient} from '@supabase/supabase-js';
import {
  isSupabaseConfigured,
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL,
} from '../config/supabase';

let client: SupabaseClient | null = null;
let lastClaimRefresh = {uid: '', at: 0};

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      // Firebase Auth remains the only login. Supabase receives its current ID token.
      accessToken: async () => {
        const user = getAuth().currentUser;
        if (!user) return null;
        const token = await user.getIdTokenResult(false);
        if (token.claims.role === 'authenticated') return token.token;
        // A new Firebase user may receive the claim just after first sign-in.
        if (lastClaimRefresh.uid !== user.uid || Date.now() - lastClaimRefresh.at > 30_000) {
          lastClaimRefresh = {uid: user.uid, at: Date.now()};
          return user.getIdToken(true);
        }
        return token.token;
      },
      auth: {persistSession: false, autoRefreshToken: false, detectSessionInUrl: false},
    });
  }
  return client;
}
