import Config from 'react-native-config';

// These are public client identifiers. Supabase secret/service_role keys must stay server-side.
// A trailing slash or the /rest/v1 suffix copied from Supabase's Data API page is tolerated.
export const SUPABASE_URL = (Config.SUPABASE_URL ?? '').trim()
  .replace(/\/rest\/v1\/?$/, '')
  .replace(/\/+$/, '');
export const SUPABASE_PUBLISHABLE_KEY = Config.SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';

// Why cloud sync is off, phrased for the developer. It never includes the values themselves.
function findConfigProblem(): string | null {
  if (!SUPABASE_URL) return 'у .env немає SUPABASE_URL, або застосунок не перебудували після зміни .env';
  if (!/^https:\/\/[^/\s]+$/.test(SUPABASE_URL)) return 'SUPABASE_URL має виглядати як https://<project-ref>.supabase.co';
  if (SUPABASE_URL.includes('YOUR_PROJECT_REF')) return 'у SUPABASE_URL залишився приклад із .env.example';
  if (!SUPABASE_PUBLISHABLE_KEY) return 'у .env немає SUPABASE_PUBLISHABLE_KEY';
  if (SUPABASE_PUBLISHABLE_KEY.startsWith('sb_secret_')) {
    return 'у SUPABASE_PUBLISHABLE_KEY вписано секретний ключ, а потрібен Publishable key';
  }
  if (!SUPABASE_PUBLISHABLE_KEY.startsWith('sb_publishable_')) {
    return 'SUPABASE_PUBLISHABLE_KEY має починатися з sb_publishable_ (Settings → API Keys → Publishable key)';
  }
  if (SUPABASE_PUBLISHABLE_KEY.includes('YOUR_KEY')) return 'у SUPABASE_PUBLISHABLE_KEY залишився приклад із .env.example';
  return null;
}

export const supabaseConfigProblem = findConfigProblem();
export const isSupabaseConfigured = supabaseConfigProblem === null;
