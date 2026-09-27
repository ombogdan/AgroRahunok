import React, {useMemo, useState} from 'react';
import {ActivityIndicator, Pressable, ScrollView, Text, View} from 'react-native';
import {useRootNavigation} from '../../../navigation/useRootNavigation';
import {AppButton, EmptyFeature, InfoCard, Page} from '../../../shared/components/ui';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import type {FarmRecord} from '../../../shared/core/records/model';
import {dateLabel} from '../../../shared/core/records/model';
import {useRecords} from '../../../shared/core/records/RecordsProvider';
import {useTheme, useThemedStyles} from '../../../shared/theme';
import type {AppTheme} from '../../../shared/theme/theme';
import {RecordRow} from '../records';

const createStyles = (theme: AppTheme) => ({
  filters: {gap: 8, paddingRight: 20},
  chip: {minHeight: 44, paddingHorizontal: 15, borderRadius: 999, borderWidth: 2,
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface, justifyContent: 'center' as const},
  chipSelected: {borderColor: theme.colors.primary, backgroundColor: theme.colors.primary},
  chipText: {color: theme.colors.text, fontSize: 17, fontWeight: '600' as const},
  chipTextSelected: {color: theme.colors.onPrimary},
  group: {gap: 8},
  day: {color: theme.colors.textMuted, fontSize: 15, fontWeight: '600' as const},
  // Rows carry their own padding and dividers, so the card has no inner gap.
  card: {backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: 20, paddingHorizontal: 16},
  cardShadow: {shadowColor: '#193327', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, elevation: 2},
  errorTitle: {color: theme.colors.text, fontSize: 22, fontWeight: '700' as const},
  muted: {color: theme.colors.textMuted, fontSize: 17, lineHeight: 24},
});

function groupByDay(records: FarmRecord[]): {day: string; items: FarmRecord[]}[] {
  const groups: {day: string; items: FarmRecord[]}[] = [];
  for (const record of records) {
    const last = groups[groups.length - 1];
    if (last && last.day === record.occurredOn) last.items.push(record);
    else groups.push({day: record.occurredOn, items: [record]});
  }
  return groups;
}

export function JournalScreen() {
  const styles = useThemedStyles(createStyles);
  const {theme, isDark} = useTheme();
  const navigation = useRootNavigation();
  const {fields} = useFields();
  const {records, loadState, reload} = useRecords();
  const [fieldFilter, setFieldFilter] = useState<string | null>(null);
  const fieldById = useMemo(() => new Map(fields.map(field => [field.id, field])), [fields]);
  const visible = fieldFilter ? records.filter(record => record.fieldId === fieldFilter) : records;
  const groups = useMemo(() => groupByDay(visible), [visible]);

  return <Page title="Журнал">
    {loadState === 'loading' && <ActivityIndicator color={theme.colors.primary} size="large" />}
    {loadState === 'error' && <InfoCard>
      <Text style={styles.errorTitle}>Не вдалося завантажити записи</Text>
      <Text style={styles.muted}>Перевірте інтернет і спробуйте ще раз.</Text>
      <AppButton label="Повторити" onPress={reload} />
    </InfoCard>}
    {loadState === 'ready' && records.length === 0 && <EmptyFeature
      icon="journal"
      title="Записів ще немає"
      detail={fields.length > 0
        ? 'Натисніть «+ Записати» внизу, щоб додати першу роботу.'
        : 'Спершу додайте ділянку, потім тут з’являться роботи, збори й продажі.'}
    />}
    {loadState === 'ready' && records.length > 0 && <>
      {fields.length > 1 && <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}>
        {[{id: null, name: 'Усі'}, ...fields].map(item => {
          const selected = fieldFilter === item.id;
          return <Pressable key={item.id ?? 'all'} accessibilityRole="button" accessibilityState={{selected}}
            onPress={() => setFieldFilter(item.id)} style={[styles.chip, selected && styles.chipSelected]}>
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{item.name}</Text>
          </Pressable>;
        })}
      </ScrollView>}
      {groups.map(group => <View key={group.day} style={styles.group}>
        <Text style={styles.day}>{dateLabel(group.day)}</Text>
        <View style={[styles.card, !isDark && styles.cardShadow]}>
          {group.items.map((record, index) => <RecordRow key={record.id} record={record} first={index === 0}
            field={fieldById.get(record.fieldId)}
            onPress={record.kind === 'work' ? () => navigation.navigate('WorkRecord', {recordId: record.id}) : undefined} />)}
        </View>
      </View>)}
    </>}
  </Page>;
}
