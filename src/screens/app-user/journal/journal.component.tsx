import {t} from '../../../shared/config/i18n';
import {useStyles} from './journal.styles';
import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Pressable, ScrollView, Text, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {MainTabParamList} from '../../../navigation/types';
import {useRootNavigation} from '../../../navigation/useRootNavigation';
import {AppButton, EmptyFeature, InfoCard, Page} from '../../../shared/components/ui';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import type {FarmRecord} from '../../../shared/core/records/model';
import {dateLabel} from '../../../shared/core/records/model';
import {useRecords} from '../../../shared/core/records/RecordsProvider';
import {useTheme} from '../../../shared/theme';
import {RecordRow} from '../components/record-row/record-row.component';
import {openRecord} from '../components/record-row/open-record';


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
  const styles = useStyles();
  const {theme, isDark} = useTheme();
  const navigation = useRootNavigation();
  const {fields} = useFields();
  const {records, loadState, reload} = useRecords();
  const [fieldFilter, setFieldFilter] = useState<string | null>(null);
  // A plot's card opens the journal filtered to it; the request is cleared so the next one applies again.
  const tabNavigation = useNavigation<BottomTabNavigationProp<MainTabParamList, 'Journal'>>();
  const requestedFieldId = useRoute<RouteProp<MainTabParamList, 'Journal'>>().params?.fieldId;
  useEffect(() => {
    if (!requestedFieldId) return;
    setFieldFilter(requestedFieldId);
    tabNavigation.setParams({fieldId: undefined});
  }, [requestedFieldId, tabNavigation]);
  const fieldById = useMemo(() => new Map(fields.map(field => [field.id, field])), [fields]);
  const visible = fieldFilter ? records.filter(record => record.fieldId === fieldFilter) : records;
  const groups = useMemo(() => groupByDay(visible), [visible]);

  return <Page title={t("logbook")}>
    {loadState === 'loading' && <ActivityIndicator color={theme.colors.primary} size="large" />}
    {loadState === 'error' && <InfoCard>
      <Text style={styles.errorTitle}>{t("couldNotLoadRecords")}</Text>
      <Text style={styles.muted}>{t("couldNotOpenDataOnThePhoneRestartTheApp")}</Text>
      <AppButton label={t("tryAgain")} onPress={reload} />
    </InfoCard>}
    {loadState === 'ready' && records.length === 0 && <EmptyFeature
      icon="journal"
      title={t("noRecordsYet")}
      detail={fields.length > 0
        ? t("tapAddRecordBelowToLogYourFirstJob")
        : t("addAFieldFirstWorkHarvestsAndSalesWillAppearHere")}
    />}
    {loadState === 'ready' && records.length > 0 && <>
      {fields.length > 1 && <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}>
        {[{id: null, name: t("all")}, ...fields].map(item => {
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
            field={record.fieldId === null ? undefined : fieldById.get(record.fieldId)}
            onPress={() => openRecord(navigation, record)} />)}
        </View>
      </View>)}
    </>}
  </Page>;
}
