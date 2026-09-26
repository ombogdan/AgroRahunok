import {Platform} from 'react-native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
} from '@react-native-firebase/auth';
import {GOOGLE_WEB_CLIENT_ID} from '../../config/google';

export async function signInWithGoogle() {
  if (GOOGLE_WEB_CLIENT_ID.startsWith('PASTE_')) {
    throw new Error('Додайте Web Client ID у src/shared/core/config/google.ts.');
  }

  GoogleSignin.configure({webClientId: GOOGLE_WEB_CLIENT_ID});
  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
  }

  const result = await GoogleSignin.signIn();
  const idToken = result.data?.idToken;
  if (!idToken) {
    throw new Error('Google не повернув токен входу. Перевірте Web Client ID.');
  }

  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(getAuth(), credential);
}

export async function signOutOfGoogle() {
  await firebaseSignOut(getAuth());
  await GoogleSignin.signOut().catch(() => undefined);
}
