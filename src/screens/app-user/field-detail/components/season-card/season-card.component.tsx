import {t} from '../../../../../shared/config/i18n';
import {useStyles} from './season-card.styles';
import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {InfoCard} from '../../../../../shared/components/ui';
import type {Field} from '../../../../../shared/core/fields/model';
import type {FarmRecord} from '../../../../../shared/core/records/model';
import {formatKilograms, formatMoney} from '../../../../../shared/core/records/model';
import {summarizeSeason} from '../../../../../shared/core/records/seasonSummary';
import {RecordRow} from '../../../components/record-row/record-row.component';
import {YearStepper} from '../../../components/year-stepper/year-stepper.component';

type Props = {
  field: Field;
  season: number;
  onSeasonChange: (season: number) => void;
  records: FarmRecord[];
  onOpenRecord: (record: FarmRecord) => void;
  onShowAll: () => void;
};

const RECENT_COUNT = 5;

// The plot's money and work in one season: spent, earned, the result, the harvest and the latest records.
export function SeasonCard({field, season, onSeasonChange, records, onOpenRecord, onShowAll}: Props) {
  const styles = useStyles();
  const summary = summarizeSeason(records, season, field.id);
  const seasonRecords = records.filter(record => record.fieldId === field.id && record.season === season);
  const result = summary.resultKopecks;

  return <InfoCard>
    <Text style={styles.title}>{t("season", [], "after")}{season}</Text>
    <YearStepper value={season} onChange={onSeasonChange} />
    <View style={styles.row}>
      <Text style={styles.label}>{t("spent")}</Text>
      <Text style={styles.value}>{summary.expenseKopecks > 0 ? formatMoney(summary.expenseKopecks) : t("noneYet")}</Text>
    </View>
    <View style={styles.row}>
      <Text style={styles.label}>{t("incomeTotal")}</Text>
      <Text style={styles.value}>{summary.incomeKopecks > 0 ? formatMoney(summary.incomeKopecks) : t("noneYet")}</Text>
    </View>
    {(summary.expenseKopecks > 0 || summary.incomeKopecks > 0) && <View style={styles.row}>
      <Text style={styles.label}>{t("balance")}</Text>
      <Text style={[styles.result, result < 0 ? styles.loss : result > 0 ? styles.profit : null]}>
        {`${result < 0 ? '−' : result > 0 ? '+' : ''}${formatMoney(result)}`}
      </Text>
    </View>}
    {summary.harvestedKg > 0 && <View style={styles.row}>
      <Text style={styles.label}>{t("harvestedTotal")}</Text>
      <Text style={styles.value}>{formatKilograms(summary.harvestedKg)}</Text>
    </View>}
    {summary.expensesWithoutAmount > 0 && <Text style={styles.hint}>
      {t("jobsWithoutACost", [], "after")}{summary.expensesWithoutAmount}
    </Text>}
    <Text style={styles.subtitle}>{t("seasonRecords")}</Text>
    {seasonRecords.length === 0
      ? <Text style={styles.hint}>{t("noRecordsForThisSeasonYet")}</Text>
      : <View>
        {seasonRecords.slice(0, RECENT_COUNT).map((record, index) => <RecordRow key={record.id} record={record}
          field={field} first={index === 0} onPress={() => onOpenRecord(record)} />)}
      </View>}
    <Pressable accessibilityRole="button" onPress={onShowAll} style={styles.link}>
      <Text style={styles.linkText}>{t("allFieldRecords")}</Text>
    </Pressable>
  </InfoCard>;
}
