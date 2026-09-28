import {t} from '../../../shared/config/i18n';
import {useStyles} from './farm-map.styles';
import React, {useState} from 'react';
import {Pressable, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MapView, {Marker, Polygon} from 'react-native-maps';
import type {MapPressEvent} from 'react-native-maps';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton, AppIcon} from '../../../shared/components/ui';
import {FieldFlowHeader} from '../../../shared/components/field-flow-header/field-flow-header.component';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import {
  fieldTypeLabels, formatArea, polygonAreaM2, polygonCentroid, polygonContains, regionForPoints, selectedAreaM2,
} from '../../../shared/core/fields/model';
import {
  DEFAULT_MAP_REGION, rememberMapRegion, useLastMapRegion,
} from '../../../shared/core/location/lastMapRegion';
import {useFarmData} from '../../../shared/core/offline/FarmDataProvider';
import {dateLabel, formatKilograms, formatMoney} from '../../../shared/core/records/model';
import {useSeason} from '../../../shared/core/records/SeasonProvider';
import {summarizeSeason} from '../../../shared/core/records/seasonSummary';
import {seasonCropOf} from '../../../shared/core/rotation/model';
import {useScale, useTheme} from '../../../shared/theme';
import {recordTitle} from '../components/record-row/record-row.component';

type Props = NativeStackScreenProps<RootStackParamList, 'FarmMap'>;

// Satellite imagery looks the same in both themes, so contours use the accent with some transparency.
function withAlpha(hex: string, alpha: number): string {
  const [red, green, blue] = [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16));
  return `rgba(${red},${green},${blue},${alpha})`;
}

// Every plot with a contour on the satellite map, named in place; a tap shows what grows there
// in the season chosen on the home screen and how the season goes in money.
export function FarmMapScreen({navigation}: Props) {
  const styles = useStyles();
  const {theme} = useTheme();
  const scale = useScale();
  const {fields} = useFields();
  const {data} = useFarmData();
  const {selectedSeason} = useSeason();
  const lastRegion = useLastMapRegion();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const season = selectedSeason ?? new Date().getFullYear();
  const mapped = fields.filter(field => field.polygon.length >= 3);
  const unmapped = fields.filter(field => field.polygon.length < 3);
  // All contours fit on screen at once; without any, the map opens where it was last left.
  const [farmRegion] = useState(() => (mapped.length > 0 ? regionForPoints(mapped.flatMap(field => field.polygon)) : null));
  const initialRegion = farmRegion ?? (lastRegion === undefined ? null : lastRegion ?? DEFAULT_MAP_REGION);
  const selected = mapped.find(field => field.id === selectedId) ?? null;

  // Taps are matched against the contours here: iOS reports a polygon tap to the map as well.
  const selectAt = (event: MapPressEvent) => {
    const {coordinate, action} = event.nativeEvent;
    if (action === 'marker-press') return;
    // Overlapping contours are unlikely; the smallest wins so a plot inside another stays reachable.
    const hit = mapped.filter(field => polygonContains(field.polygon, coordinate))
      .sort((a, b) => polygonAreaM2(a.polygon) - polygonAreaM2(b.polygon))[0];
    setSelectedId(hit?.id ?? null);
  };

  const summary = selected ? summarizeSeason(data.records, season, selected.id) : null;
  const crop = selected ? seasonCropOf(selected, season, data.plantings, data.rows) : null;
  const lastRecord = selected ? data.records.filter(record => record.fieldId === selected.id)
    .sort((a, b) => b.occurredOn.localeCompare(a.occurredOn) || b.createdAt.localeCompare(a.createdAt))[0] : undefined;

  return <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <View style={styles.top}>
      <FieldFlowHeader title={t("farmMapTitle")} onBack={() => navigation.goBack()} />
      <Text style={styles.hint}>
        {mapped.length === 0 ? t("noContoursYet") : t("seasonTapAFieldHint", [season])}
      </Text>
      {mapped.length > 0 && unmapped.length > 0 && <Text style={styles.hint}>
        {t("fieldsWithoutContour", [unmapped.map(field => field.name).join(', ')])}
      </Text>}
    </View>
    <View style={styles.map}>
      {initialRegion && <MapView
        style={styles.map}
        mapType="hybrid"
        initialRegion={initialRegion}
        onRegionChangeComplete={rememberMapRegion}
        onPress={selectAt}>
        {mapped.map(field => {
          const isSelected = field.id === selectedId;
          return <Polygon key={field.id} coordinates={field.polygon} strokeColor={theme.colors.accent}
            fillColor={withAlpha(theme.colors.accent, isSelected ? 0.45 : 0.22)}
            strokeWidth={scale(isSelected ? 5 : 3)} />;
        })}
        {mapped.map(field => <Marker key={`label-${field.id}`} coordinate={polygonCentroid(field.polygon)}
          anchor={{x: 0.5, y: 0.5}} onPress={() => setSelectedId(field.id)}>
          <View style={[styles.label, field.id === selectedId && styles.labelSelected]}>
            <Text style={[styles.labelText, field.id === selectedId && styles.labelTextSelected]} numberOfLines={1}>
              {field.name}
            </Text>
          </View>
        </Marker>)}
      </MapView>}
      {selected && summary && <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={2}>{selected.name}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={t("close")} hitSlop={8}
            onPress={() => setSelectedId(null)} style={styles.close}>
            <AppIcon name="close" color={theme.colors.textMuted} size={22} />
          </Pressable>
        </View>
        <Text style={styles.meta}>{t(fieldTypeLabels[selected.type])} · {formatArea(selectedAreaM2(selected))}</Text>
        <Text style={styles.crop}>{season}: {crop?.label ?? t("cropNotSet")}</Text>
        <View style={styles.moneyRow}>
          <Text style={styles.moneyLabel}>{t("spent")}</Text>
          <Text style={styles.moneyValue}>{summary.expenseKopecks > 0 ? formatMoney(summary.expenseKopecks) : t("noneYet")}</Text>
        </View>
        <View style={styles.moneyRow}>
          <Text style={styles.moneyLabel}>{t("incomeTotal")}</Text>
          <Text style={styles.moneyValue}>{summary.incomeKopecks > 0 ? formatMoney(summary.incomeKopecks) : t("noneYet")}</Text>
        </View>
        {summary.harvestedKg > 0 && <View style={styles.moneyRow}>
          <Text style={styles.moneyLabel}>{t("harvestedTotal")}</Text>
          <Text style={styles.moneyValue}>{formatKilograms(summary.harvestedKg)}</Text>
        </View>}
        {lastRecord && <Text style={styles.meta}>
          {t("lastRecordValue", [`${recordTitle(lastRecord)}, ${dateLabel(lastRecord.occurredOn).toLocaleLowerCase()}`])}
        </Text>}
        <AppButton label={t("openField")} onPress={() => navigation.navigate('FieldDetail', {fieldId: selected.id})} />
      </View>}
    </View>
  </SafeAreaView>;
}
