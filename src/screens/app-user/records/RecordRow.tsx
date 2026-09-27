import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {AppIcon} from '../../../shared/components/ui';
import type {AppIconName} from '../../../shared/components/ui/AppIcon';
import type {Field} from '../../../shared/core/fields/model';
import type {FarmRecord} from '../../../shared/core/records/model';
import {formatKilograms, formatMoney, workTypeLabels} from '../../../shared/core/records/model';
import {useTheme, useThemedStyles} from '../../../shared/theme';
import type {AppTheme} from '../../../shared/theme/theme';

const kindTitles = {harvest: 'Збір урожаю', sale: 'Продаж', other: 'Інша витрата чи дохід'} as const;
const kindIcons = {harvest: 'basket', sale: 'cash', other: 'plusMinus'} as const;

export function recordTitle(record: FarmRecord): string {
  if (record.kind === 'work') return record.workType ? workTypeLabels[record.workType] : 'Робота';
  if (record.kind === 'other') return record.details.category || kindTitles.other;
  return kindTitles[record.kind];
}

export function recordIcon(record: FarmRecord): AppIconName {
  if (record.kind === 'work') return record.workType ?? 'spade';
  return kindIcons[record.kind];
}

// Expenses read «−3 000 грн», income «+960 грн» (U+2212 minus, as in the design).
export function signedMoney(kopecks: number): string {
  return `${kopecks < 0 ? '−' : '+'}${formatMoney(kopecks)}`;
}

const createStyles = (theme: AppTheme) => ({
  row: {minHeight: 72, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12, paddingVertical: 12},
  divider: {borderTopWidth: 1, borderTopColor: theme.colors.border},
  circle: {width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primarySoft,
    alignItems: 'center' as const, justifyContent: 'center' as const},
  body: {flex: 1, gap: 2},
  title: {color: theme.colors.text, fontSize: 17, fontWeight: '600' as const},
  detail: {color: theme.colors.textMuted, fontSize: 15, lineHeight: 20},
  expense: {color: theme.colors.text, fontSize: 17, fontWeight: '600' as const},
  income: {color: theme.colors.primary, fontSize: 17, fontWeight: '600' as const},
  quantity: {color: theme.colors.text, fontSize: 17, fontWeight: '600' as const},
});

export function RecordRow({record, field, first, detail, onPress}: {
  record: FarmRecord;
  field?: Field;
  first?: boolean;
  detail?: string;
  onPress?: () => void;
}) {
  const styles = useThemedStyles(createStyles);
  const {theme} = useTheme();
  const quantityDetail = record.details.enteredQuantity && record.details.unitName
    ? `${new Intl.NumberFormat('uk-UA', {maximumFractionDigits: 3}).format(record.details.enteredQuantity)} × ${record.details.unitName}`
    : null;
  const location = detail ?? (record.fieldId === null ? 'Усе господарство'
    : [field?.name, field?.crop].filter(Boolean).join(' · '));
  const subtitle = [location, quantityDetail, record.kind === 'sale' ? record.details.buyer : null]
    .filter(Boolean).join(' · ');
  return <Pressable accessibilityRole="button" disabled={!onPress} onPress={onPress}
    style={[styles.row, !first && styles.divider]}>
    <View style={styles.circle}><AppIcon name={recordIcon(record)} color={theme.colors.primary} size={24} /></View>
    <View style={styles.body}>
      <Text style={styles.title}>{recordTitle(record)}</Text>
      {subtitle ? <Text style={styles.detail} numberOfLines={2}>{subtitle}</Text> : null}
    </View>
    {record.amountKopecks !== null && record.amountKopecks !== 0 &&
      <Text style={record.amountKopecks < 0 ? styles.expense : styles.income}>{signedMoney(record.amountKopecks)}</Text>}
    {record.kind === 'harvest' && record.quantityKg !== null &&
      <Text style={styles.quantity}>{formatKilograms(record.quantityKg)}</Text>}
  </Pressable>;
}
