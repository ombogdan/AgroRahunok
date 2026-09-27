import React, {useCallback, useState} from 'react';
import {ActivityIndicator, Pressable, ScrollView, Text, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton, AppIcon, InfoCard} from '../../../shared/components/ui';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import {fieldTypeLabels, formatArea, formatHectares, formatSotky, selectedAreaM2} from '../../../shared/core/fields/model';
import {fetchPlantings} from '../../../shared/core/fields/plantingsRepository';
import type {Planting} from '../../../shared/core/fields/plantingsRepository';
import {formatMoney} from '../../../shared/core/records/model';
import {useRecords} from '../../../shared/core/records/RecordsProvider';
import {useSeason} from '../../../shared/core/records/SeasonProvider';
import {logSupabaseError} from '../../../shared/core/supabase/errors';
import {useTheme, useThemedStyles} from '../../../shared/theme';
import type {AppTheme} from '../../../shared/theme/theme';
import {useRootNavigation} from '../../../navigation/useRootNavigation';
import {RecordRow} from '../records';

const createStyles = (theme: AppTheme) => ({
  safe: {flex: 1, backgroundColor: theme.colors.background},
  content: {paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, gap: 32},
  heading: {gap: 4, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, backgroundColor: theme.colors.background},
  headingTop: {minHeight: 48, flexDirection: 'row' as const, alignItems: 'center' as const,
    justifyContent: 'space-between' as const},
  settingsButton: {width: 48, height: 48, alignItems: 'center' as const, justifyContent: 'center' as const},
  date: {color: theme.colors.textMuted, fontSize: 15, lineHeight: 20},
  title: {color: theme.colors.text, fontSize: 34, lineHeight: 41, fontWeight: '700' as const},
  empty: {gap: 24, paddingVertical: 12},
  iconCircle: {width: 112, height: 112, borderRadius: 56,
    backgroundColor: theme.colors.primarySoft, alignItems: 'center' as const, justifyContent: 'center' as const},
  emptyTitle: {color: theme.colors.text, fontSize: 28, lineHeight: 34, fontWeight: '700' as const},
  emptyText: {color: theme.colors.textMuted, fontSize: 17, lineHeight: 24},
  hint: {color: theme.colors.textMuted, fontSize: 15, lineHeight: 20},
  summaryLabel: {color: theme.colors.textMuted, fontSize: 17, fontWeight: '600' as const},
  totalRow: {flexDirection: 'row' as const, alignItems: 'baseline' as const, flexWrap: 'wrap' as const, gap: 8},
  total: {color: theme.colors.text, fontSize: 40, lineHeight: 48, fontWeight: '700' as const},
  subTotal: {color: theme.colors.textMuted, fontSize: 17},
  bar: {flexDirection: 'row' as const, gap: 3, height: 12},
  segment: {minWidth: 10, borderRadius: 999},
  fieldRow: {minHeight: 44, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 12,
    flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12},
  dot: {width: 12, height: 12, borderRadius: 6},
  rowBody: {flex: 1, gap: 2},
  rowTitle: {color: theme.colors.text, fontSize: 17, fontWeight: '600' as const},
  rowDetail: {color: theme.colors.textMuted, fontSize: 15},
  rowArea: {color: theme.colors.text, fontSize: 17, fontWeight: '600' as const},
  seasonHeader: {flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const,
    flexWrap: 'wrap' as const, gap: 8},
  seasonTitle: {color: theme.colors.textMuted, fontSize: 20, fontWeight: '600' as const},
  badge: {borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, backgroundColor: theme.colors.accentSoft},
  badgeText: {color: theme.colors.accentInk, fontSize: 15, fontWeight: '700' as const},
  moneyRow: {flexDirection: 'row' as const, alignItems: 'baseline' as const, justifyContent: 'space-between' as const,
    flexWrap: 'wrap' as const, gap: 8},
  moneyLabel: {color: theme.colors.text, fontSize: 17},
  moneyBig: {color: theme.colors.text, fontSize: 28, lineHeight: 34, fontWeight: '700' as const},
  moneyMuted: {color: theme.colors.textMuted, fontSize: 17},
  sectionHeader: {flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const},
  sectionTitle: {color: theme.colors.text, fontSize: 22, lineHeight: 28, fontWeight: '700' as const},
  yearSection: {gap: 8},
  yearLabel: {color: theme.colors.textMuted, fontSize: 17, fontWeight: '600' as const},
  yearOptions: {flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8},
  yearOption: {minHeight: 44, paddingHorizontal: 18, borderWidth: 2, borderColor: theme.colors.border,
    borderRadius: 999, backgroundColor: theme.colors.surface, alignItems: 'center' as const,
    justifyContent: 'center' as const},
  yearOptionSelected: {borderColor: theme.colors.primary, backgroundColor: theme.colors.primary},
  yearOptionText: {color: theme.colors.text, fontSize: 17, fontWeight: '600' as const},
  yearOptionTextSelected: {color: theme.colors.onPrimary},
  link: {minHeight: 44, justifyContent: 'center' as const},
  linkText: {color: theme.colors.primary, fontSize: 17, fontWeight: '600' as const},
  recordsCard: {paddingVertical: 4},
});

