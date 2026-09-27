import {useStyles} from './field-walk.styles';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Alert, Text, Vibration, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import KeepAwake from '@sayem314/react-native-keep-awake';
import MapView, {Marker, Polygon, Polyline} from 'react-native-maps';
import type {UserLocationChangeEvent} from 'react-native-maps';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton} from '../../../shared/components/ui';
import type {GeoPoint} from '../../../shared/core/fields/model';
import {formatHectares, formatSotky, polygonAreaM2} from '../../../shared/core/fields/model';
import {TRACK_MAX_ACCURACY_M, distanceM, nextTrackPoint, trackLengthM} from '../../../shared/core/fields/track';
import {useScale, useTheme} from '../../../shared/theme';
import {FieldFlowHeader} from '../../../shared/components/field-flow-header/field-flow-header.component';
import {requestLocationPermission, showLocationUnavailable} from '../../../shared/core/location/permissions';

type Props = NativeStackScreenProps<RootStackParamList, 'FieldWalk'>;
type Phase = 'idle' | 'tracking' | 'paused';
type HintTone = 'normal' | 'warning' | 'success';

// Back within this distance of the first point (or the GPS accuracy, if worse) counts as a closed loop.
const RETURN_RADIUS_M = 5;


function walkHint(phase: Phase, accuracy: number | null, points: number, lengthM: number, nearStart: boolean):
  {text: string; tone: HintTone} {
  if (accuracy === null) return {text: 'Шукаємо сигнал GPS…', tone: 'normal'};
  const accuracyText = `±${Math.round(accuracy)} м`;
  if (accuracy > TRACK_MAX_ACCURACY_M && phase !== 'paused') {
    const advice = phase === 'tracking' ? 'точки не записуються' : 'вийдіть на відкрите місце';
    return {text: `Слабкий сигнал GPS (${accuracyText}) — ${advice}. Зачекайте.`, tone: 'warning'};
  }
  if (phase === 'idle') {
    return {
      text: `Станьте на кут ділянки й натисніть «Почати». Точність ${accuracyText}.`,
      tone: 'normal',
    };
  }
  if (nearStart) {
    return {text: 'Ви біля точки старту. Натисніть «Завершити», щоб замкнути контур.', tone: 'success'};
  }
  const progress = `Пройдено ${Math.round(lengthM)} м · точок: ${points}`;
  if (phase === 'paused') return {text: `Пауза. ${progress}`, tone: 'normal'};
  return {text: `Йдіть межею ділянки. ${progress} · ${accuracyText}`, tone: 'normal'};
}

