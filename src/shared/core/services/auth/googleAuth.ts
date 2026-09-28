import {t} from '../../../config/i18n';
import {Platform} from 'react-native';
import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {GOOGLE_WEB_CLIENT_ID} from '../../config/google';
import {supabaseConfigProblem} from '../../config/supabase';
import {getSupabaseClient} from '../../supabase/client';

export type SignInResult = 'signed-in' | 'cancelled';

export async function signInWithGoogle(): Promise<SignInResult> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error(`Supabase не налаштовано: ${supabaseConfigProblem}.`);
  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error('Додайте GOOGLE_WEB_CLIENT_ID у .env і перезберіть застосунок.');
  }

  GoogleSignin.configure({webClientId: GOOGLE_WEB_CLIENT_ID});
  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
  }

  const response = await GoogleSignin.signIn();
  // Closing the Google sheet resolves as "cancelled" instead of throwing.
  if (isCancelledResponse(response)) return 'cancelled';
  const idToken = response.data.idToken;
  if (!idToken) {
    throw new Error('Google не повернув токен входу. Перевірте GOOGLE_WEB_CLIENT_ID.');
  }

  // Supabase creates the user on first sign-in; a database trigger adds the profile row.
  const {error} = await supabase.auth.signInWithIdToken({provider: 'google', token: idToken});
  if (error) throw error;
  return 'signed-in';
}

// A short Ukrainian message for the sign-in screen, or null when nothing should be shown.
export function signInErrorMessage(error: unknown): string | null {
  if (isErrorWithCode(error)) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED || error.code === statusCodes.IN_PROGRESS) {
      return null;
    }
    if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return t('updateGooglePlayServices');
    }
  }
  if (error instanceof Error && /network request failed|failed to fetch/i.test(error.message)) {
    return t('internetConnectionRequired');
  }
  // Setup problems (.env, the Google provider in Supabase) are spelled out for the developer only.
  if (__DEV__ && error instanceof Error) return error.message;
  return t('signInFailed');
}

export async function signOutOfGoogle() {
  const supabase = getSupabaseClient();
  if (supabase) {
    const {error} = await supabase.auth.signOut();
    if (error) throw error;
  }
  await GoogleSignin.signOut().catch(() => undefined);
}
