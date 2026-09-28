import {t} from '../../../shared/config/i18n';
import {useStyles} from './field-map.styles';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Platform, Pressable, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MapView, {Marker, Polygon, Polyline} from 'react-native-maps';
import type {MapPressEvent, UserLocationChangeEvent} from 'react-native-maps';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton, AppIcon} from '../../../shared/components/ui';
import type {GeoPoint} from '../../../shared/core/fields/model';
import {formatHectares, formatSotky, polygonAreaM2, polygonHasCrossingEdges} from '../../../shared/core/fields/model';
import {useScale, useTheme} from '../../../shared/theme';
import {FieldFlowHeader} from '../../../shared/components/field-flow-header/field-flow-header.component';
import {requestLocationPermission, showLocationUnavailable} from '../../../shared/core/location/permissions';

type Props = NativeStackScreenProps<RootStackParamList, 'FieldMap'>;

function mapHint(count: number, crossing: boolean): string {
  if (crossing) return t("theBoundaryCrossesItselfMoveOrRemoveAPoint");
  if (count === 0) return t("tapTheFirstFieldCorner");
  if (count < 3) {
    const left = 3 - count;
    return t("morePointsNeededHint", [left, t(left === 1 ? 'pointSingular' : 'pointPlural')]);
  }
  return t("mapPointCountHint", [count]);
}

export function FieldMapScreen({navigation}: Props) {
  const styles = useStyles();
  const {theme} = useTheme();
  const scale = useScale();
  const mapRef = useRef<MapView>(null);
  const centeredOnLocation = useRef(false);
  const lastLocation = useRef<GeoPoint | null>(null);
  const locationFailed = useRef(false);
  const [points, setPoints] = useState<GeoPoint[]>([]);
  const [showLocation, setShowLocation] = useState(false);
  const areaM2 = useMemo(() => polygonAreaM2(points), [points]);
  const crossing = useMemo(() => polygonHasCrossingEdges(points), [points]);

  useEffect(() => {
    // Show the user's position as soon as the map opens. The button can retry if access was denied.
    requestLocationPermission().then(granted => {
      if (granted) setShowLocation(true);
    }).catch(() => undefined);
  }, []);

  const centerOn = (point: GeoPoint) => {
    mapRef.current?.animateToRegion({...point, latitudeDelta: 0.006, longitudeDelta: 0.006}, 500);
  };

  const locate = async () => {
    if (lastLocation.current) {
      centerOn(lastLocation.current);
      return;
    }
    if (!(await requestLocationPermission())) {
      showLocationUnavailable();
      return;
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
    setPoints(current => current.some(point =>
      Math.abs(point.latitude - coordinate.latitude) < 0.0000001 &&
      Math.abs(point.longitude - coordinate.longitude) < 0.0000001)
      ? current : [...current, coordinate]);
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
      <FieldFlowHeader title={t("drawTheFieldBoundary")} onBack={() => navigation.goBack()}/>
      <Text style={styles.area}>
        {points.length >= 3 ? `${formatHectares(areaM2, {exact: true})} · ${formatSotky(areaM2)}` : formatHectares(0)}
      </Text>
      <Text style={styles.hint}>{mapHint(points.length, crossing)}</Text>
    </View>
    <View style={styles.map}>
      <MapView
        ref={mapRef}
        style={styles.map}
        mapType="hybrid"
        initialRegion={{latitude: 49, longitude: 31.5, latitudeDelta: 6, longitudeDelta: 6}}
        showsUserLocation={showLocation}
        onUserLocationChange={handleUserLocation}
        onPress={addPoint}>
        {points.length >= 3 &&
          <Polygon
            coordinates={points}
            strokeColor={theme.colors.accent}
            fillColor="rgba(227,164,59,0.28)"
            strokeWidth={scale(3)}/>}
        {points.length === 2 &&
          <Polyline
            coordinates={points}
            strokeColor={theme.colors.accent}
            strokeWidth={scale(3)}/>}
        {points.map((point, index) =>
          <Marker
            key={index}
            coordinate={point}
            draggable
            pinColor={theme.colors.accent}
            centerOffset={Platform.OS === 'ios' ? {x: 0, y: -scale(15)} : undefined}
            anchor={{x: 0.5, y: 1}}
            tappable={false}
            stopPropagation
            onDragEnd={(event: {
              nativeEvent: { coordinate: GeoPoint }
            }) => movePoint(index, event.nativeEvent.coordinate)}/>)}
      </MapView>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("myLocation")}
        onPress={() => {
          locate().catch(showLocationUnavailable);
        }} style={styles.locate}>
        <AppIcon name="locate" color={theme.colors.primary} size={20} strokeWidth={2.2}/>
        <Text style={styles.locateText}>{t("myLocation")}</Text>
      </Pressable>
    </View>
    <View style={styles.bottom}>
      <View style={styles.button}>
        <AppButton
          label={t("removePoint")}
          variant="secondary"
          disabled={points.length === 0}
          onPress={() => setPoints(current => current.slice(0, -1))}/>
      </View>
      <View style={styles.button}>
        <AppButton
          label={t("done")}
          disabled={points.length < 3 || areaM2 < 1 || crossing}
          onPress={() => navigation.navigate('FieldForm', {
            mode: 'map',
            polygon: points,
            measuredAreaM2: areaM2
          })}/>
      </View>
    </View>
  </SafeAreaView>;
}
