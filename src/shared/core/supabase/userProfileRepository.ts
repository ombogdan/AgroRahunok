import {getAuth} from '@react-native-firebase/auth';
import {getSupabaseClient} from './client';

function toIsoDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function syncUserProfile(userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const user = getAuth().currentUser;
  if (!supabase || !user || user.uid !== userId) {
    throw new Error('Authenticated Supabase user is not ready');
  }

  const {error} = await supabase.from('app_users').upsert({
    uid: user.uid,
    display_name: user.displayName,
    email: user.email,
    photo_url: user.photoURL,
    provider_id: user.providerData[0]?.providerId ?? user.providerId,
    last_sign_in_at: toIsoDate(user.metadata.lastSignInTime),
  }, {onConflict: 'uid'});
  if (error) throw error;
}
