import React from 'react';
import {ActivityIndicator, Pressable, ScrollView, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton, AppIcon, InfoCard} from '../../../shared/components/ui';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import {fieldTypeLabels, formatArea, formatHectares, formatSotky, selectedAreaM2} from '../../../shared/core/fields/model';
import {formatMoney, seasonFor} from '../../../shared/core/records/model';
import {useRecords} from '../../../shared/core/records/RecordsProvider';
import {useTheme, useThemedStyles} from '../../../shared/theme';
import type {AppTheme} from '../../../shared/theme/theme';
import {useRootNavigation} from '../../../navigation/useRootNavigation';
import {RecordRow} from '../records';

const createStyles = (theme: AppTheme) => ({
  safe: {flex: 1, backgroundColor: theme.colors.background},
  content: {paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, gap: 32},
  heading: {gap: 4, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, backgroundColor: theme.colors.background},
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
  const totalM2 = fields.reduce((sum, field) => sum + selectedAreaM2(field), 0);
  // As in the design: wheat in the wheat colour, every other crop in green.
  const cropColor = (crop: string | null) =>
    (crop && /пшениц/i.test(crop) ? theme.colors.accent : theme.colors.primary);
  // The latest season with records, or the one a new record would fall into today.
  const now = new Date();
  const season = records.length > 0 ? Math.max(...records.map(record => record.season)) : seasonFor(now, null);
  const seasonAmounts = records.filter(record => record.season === season && record.amountKopecks !== null)
    .map(record => record.amountKopecks as number);
  const spentKopecks = -seasonAmounts.filter(amount => amount < 0).reduce((sum, amount) => sum + amount, 0);
  const incomeKopecks = seasonAmounts.filter(amount => amount > 0).reduce((sum, amount) => sum + amount, 0);
  const fieldById = new Map(fields.map(field => [field.id, field]));
  const date = new Intl.DateTimeFormat('uk-UA', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date());

  return <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
    <View style={styles.heading}>
      <Text style={styles.date}>{date.charAt(0).toUpperCase() + date.slice(1)}</Text>
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
        <InfoCard>
          <Text style={styles.summaryLabel}>Уся земля</Text>
          <View style={styles.totalRow}>
            <Text style={styles.total}>{formatHectares(totalM2)}</Text>
            <Text style={styles.subTotal}>{formatSotky(totalM2)}</Text>
          </View>
          <View style={styles.bar} accessible={false}>
            {fields.map(field => <View key={field.id}
              style={[styles.segment, {flex: selectedAreaM2(field), backgroundColor: cropColor(field.crop)}]} />)}
          </View>
          {fields.map(field => <Pressable key={field.id} accessibilityRole="button" style={styles.fieldRow}
            onPress={() => navigation.navigate('FieldDetail', {fieldId: field.id})}>
            <View style={[styles.dot, {backgroundColor: cropColor(field.crop)}]} />
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>{field.name}</Text>
              <Text style={styles.rowDetail}>{[field.crop, field.variety].filter(Boolean).join(' · ') || fieldTypeLabels[field.type]}</Text>
            </View>
            <Text style={styles.rowArea}>{formatArea(selectedAreaM2(field))}</Text>
          </Pressable>)}
        </InfoCard>
        <InfoCard>
          <View style={styles.seasonHeader}>
            <Text style={styles.seasonTitle}>Сезон {season}</Text>
            {season >= now.getFullYear() && <View style={styles.badge}><Text style={styles.badgeText}>Іде зараз</Text></View>}
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
          <Text style={styles.sectionTitle}>Останні записи</Text>
          {records.length > 0 && <Pressable accessibilityRole="button" style={styles.link}
            onPress={() => navigation.navigate('Tabs', {screen: 'Journal'})}>
            <Text style={styles.linkText}>Усі записи</Text>
          </Pressable>}
        </View>
        {records.length === 0
          ? <Text style={styles.hint}>Натисніть «+ Записати» внизу, щоб додати першу роботу.</Text>
          : <InfoCard>
            <View style={styles.recordsCard}>
              {records.slice(0, 3).map((record, index) => <RecordRow key={record.id} record={record} first={index === 0}
                field={fieldById.get(record.fieldId)}
                onPress={record.kind === 'work' ? () => navigation.navigate('WorkRecord', {recordId: record.id}) : undefined} />)}
            </View>
          </InfoCard>}
      </>}
      <AppButton label="Налаштування" variant="quiet" onPress={() => navigation.navigate('Settings')} />
    </ScrollView>
  </SafeAreaView>;
}
