import React, {useMemo, useRef, useState} from 'react';
import {Alert, PermissionsAndroid, Platform, Pressable, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MapView, {Marker, Polygon, Polyline} from 'react-native-maps';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton} from '../../../shared/components/ui';
import type {GeoPoint} from '../../../shared/core/fields/model';
import {formatHectares, formatSotkas, polygonAreaM2, polygonHasCrossingEdges} from '../../../shared/core/fields/model';
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
  locate: {position: 'absolute' as const, right: 20, bottom: 16, minHeight: 48,
    justifyContent: 'center' as const, paddingHorizontal: 18, borderRadius: 24,
    backgroundColor: theme.colors.surface},
  locateText: {color: theme.colors.text, fontSize: 16, fontWeight: '600' as const},
});

export function FieldMapScreen({navigation}: Props) {
  const styles = useThemedStyles(createStyles);
  const {theme} = useTheme();
  const mapRef = useRef<MapView>(null);
  const centeredOnLocation = useRef(false);
  const [points, setPoints] = useState<GeoPoint[]>([]);
  const [showLocation, setShowLocation] = useState(false);
  const areaM2 = useMemo(() => polygonAreaM2(points), [points]);
  const crossing = useMemo(() => polygonHasCrossingEdges(points), [points]);

  const locate = async () => {
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);
      if (result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] !== PermissionsAndroid.RESULTS.GRANTED &&
          result[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Місцезнаходження недоступне', 'Дозвольте доступ до геолокації в налаштуваннях телефону.');
        return;
      }
    }
    centeredOnLocation.current = false;
    setShowLocation(true);
  };

  return <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <View style={styles.top}>
      <FieldFlowHeader title="Обведіть ділянку" onBack={() => navigation.goBack()} />
      <Text style={styles.area}>{formatHectares(areaM2)} · {formatSotkas(areaM2)}</Text>
      <Text style={styles.hint}>{crossing ? 'Контур перетинається. Пересуньте або приберіть точку.' : `Точок: ${points.length}. Торкніться карти, щоб додати кут; точку можна пересунути.`}</Text>
    </View>
    <View style={styles.map}>
      <MapView
        ref={mapRef}
        style={styles.map}
        mapType="satellite"
        initialRegion={{latitude: 49, longitude: 31.5, latitudeDelta: 6, longitudeDelta: 6}}
        showsUserLocation={showLocation}
        onUserLocationChange={(event: {nativeEvent: {coordinate?: GeoPoint}}) => {
          const coordinate = event.nativeEvent.coordinate;
          if (!coordinate || centeredOnLocation.current) return;
          centeredOnLocation.current = true;
          mapRef.current?.animateToRegion({
            latitude: coordinate.latitude, longitude: coordinate.longitude,
            latitudeDelta: 0.006, longitudeDelta: 0.006,
          }, 500);
        }}
        onPress={(event: {nativeEvent: {coordinate: GeoPoint; action?: string}}) => {
          if (event.nativeEvent.action === 'marker-press') return;
          setPoints(current => [...current, event.nativeEvent.coordinate]);
        }}>
        {points.length >= 3 && <Polygon coordinates={points} strokeColor={theme.colors.accent}
          fillColor="rgba(227,164,59,0.28)" strokeWidth={3} />}
        {points.length === 2 && <Polyline coordinates={points} strokeColor={theme.colors.accent} strokeWidth={3} />}
        {points.map((point, index) => <Marker key={index} coordinate={point} draggable
          pinColor={theme.colors.accent}
          onDragEnd={(event: {nativeEvent: {coordinate: GeoPoint}}) => setPoints(current => current.map((item, itemIndex) =>
            itemIndex === index ? event.nativeEvent.coordinate : item))} />)}
      </MapView>
      <Pressable accessibilityRole="button" onPress={() => locate().catch(() => Alert.alert('Не вдалося визначити місце'))}
        style={styles.locate}><Text style={styles.locateText}>◎ Моє місце</Text></Pressable>
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
