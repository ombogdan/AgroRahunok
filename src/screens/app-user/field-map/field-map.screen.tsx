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
import {
  editablePolygon,
  formatArea,
  formatHectares,
  formatSotky,
  insertIntoNearestEdge,
  noticeableAreaError,
  polygonAreaM2,
  polygonHasCrossingEdges,
  regionForPoints,
} from '../../../shared/core/fields/model';
import {useScale, useTheme} from '../../../shared/theme';
import {FieldFlowHeader} from '../../../shared/components/field-flow-header/field-flow-header.component';
import {requestLocationPermission, showLocationUnavailable} from '../../../shared/core/location/permissions';
import {
  DEFAULT_MAP_REGION, rememberMapRegion, useLastMapRegion,
} from '../../../shared/core/location/lastMapRegion';

type Props = NativeStackScreenProps<RootStackParamList, 'FieldMap'>;
// `appendPoints` is off while adjusting an existing contour: a tap then adds a corner to the nearest edge.
type Shape = {points: GeoPoint[]; appendPoints: boolean};
// Every change is kept, so a wrong drag or tap can be taken back step by step.
type Contour = Shape & {history: Shape[]};

function mapHint(count: number, crossing: boolean, adjusting: boolean): string {
  if (crossing) return t("theBoundaryCrossesItselfMoveOrRemoveAPoint");
  if (count === 0) return t("tapTheFirstFieldCorner");
  if (count < 3) {
    const left = 3 - count;
    return t("morePointsNeededHint", [left, t(left === 1 ? 'pointSingular' : 'pointPlural')]);
  }
  return adjusting ? t("adjustBoundaryHint") : t("mapPointCountHint", [count]);
}

export function FieldMapScreen({route, navigation}: Props) {
  const styles = useStyles();
  const {theme} = useTheme();
  const scale = useScale();
  // With a plot id the screen changes that plot's contour and hands it back to the edit form.
  const editFieldId = route.params?.fieldId ?? null;
  const [adjusting] = useState(() => (route.params?.polygon.length ?? 0) >= 3);
  const [contour, setContour] = useState<Contour>(() => ({
    points: editablePolygon(route.params?.polygon ?? []),
    appendPoints: (route.params?.polygon.length ?? 0) < 3,
    history: [],
  }));
  const {points} = contour;
  const lastRegion = useLastMapRegion();
  // An existing contour opens in view; otherwise the map returns to where it was last left.
  const [contourRegion] = useState(() => (points.length >= 3 ? regionForPoints(points) : null));
  const initialRegion = contourRegion ?? (lastRegion === undefined ? null : lastRegion ?? DEFAULT_MAP_REGION);
  const mapRef = useRef<MapView>(null);
  // The first GPS fix recenters the map only when there is nothing else to show: no contour and
  // no place the map was left at before. «Моє місце» recenters on request.
  const centeredOnLocation = useRef(points.length >= 3);
  useEffect(() => {
    if (lastRegion) centeredOnLocation.current = true;
  }, [lastRegion]);
  const lastLocation = useRef<GeoPoint | null>(null);
  const locationFailed = useRef(false);
  const [showLocation, setShowLocation] = useState(false);
  const areaM2 = useMemo(() => polygonAreaM2(points), [points]);
  const crossing = useMemo(() => polygonHasCrossingEdges(points), [points]);
  const areaError = useMemo(() => noticeableAreaError(points, areaM2), [points, areaM2]);

  useEffect(() => {
    // Show the user's position as soon as the map opens. The button can retry if access was denied.
    requestLocationPermission().then(granted => {
      if (granted) setShowLocation(true);
    }).catch(() => undefined);
  }, []);

  const change = (update: (shape: Shape) => Shape) => setContour(current => {
    const next = update(current);
    if (next.points === current.points && next.appendPoints === current.appendPoints) return current;
    return {...next, history: [...current.history, {points: current.points, appendPoints: current.appendPoints}]};
  });

  const undo = () => setContour(current => {
    const previous = current.history[current.history.length - 1];
    return previous ? {...previous, history: current.history.slice(0, -1)} : current;
  });

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
    change(shape => (shape.points.some(point =>
      Math.abs(point.latitude - coordinate.latitude) < 0.0000001 &&
      Math.abs(point.longitude - coordinate.longitude) < 0.0000001)
      ? shape
      : {...shape, points: shape.appendPoints ? [...shape.points, coordinate] : insertIntoNearestEdge(shape.points, coordinate)}));
  };

  const movePoint = (index: number, coordinate: GeoPoint) => {
    change(shape => ({...shape, points: shape.points.map((item, itemIndex) => (itemIndex === index ? coordinate : item))}));
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

  const finish = () => {
    if (!editFieldId) {
      navigation.navigate('FieldForm', {mode: 'map', polygon: points, measuredAreaM2: areaM2});
      return;
    }
    // Nothing was moved: keep the saved contour rather than its simplified copy.
    if (contour.history.length === 0) {
      navigation.goBack();
      return;
    }
    navigation.popTo('FieldForm', {
      mode: 'edit',
      fieldId: editFieldId,
      boundary: {polygon: points, measuredAreaM2: areaM2, source: 'map'},
    });
  };

  return <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <View style={styles.top}>
      <FieldFlowHeader
        title={adjusting ? t("adjustTheBoundary") : t("drawTheFieldBoundary")}
        onBack={() => navigation.goBack()}
        rightLabel={adjusting && points.length > 0 ? t("clearAll") : undefined}
        onRight={() => change(() => ({points: [], appendPoints: true}))}/>
      <Text style={styles.area}>
        {points.length >= 3 ? `${formatHectares(areaM2, {exact: true})} · ${formatSotky(areaM2)}` : formatHectares(0)}
      </Text>
      {areaError && <Text style={styles.hint}>
        {t("areaErrorHint", [formatArea(areaError.errorM2), Math.round(areaError.percent)])}
      </Text>}
      <Text style={styles.hint}>{mapHint(points.length, crossing, adjusting && !contour.appendPoints)}</Text>
    </View>
    <View style={styles.map}>
      {initialRegion && <MapView
        ref={mapRef}
        style={styles.map}
        mapType="hybrid"
        initialRegion={initialRegion}
        showsUserLocation={showLocation}
        onUserLocationChange={handleUserLocation}
        onRegionChangeComplete={rememberMapRegion}
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
      </MapView>}
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
        {adjusting
          ? <AppButton label={t("undoStep")} variant="secondary" disabled={contour.history.length === 0}
            onPress={undo}/>
          : <AppButton label={t("removePoint")} variant="secondary" disabled={points.length === 0}
            onPress={() => change(shape => ({...shape, points: shape.points.slice(0, -1)}))}/>}
      </View>
      <View style={styles.button}>
        <AppButton
          label={t("done")}
          disabled={points.length < 3 || areaM2 < 1 || crossing}
          onPress={finish}/>
      </View>
    </View>
  </SafeAreaView>;
}
