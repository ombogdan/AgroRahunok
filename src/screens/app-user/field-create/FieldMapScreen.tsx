import React, {useMemo, useRef, useState} from 'react';
import {Alert, Linking, PermissionsAndroid, Platform, Pressable, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MapView, {Marker, Polygon, Polyline} from 'react-native-maps';
import type {MapPressEvent, UserLocationChangeEvent} from 'react-native-maps';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton, AppIcon} from '../../../shared/components/ui';
import type {GeoPoint} from '../../../shared/core/fields/model';
import {formatHectares, formatSotky, polygonAreaM2, polygonHasCrossingEdges} from '../../../shared/core/fields/model';
import {useTheme, useThemedStyles} from '../../../shared/theme';
import type {AppTheme} from '../../../shared/theme/theme';
import {FieldFlowHeader} from './FieldFlowHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'FieldMap'>;
const createStyles = (theme: AppTheme) => ({
  safe: {flex: 1, backgroundColor: theme.colors.surface},
  top: {paddingHorizontal: 20, paddingBottom: 14, backgroundColor: theme.colors.surface},
  area: {color: theme.colors.text, fontSize: 32, fontWeight: '700' as const, marginTop: 2},
  hint: {color: theme.colors.textMuted, fontSize: 15, lineHeight: 20},
  map: {flex: 1},
  bottom: {padding: 20, flexDirection: 'row' as const, gap: 12,
    backgroundColor: theme.colors.surface},
  button: {flex: 1},
  locate: {position: 'absolute' as const, right: 20, bottom: 16, minHeight: 44,
    flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6,
    paddingHorizontal: 16, borderRadius: 999, backgroundColor: theme.colors.surface,
    shadowColor: '#000000', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: {width: 0, height: 2}, elevation: 3},
  locateText: {color: theme.colors.text, fontSize: 15, fontWeight: '600' as const},
});

function mapHint(count: number, crossing: boolean): string {
  if (crossing) return 'Контур перетинається. Пересуньте або приберіть точку.';
  if (count === 0) return 'Торкніться першого кута ділянки';
  if (count < 3) {
    const left = 3 - count;
    return `Ще ${left} ${left === 1 ? 'точка' : 'точки'} — і з’явиться площа`;
  }
  return `Точок: ${count}. Торкніться, щоб додати ще, або утримуйте точку, щоб пересунути`;
}

function showLocationUnavailable() {
  Alert.alert(
    'Не вдалося визначити ваше місце',
    'Перевірте, чи дозволено застосунку бачити геопозицію в параметрах телефону. Ділянку можна обвести й без цього — знайдіть її на карті вручну.',
    [
      {text: 'Не зараз', style: 'cancel'},
      {text: 'Відкрити параметри', onPress: () => { Linking.openSettings().catch(() => undefined); }},
    ],
  );
}

export function FieldMapScreen({navigation}: Props) {
  const styles = useThemedStyles(createStyles);
  const {theme} = useTheme();
  const mapRef = useRef<MapView>(null);
  const centeredOnLocation = useRef(false);
  const lastLocation = useRef<GeoPoint | null>(null);
  const locationFailed = useRef(false);
  const [points, setPoints] = useState<GeoPoint[]>([]);
  const [showLocation, setShowLocation] = useState(false);
  const areaM2 = useMemo(() => polygonAreaM2(points), [points]);
  const crossing = useMemo(() => polygonHasCrossingEdges(points), [points]);

  const centerOn = (point: GeoPoint) => {
    mapRef.current?.animateToRegion({...point, latitudeDelta: 0.006, longitudeDelta: 0.006}, 500);
  };

  const locate = async () => {
    if (lastLocation.current) {
      centerOn(lastLocation.current);
      return;
    }
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);
      if (result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] !== PermissionsAndroid.RESULTS.GRANTED &&
          result[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] !== PermissionsAndroid.RESULTS.GRANTED) {
        showLocationUnavailable();
        return;
      }
    }
    centeredOnLocation.current = false;
    locationFailed.current = false;
    setShowLocation(true);
  };

  // React Native releases map events once the handler returns, so read nativeEvent here
  // rather than inside a state updater that runs later.
  const addPoint = (event: MapPressEvent) => {
    const {coordinate, action} = event.nativeEvent;
    if (action === 'marker-press') return;
    setPoints(current => [...current, coordinate]);
  };

  const movePoint = (index: number, coordinate: GeoPoint) => {
    setPoints(current => current.map((item, itemIndex) => (itemIndex === index ? coordinate : item)));
  };

  const handleUserLocation = (event: UserLocationChangeEvent) => {
    const {coordinate, error} = event.nativeEvent;
    // iOS reports a denied or failed lookup as an error message next to a (0, 0) coordinate.
    if (error?.message) {
      if (locationFailed.current) return;
      locationFailed.current = true;
      setShowLocation(false);
      showLocationUnavailable();
      return;
    }
    if (!coordinate || (coordinate.latitude === 0 && coordinate.longitude === 0)) return;
    lastLocation.current = {latitude: coordinate.latitude, longitude: coordinate.longitude};
    if (centeredOnLocation.current) return;
    centeredOnLocation.current = true;
    centerOn(lastLocation.current);
  };

  return <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <View style={styles.top}>
      <FieldFlowHeader title="Обведіть ділянку" onBack={() => navigation.goBack()} />
      <Text style={styles.area}>
        {points.length >= 3 ? `${formatHectares(areaM2, {exact: true})} · ${formatSotky(areaM2)}` : formatHectares(0)}
      </Text>
      <Text style={styles.hint}>{mapHint(points.length, crossing)}</Text>
    </View>
    <View style={styles.map}>
      <MapView
        ref={mapRef}
        style={styles.map}
        mapType="satellite"
        initialRegion={{latitude: 49, longitude: 31.5, latitudeDelta: 6, longitudeDelta: 6}}
        showsUserLocation={showLocation}
        onUserLocationChange={handleUserLocation}
        onPress={addPoint}>
        {points.length >= 3 && <Polygon coordinates={points} strokeColor={theme.colors.accent}
          fillColor="rgba(227,164,59,0.28)" strokeWidth={3} />}
        {points.length === 2 && <Polyline coordinates={points} strokeColor={theme.colors.accent} strokeWidth={3} />}
        {points.map((point, index) => <Marker key={index} coordinate={point} draggable
          pinColor={theme.colors.accent}
          onDragEnd={(event: {nativeEvent: {coordinate: GeoPoint}}) => movePoint(index, event.nativeEvent.coordinate)} />)}
      </MapView>
      <Pressable accessibilityRole="button" accessibilityLabel="Моє місце"
        onPress={() => { locate().catch(showLocationUnavailable); }} style={styles.locate}>
        <AppIcon name="locate" color={theme.colors.primary} size={20} strokeWidth={2.2} />
        <Text style={styles.locateText}>Моє місце</Text>
      </Pressable>
    </View>
    <View style={styles.bottom}>
      <View style={styles.button}>
        <AppButton label="Прибрати точку" variant="secondary" disabled={points.length === 0}
          onPress={() => setPoints(current => current.slice(0, -1))} />
      </View>
      <View style={styles.button}>
        <AppButton label="Готово" disabled={points.length < 3 || areaM2 < 1 || crossing}
          onPress={() => navigation.navigate('FieldForm', {mode: 'map', polygon: points, measuredAreaM2: areaM2})} />
      </View>
    </View>
  </SafeAreaView>;
}
