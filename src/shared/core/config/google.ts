import Config from 'react-native-config';

// Web OAuth client ID from Google Cloud Console → Credentials. It is public, not a secret,
// and the same ID must be listed in Supabase → Authentication → Providers → Google.
export const GOOGLE_WEB_CLIENT_ID = Config.GOOGLE_WEB_CLIENT_ID?.trim() ?? '';
