import {t} from '../../config/i18n';
import {Alert, Linking, PermissionsAndroid, Platform} from 'react-native';

export function showLocationUnavailable() {
  Alert.alert(
    t('locationUnavailableTitle'),
    t('locationUnavailableDescription'),
    [
      {text: t('notNow'), style: 'cancel'},
      {text: t('openPhoneSettings'), onPress: () => { Linking.openSettings().catch(() => undefined); }},
    ],
  );
}

// iOS asks by itself once the map starts showing the user; Android needs an explicit request.
export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const result = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  ]);
  return result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED ||
    result[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;
}