export function HomeScreen() {
  const styles = useThemedStyles(createStyles);
  const {theme} = useTheme();
  const navigation = useRootNavigation();
  const {fields, loadState, reload} = useFields();
  const {records} = useRecords();
  const [plantings, setPlantings] = useState<Planting[]>([]);
  const [plantingsLoaded, setPlantingsLoaded] = useState(false);
  const [plantingsError, setPlantingsError] = useState(false);
  const {selectedSeason, setSelectedSeason} = useSeason();

  useFocusEffect(useCallback(() => {
    let active = true;
    fetchPlantings().then(items => {
      if (active) {
        setPlantings(items);
        setPlantingsLoaded(true);
        setPlantingsError(false);
      }
    }).catch(error => {
      logSupabaseError('Не вдалося завантажити сівозміну', error);
      if (active) {
        setPlantingsLoaded(true);
        setPlantingsError(true);
      }
    });
    return () => { active = false; };
  }, []));

  const totalM2 = fields.reduce((sum, field) => sum + selectedAreaM2(field), 0);
  const now = new Date();
  const currentYear = now.getFullYear();
  const availableSeasons = [...new Set([
    currentYear,
    ...(selectedSeason === null ? [] : [selectedSeason]),
    ...records.map(record => record.season),
    ...plantings.map(planting => planting.season),
  ])].sort((a, b) => b - a);
  const season = selectedSeason ?? availableSeasons[0];
  const seasonRecords = records.filter(record => record.season === season);
  const seasonPlantings = new Map(plantings.filter(planting => planting.season === season)
    .map(planting => [planting.fieldId, planting]));
  // As in the design: wheat in the wheat colour, every other recorded crop in green.
  const cropColor = (crop: string | null) =>
    (crop ? /пшениц/i.test(crop) ? theme.colors.accent : theme.colors.primary : theme.colors.border);
  const seasonAmounts = seasonRecords.filter(record => record.amountKopecks !== null)
    .map(record => record.amountKopecks as number);
  const spentKopecks = -seasonAmounts.filter(amount => amount < 0).reduce((sum, amount) => sum + amount, 0);
  const incomeKopecks = seasonAmounts.filter(amount => amount > 0).reduce((sum, amount) => sum + amount, 0);
  const fieldById = new Map(fields.map(field => [field.id, field]));
  const date = new Intl.DateTimeFormat('uk-UA', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date());

  return <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
    <View style={styles.heading}>
      <View style={styles.headingTop}>
        <Text style={styles.date}>{date.charAt(0).toUpperCase() + date.slice(1)}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Налаштування"
          onPress={() => navigation.navigate('Settings')} style={styles.settingsButton}>
          <AppIcon name="settings" color={theme.colors.textMuted} size={24} />
        </Pressable>
      </View>
      <Text style={styles.title} accessibilityRole="header">Моє господарство</Text>
    </View>
    <ScrollView contentContainerStyle={styles.content}>
      {loadState === 'loading' && <ActivityIndicator color={theme.colors.primary} size="large" />}
      {loadState === 'error' && <InfoCard>
        <Text style={styles.emptyTitle}>Не вдалося завантажити ділянки</Text>
        <Text style={styles.emptyText}>Перевірте інтернет і спробуйте ще раз.</Text>
        <AppButton label="Повторити" onPress={reload} />
      </InfoCard>}
      {loadState === 'ready' && fields.length === 0 && <>
        <InfoCard>
          <View style={styles.empty}>
            <View style={styles.iconCircle}><AppIcon name="map" color={theme.colors.primary} size={56} /></View>
            <Text style={styles.emptyTitle}>Додайте першу ділянку</Text>
            <Text style={styles.emptyText}>Обведіть її на карті, обійдіть з телефоном або введіть площу з документів. Це займе хвилину.</Text>
            <AppButton label="+ Додати ділянку" onPress={() => navigation.navigate('FieldMethod')} />
          </View>
        </InfoCard>
        <Text style={styles.hint}>Після цього тут з’являться ваша земля, роботи й гроші за сезон.</Text>
      </>}
      {loadState === 'ready' && fields.length > 0 && <>
        <View style={styles.yearSection}>
          <Text style={styles.yearLabel}>Рік урожаю</Text>
          <View style={styles.yearOptions}>
            {availableSeasons.map(year => <Pressable key={year} accessibilityRole="button"
              accessibilityState={{selected: season === year}}
              accessibilityLabel={`Сезон ${year}`}
              onPress={() => setSelectedSeason(year)}
              style={[styles.yearOption, season === year && styles.yearOptionSelected]}>
              <Text style={[styles.yearOptionText, season === year && styles.yearOptionTextSelected]}>{year}</Text>
            </Pressable>)}
          </View>
          {plantingsError && <Text style={styles.hint}>Не вдалося завантажити культури за роками.</Text>}
        </View>
        <InfoCard>
          <Text style={styles.summaryLabel}>Уся земля</Text>
          <View style={styles.totalRow}>
            <Text style={styles.total}>{formatHectares(totalM2)}</Text>
            <Text style={styles.subTotal}>{formatSotky(totalM2)}</Text>
          </View>
          <Text style={styles.hint}>Площа ділянок зараз · культури сезону {season}</Text>
          <View style={styles.bar} accessible={false}>
            {fields.map(field => <View key={field.id}
              style={[styles.segment, {flex: selectedAreaM2(field),
                backgroundColor: cropColor(seasonPlantings.get(field.id)?.crop ?? null)}]} />)}
          </View>
          {fields.map(field => <Pressable key={field.id} accessibilityRole="button" style={styles.fieldRow}
            onPress={() => navigation.navigate('FieldDetail', {fieldId: field.id})}>
            <View style={[styles.dot, {backgroundColor: cropColor(seasonPlantings.get(field.id)?.crop ?? null)}]} />
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>{field.name}</Text>
              <Text style={styles.rowDetail}>{[
                seasonPlantings.get(field.id)?.crop,
                seasonPlantings.get(field.id)?.variety,
              ].filter(Boolean).join(' · ') || (plantingsError
                ? 'Культуру не вдалося завантажити'
                : plantingsLoaded ? `${fieldTypeLabels[field.type]} · культуру не записано` : 'Завантажуємо культуру…')}</Text>
            </View>
            <Text style={styles.rowArea}>{formatArea(selectedAreaM2(field))}</Text>
          </Pressable>)}
        </InfoCard>
        <InfoCard>
          <View style={styles.seasonHeader}>
            <Text style={styles.seasonTitle}>Сезон {season}</Text>
            {(season === currentYear || (season === currentYear + 1 &&
              seasonRecords.some(record => Number(record.occurredOn.slice(0, 4)) === currentYear))) &&
              <View style={styles.badge}><Text style={styles.badgeText}>Іде зараз</Text></View>}
          </View>
          <View style={styles.moneyRow}>
            <Text style={styles.moneyLabel}>Витрачено</Text>
            {spentKopecks > 0
              ? <Text style={styles.moneyBig}>{formatMoney(spentKopecks)}</Text>
              : <Text style={styles.moneyMuted}>ще немає</Text>}
          </View>
          <View style={styles.moneyRow}>
            <Text style={styles.moneyLabel}>Доходи</Text>
            <Text style={styles.moneyMuted}>{incomeKopecks > 0 ? formatMoney(incomeKopecks) : 'ще немає'}</Text>
          </View>
          <AppButton label="Відкрити «Гроші» ›" variant="quiet"
            onPress={() => navigation.navigate('Tabs', {screen: 'Money'})} />
        </InfoCard>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Записи сезону</Text>
          {seasonRecords.length > 0 && <Pressable accessibilityRole="button" style={styles.link}
            onPress={() => navigation.navigate('Tabs', {screen: 'Journal'})}>
            <Text style={styles.linkText}>Усі записи</Text>
          </Pressable>}
        </View>
        {seasonRecords.length === 0
          ? <Text style={styles.hint}>У сезоні {season} записів ще немає. Натисніть «+ Записати» внизу, щоб додати роботу.</Text>
          : <InfoCard>
            <View style={styles.recordsCard}>
              {seasonRecords.slice(0, 3).map((record, index) => <RecordRow key={record.id} record={record} first={index === 0}
                field={record.fieldId === null ? undefined : fieldById.get(record.fieldId)}
                detail={record.fieldId === null ? 'Усе господарство'
                  : [fieldById.get(record.fieldId)?.name, seasonPlantings.get(record.fieldId)?.crop]
                    .filter(Boolean).join(' · ')}
                onPress={record.kind === 'work' ? () => navigation.navigate('WorkRecord', {recordId: record.id})
                  : record.kind === 'harvest' || record.kind === 'sale'
                    ? () => navigation.navigate('QuantityRecord', {kind: record.kind as 'harvest' | 'sale', recordId: record.id})
                    : record.kind === 'other' ? () => navigation.navigate('OtherRecord', {recordId: record.id})
                      : undefined} />)}
            </View>
          </InfoCard>}
      </>}
    </ScrollView>
  </SafeAreaView>;
}
