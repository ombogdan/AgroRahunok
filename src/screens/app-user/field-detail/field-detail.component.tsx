import React, {useMemo} from 'react';
import {Alert, Text, View} from 'react-native';
import MapView, {Polygon} from 'react-native-maps';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton, InfoCard, Page} from '../../../shared/components/ui';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import {fieldTypeLabels, formatArea, regionForPoints, selectedAreaM2} from '../../../shared/core/fields/model';
import {useFarmData} from '../../../shared/core/offline/FarmDataProvider';
import {formatKilograms} from '../../../shared/core/records/model';
import {useSeason} from '../../../shared/core/records/SeasonProvider';
import {currentRows, rowsForSeason, varietyGroups} from '../../../shared/core/rows/model';
import {logSupabaseError} from '../../../shared/core/supabase/errors';
import {useTheme, useThemedStyles} from '../../../shared/theme';
import type {AppTheme} from '../../../shared/theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'FieldDetail'>;

const createStyles = (theme: AppTheme) => ({
  map: {height: 190, borderRadius: 20, overflow: 'hidden' as const,
    borderWidth: 1, borderColor: theme.colors.border},
  mapFill: {flex: 1},
  label: {color: theme.colors.textMuted, fontSize: 17, fontWeight: '600' as const},
  metric: {color: theme.colors.text, fontSize: 40, lineHeight: 48, fontWeight: '700' as const},
  row: {minHeight: 44, flexDirection: 'row' as const, alignItems: 'center' as const, flexWrap: 'wrap' as const,
    gap: 8, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 10},
  rowLabel: {flex: 1, color: theme.colors.textMuted, fontSize: 15},
  rowValue: {color: theme.colors.text, fontSize: 17, fontWeight: '600' as const},
  badge: {borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: theme.colors.primarySoft},
  badgeText: {color: theme.colors.primary, fontSize: 13, fontWeight: '700' as const},
  crop: {color: theme.colors.text, fontSize: 22, lineHeight: 28, fontWeight: '700' as const},
  sectionTitle: {color: theme.colors.text, fontSize: 22, lineHeight: 28, fontWeight: '700' as const},
  hint: {color: theme.colors.textMuted, fontSize: 15, lineHeight: 21},
});

function AreaRow({label, areaM2, selected}: {label: string; areaM2: number; selected: boolean}) {
  const styles = useThemedStyles(createStyles);
  return <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    {selected && <View style={styles.badge}><Text style={styles.badgeText}>у розрахунках</Text></View>}
    <Text style={styles.rowValue}>{formatArea(areaM2)}</Text>
  </View>;
}

