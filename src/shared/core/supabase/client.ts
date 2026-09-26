import 'react-native-url-polyfill/auto';
import {AppState} from 'react-native';
import {createAsyncStorage} from '@react-native-async-storage/async-storage';
import {createClient, processLock} from '@supabase/supabase-js';
import type {SupabaseClient} from '@supabase/supabase-js';
import {
  isSupabaseConfigured,
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL,
} from '../config/supabase';

// Supabase keeps the signed-in session here, so the user stays logged in between launches.
const authStorage = createAsyncStorage('agrorahunok-auth');
let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: authStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        lock: processLock,
      },
    });
    // Refresh the session only while the app is in the foreground, as Supabase recommends for React Native.
    AppState.addEventListener('change', state => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });
    client = supabase;
  }
  return client;
}