export function FieldWalkScreen({navigation}: Props) {
  const styles = useStyles();
  const {theme} = useTheme();
  const scale = useScale();
  const mapRef = useRef<MapView>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [track, setTrack] = useState<GeoPoint[]>([]);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [showLocation, setShowLocation] = useState(false);
  const [position, setPosition] = useState<GeoPoint | null>(null);
  // Location events and navigation listeners run outside render, so they read these refs.
  const phaseRef = useRef<Phase>('idle');
  const trackRef = useRef<GeoPoint[]>([]);
  const startedAt = useRef(0);
  const centered = useRef(false);
  const locationFailed = useRef(false);
  const announcedReturn = useRef(false);
  const areaM2 = useMemo(() => polygonAreaM2(track), [track]);
  const lengthM = useMemo(() => trackLengthM(track), [track]);
  const canFinish = track.length >= 3 && areaM2 >= 1;
  const nearStart = phase === 'tracking' && track.length >= 10 && lengthM >= 20 && position !== null &&
    distanceM(position, track[0]) <= Math.max(RETURN_RADIUS_M, accuracy ?? RETURN_RADIUS_M);

  useEffect(() => { trackRef.current = track; }, [track]);

  // A short buzz tells the walker the loop is closed without looking at the screen.
  useEffect(() => {
    if (nearStart && !announcedReturn.current) Vibration.vibrate();
    announcedReturn.current = nearStart;
  }, [nearStart]);

  // Listen from the start so the GPS settles before the first step.
  useEffect(() => {
    requestLocationPermission()
      .then(granted => (granted ? setShowLocation(true) : showLocationUnavailable()))
      .catch(showLocationUnavailable);
  }, []);

  // Losing a long walk to a stray back swipe hurts; saving resets the stack and is allowed through.
  useEffect(() => navigation.addListener('beforeRemove', event => {
    if (trackRef.current.length === 0 || event.data.action.type === 'RESET') return;
    event.preventDefault();
    Alert.alert('Скасувати обхід?', 'Записаний трек буде втрачено.', [
      {text: 'Залишитися', style: 'cancel'},
      {text: 'Скасувати обхід', style: 'destructive', onPress: () => navigation.dispatch(event.data.action)},
    ]);
  }), [navigation]);

  const changePhase = (next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
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
    const fix = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      accuracy: coordinate.accuracy,
      timestamp: coordinate.timestamp,
    };
    setAccuracy(fix.accuracy);
    const here = {latitude: fix.latitude, longitude: fix.longitude};
    setPosition(here);
    if (!centered.current) {
      centered.current = true;
      mapRef.current?.animateToRegion({...here, latitudeDelta: 0.002, longitudeDelta: 0.002}, 500);
    }
    if (phaseRef.current !== 'tracking') return;
    setTrack(current => {
      const point = nextTrackPoint(current, fix, startedAt.current);
      return point ? [...current, point] : current;
    });
    mapRef.current?.animateCamera({center: here}, {duration: 300});
  };

  const start = () => {
    startedAt.current = Date.now();
    changePhase('tracking');
    if (!showLocation) {
      locationFailed.current = false;
      requestLocationPermission()
        .then(granted => (granted ? setShowLocation(true) : showLocationUnavailable()))
        .catch(showLocationUnavailable);
    }
  };

  const restart = () => Alert.alert('Почати заново?', 'Записаний трек буде видалено.', [
    {text: 'Скасувати', style: 'cancel'},
    {text: 'Почати заново', style: 'destructive', onPress: () => {
      setTrack([]);
      changePhase('idle');
    }},
  ]);

  const finish = () => {
    // Stop recording while the form is open; coming back lets the walk continue.
    changePhase('paused');
    navigation.navigate('FieldForm', {mode: 'walk', polygon: track, measuredAreaM2: areaM2});
  };

  const hint = walkHint(phase, accuracy, track.length, lengthM, nearStart);
  const hintStyle = hint.tone === 'warning' ? styles.warning : hint.tone === 'success' ? styles.success : styles.hint;

  return <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    {/* The screen must not sleep mid-walk: a locked phone stops receiving GPS fixes. */}
    {phase === 'tracking' && <KeepAwake />}
    <View style={styles.top}>
      <FieldFlowHeader title="Обійдіть ділянку" onBack={() => navigation.goBack()} />
      <Text style={styles.area}>
        {track.length >= 3 ? `${formatHectares(areaM2, {exact: true})} · ${formatSotky(areaM2)}` : formatHectares(0)}
      </Text>
      <Text style={hintStyle} accessibilityLiveRegion="polite">{hint.text}</Text>
    </View>
    <View style={styles.map}>
      <MapView
        ref={mapRef}
        style={styles.map}
        mapType="hybrid"
        initialRegion={{latitude: 49, longitude: 31.5, latitudeDelta: 6, longitudeDelta: 6}}
        showsUserLocation={showLocation}
        userLocationPriority="high"
        userLocationUpdateInterval={1000}
        userLocationFastestInterval={500}
        onUserLocationChange={handleUserLocation}>
        {track.length >= 3 && <Polygon coordinates={track} fillColor="rgba(227,164,59,0.28)"
          strokeColor="transparent" strokeWidth={scale(0)} />}
        {track.length >= 2 && <Polyline coordinates={track} strokeColor={theme.colors.accent} strokeWidth={scale(4)} />}
        {track.length > 0 && <Marker coordinate={track[0]} pinColor={theme.colors.primary} title="Початок обходу" />}
      </MapView>
    </View>
    <View style={styles.bottom}>
      {phase === 'idle' && <AppButton label="Почати" onPress={start} />}
      {phase === 'tracking' && <View style={styles.row}>
        <View style={styles.button}>
          <AppButton label="Пауза" variant="secondary" onPress={() => changePhase('paused')} />
        </View>
        <View style={styles.button}>
          <AppButton label="Завершити" disabled={!canFinish} onPress={finish} />
        </View>
      </View>}
      {phase === 'paused' && <>
        <View style={styles.row}>
          <View style={styles.button}>
            <AppButton label="Почати заново" variant="secondary" onPress={restart} />
          </View>
          <View style={styles.button}>
            <AppButton label="Продовжити" variant="secondary" onPress={() => changePhase('tracking')} />
          </View>
        </View>
        <AppButton label="Завершити" disabled={!canFinish} onPress={finish} />
      </>}
    </View>
  </SafeAreaView>;
}