export function FieldDetailScreen({route, navigation}: Props) {
  const styles = useThemedStyles(createStyles);
  const {theme} = useTheme();
  const {fields, removeField} = useFields();
  const {data} = useFarmData();
  const {selectedSeason} = useSeason();
  const field = fields.find(item => item.id === route.params.fieldId);
  const rows = currentRows(data.rows, route.params.fieldId);
  const season = selectedSeason ?? new Date().getFullYear();
  const groups = varietyGroups(rowsForSeason(data.rows, route.params.fieldId, season));
  const harvests = data.records.filter(record => record.fieldId === route.params.fieldId &&
    record.kind === 'harvest' && record.season === season);
  const region = useMemo(
    () => (field && field.polygon.length >= 3 ? regionForPoints(field.polygon) : null),
    [field],
  );

  if (!field) return <Page title="Ділянку не знайдено" onBack={() => navigation.goBack()} />;

  const confirmDelete = () => Alert.alert('Видалити ділянку?',
    `«${field.name}» буде видалено назавжди.`, [
      {text: 'Скасувати', style: 'cancel'},
      {text: 'Видалити', style: 'destructive', onPress: () => {
        removeField(field.id).then(() => navigation.goBack())
          .catch(error => {
            logSupabaseError('Не вдалося видалити ділянку', error);
            Alert.alert('Не вдалося видалити ділянку', 'Не вдалося записати зміни на телефон.');
          });
      }},
    ]);

  const subtitle = [fieldTypeLabels[field.type], field.crop,
    rows.length > 0 ? null : field.variety].filter(Boolean).join(' · ');

  return <Page title={field.name} subtitle={subtitle} onBack={() => navigation.goBack()}>
    {field.type === 'berries' && <AppButton
      label={rows.length > 0 ? `Ряди та сорти · ${rows.length}` : 'Додати ряди та сорти'}
      variant="secondary" onPress={() => navigation.navigate('BerryRows', {fieldId: field.id})} />}
    {region && <View style={styles.map} pointerEvents="none" accessibilityLabel="Контур ділянки на карті">
      <MapView style={styles.mapFill} mapType="satellite" region={region} liteMode
        scrollEnabled={false} zoomEnabled={false} rotateEnabled={false} pitchEnabled={false}>
        <Polygon coordinates={field.polygon} strokeColor={theme.colors.accent}
          fillColor="rgba(227,164,59,0.28)" strokeWidth={3} />
      </MapView>
    </View>}
    <InfoCard>
      <Text style={styles.label}>Площа для розрахунків</Text>
      <Text style={styles.metric}>{formatArea(selectedAreaM2(field))}</Text>
      {field.documentAreaM2 !== null && <AreaRow label="За документами" areaM2={field.documentAreaM2}
        selected={field.areaSource === 'document'} />}
      {field.measuredAreaM2 !== null && <AreaRow label="Виміряна" areaM2={field.measuredAreaM2}
        selected={field.areaSource === 'measured'} />}
    </InfoCard>
    {field.crop ? <InfoCard>
      <Text style={styles.label}>Поточна культура</Text>
      <Text style={styles.crop}>{field.crop}</Text>
      {field.variety && rows.length === 0
        ? <Text style={styles.label}>Сорт: {field.variety}</Text> : null}
    </InfoCard> : null}
    {(field.type === 'berries' || rows.length > 0) && <InfoCard>
      <Text style={styles.sectionTitle}>Ряди та сорти</Text>
      {rows.length === 0 ? <Text style={styles.hint}>
        Додайте кількість рядів і позначте, який сорт росте в кожному.
      </Text> : <>
        <Text style={styles.hint}>Рядів: {rows.length}</Text>
        <Text style={styles.hint}>Сорти й урожай сезону {season}</Text>
        {groups.map(group => {
          const totalKg = harvests.filter(record =>
            record.details.varietySnapshot?.toLocaleLowerCase('uk') === group.variety.toLocaleLowerCase('uk'))
            .reduce((sum, record) => sum + (record.quantityKg ?? 0), 0);
          return <View key={group.variety} style={styles.row}>
            <Text style={styles.rowLabel}>{group.variety} · ряди {group.rows.map(item => item.rowNumber).join(', ')}</Text>
            {totalKg > 0 && <Text style={styles.rowValue}>{formatKilograms(totalKg)}</Text>}
          </View>;
        })}
        {groups.length === 0 && <Text style={styles.hint}>На цей сезон сорти рядів ще не записані.</Text>}
        {rows.some(row => row.variety === null) && <Text style={styles.hint}>
          Без сорту: {rows.filter(row => row.variety === null).map(row => row.rowNumber).join(', ')}
        </Text>}
        {harvests.some(record => !record.details.varietySnapshot) && <Text style={styles.hint}>
          Є збори без зазначеного сорту — вони не входять у підсумки сортів.
        </Text>}
      </>}
      <AppButton label={rows.length ? 'Змінити ряди та сорти' : 'Додати ряди'} variant="secondary"
        onPress={() => navigation.navigate('BerryRows', {fieldId: field.id})} />
    </InfoCard>}
    {field.type !== 'berries' && rows.length === 0 && field.type !== 'field' &&
      <AppButton label="Вести сорти по рядах" variant="quiet"
        onPress={() => navigation.navigate('BerryRows', {fieldId: field.id})} />}
    <AppButton label="Змінити" variant="secondary"
      onPress={() => navigation.navigate('FieldForm', {mode: 'edit', fieldId: field.id})} />
    <AppButton label="Видалити ділянку" variant="danger" onPress={confirmDelete} />
  </Page>;
}
