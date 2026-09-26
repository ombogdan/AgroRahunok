import Config from 'react-native-config';

// These are public client identifiers. Supabase secret/service_role keys must stay server-side.
export const SUPABASE_URL = Config.SUPABASE_URL?.trim() ?? '';
export const SUPABASE_PUBLISHABLE_KEY = Config.SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';

export const isSupabaseConfigured =
  /^https:\/\/[^/]+\.supabase\.co$/.test(SUPABASE_URL) &&
  SUPABASE_PUBLISHABLE_KEY.startsWith('sb_publishable_') &&
  !SUPABASE_URL.includes('YOUR_PROJECT_REF') &&
  !SUPABASE_PUBLISHABLE_KEY.includes('YOUR_KEY');
