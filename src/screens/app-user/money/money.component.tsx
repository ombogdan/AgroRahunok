import {useStyles} from './money.styles';
import React from 'react';
import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import {AppButton, EmptyFeature, InfoCard, Page} from '../../../shared/components/ui';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import {formatArea, selectedAreaM2} from '../../../shared/core/fields/model';
import {useFarmData} from '../../../shared/core/offline/FarmDataProvider';
import {formatKilograms, formatMoney} from '../../../shared/core/records/model';
import {useRecords} from '../../../shared/core/records/RecordsProvider';
import {useSeason} from '../../../shared/core/records/SeasonProvider';
import {summarizeSeason, yieldForArea} from '../../../shared/core/records/seasonSummary';
import {useTheme} from '../../../shared/theme';

const number = (value: number) => new Intl.NumberFormat('uk-UA', {maximumFractionDigits: 1}).format(value);
const signedMoney = (value: number) => `${value < 0 ? '−' : value > 0 ? '+' : ''}${formatMoney(value)}`;


export function MoneyScreen() {
  const styles = useStyles();
  const {theme} = useTheme();
  const {fields} = useFields();
  const {records, loadState, reload} = useRecords();
  const {data} = useFarmData();
  const plantings = data.plantings;
  const {selectedSeason, setSelectedSeason} = useSeason();

  const availableSeasons = [...new Set([new Date().getFullYear(),
    ...(selectedSeason === null ? [] : [selectedSeason]),
    ...records.map(record => record.season), ...plantings.map(planting => planting.season)])]
    .sort((a, b) => b - a);
  const season = selectedSeason ?? availableSeasons[0];
  const seasonRecords = records.filter(record => record.season === season);
  const total = summarizeSeason(records, season);
  const hasMoney = total.incomeKopecks > 0 || total.expenseKopecks > 0;
  const activeFields = fields.filter(field => seasonRecords.some(record => record.fieldId === field.id));
  const seasonPlantings = new Map(plantings.filter(planting => planting.season === season)
    .map(planting => [planting.fieldId, planting]));
  const general = summarizeSeason(records, season, null);
  const hasGeneral = seasonRecords.some(record => record.fieldId === null);

  return <Page title="Гроші" subtitle="Результат із ваших записів">
    {loadState === 'loading' && <ActivityIndicator color={theme.colors.primary} size="large" />}
    {loadState === 'error' && <InfoCard>
      <Text style={styles.sectionTitle}>Не вдалося завантажити записи</Text>
      <Text style={styles.note}>Не вдалося відкрити дані на телефоні. Перезапустіть застосунок.</Text>
      <AppButton label="Повторити" onPress={reload} />
    </InfoCard>}
    {loadState === 'ready' && <>
      <View style={styles.chips}>
        {availableSeasons.map(year => <Pressable key={year} accessibilityRole="button"
          accessibilityState={{selected: year === season}} accessibilityLabel={`Сезон ${year}`}
          onPress={() => setSelectedSeason(year)} style={[styles.chip, year === season && styles.chipSelected]}>
          <Text style={[styles.chipText, year === season && styles.chipTextSelected]}>{year}</Text>
        </Pressable>)}
      </View>
      {seasonRecords.length === 0 ? <EmptyFeature icon="money" title="Записів за цей сезон ще немає"
        detail="Додайте роботу, збір урожаю або продаж — тут з’являться підсумки." /> : <>
        <InfoCard>
          <Text style={styles.label}>Результат сезону {season}</Text>
          <Text style={[styles.result, total.resultKopecks > 0 && styles.positive,
            total.resultKopecks < 0 && styles.negative]}>{signedMoney(total.resultKopecks)}</Text>
          <View style={styles.row}><Text style={styles.rowLabel}>Доходи</Text>
            <Text style={styles.rowValue}>{formatMoney(total.incomeKopecks)}</Text></View>
          <View style={styles.row}><Text style={styles.rowLabel}>Витрати</Text>
            <Text style={styles.rowValue}>{formatMoney(total.expenseKopecks)}</Text></View>
          {!hasMoney && <Text style={styles.note}>Суми ще не внесено.</Text>}
          {total.expensesWithoutAmount > 0 && <Text style={styles.note}>
            Робіт без вартості: {total.expensesWithoutAmount}. Результат і собівартість поки неповні.
          </Text>}
        </InfoCard>
        {total.harvestedKg > 0 && <InfoCard>
          <Text style={styles.sectionTitle}>Урожай сезону</Text>
          <View style={styles.row}><Text style={styles.rowLabel}>Зібрано</Text>
            <Text style={styles.rowValue}>{formatKilograms(total.harvestedKg)}</Text></View>
          {total.soldKg > 0 && <View style={styles.row}><Text style={styles.rowLabel}>Продано</Text>
            <Text style={styles.rowValue}>{formatKilograms(total.soldKg)}</Text></View>}
          <Text style={styles.note}>Собівартість рахуємо окремо для кожної ділянки нижче.</Text>
        </InfoCard>}
        {hasGeneral && <InfoCard>
          <Text style={styles.sectionTitle}>Загальні суми</Text>
          <View style={styles.row}><Text style={styles.rowLabel}>Доходи</Text>
            <Text style={styles.rowValue}>{formatMoney(general.incomeKopecks)}</Text></View>
          <View style={styles.row}><Text style={styles.rowLabel}>Витрати</Text>
            <Text style={styles.rowValue}>{formatMoney(general.expenseKopecks)}</Text></View>
          <Text style={styles.note}>Ці суми входять у результат господарства, але не розподілені між ділянками.</Text>
        </InfoCard>}
        {activeFields.length > 0 && <Text style={styles.sectionTitle}>За ділянками</Text>}
        {activeFields.map(field => {
          const summary = summarizeSeason(records, season, field.id);
          const planting = seasonPlantings.get(field.id);
          const areaM2 = planting?.areaM2 ?? selectedAreaM2(field);
          const cropYield = yieldForArea(summary.harvestedKg, areaM2);
          return <InfoCard key={field.id}>
            <Text style={styles.fieldName}>{field.name}</Text>
            <Text style={styles.note}>{[planting?.crop, formatArea(areaM2)].filter(Boolean).join(' · ')}</Text>
            <View style={styles.row}><Text style={styles.rowLabel}>Результат</Text>
              <Text style={styles.rowValue}>{signedMoney(summary.resultKopecks)}</Text></View>
            <View style={styles.row}><Text style={styles.rowLabel}>Доходи / витрати</Text>
              <Text style={styles.rowValue}>{formatMoney(summary.incomeKopecks)} / {formatMoney(summary.expenseKopecks)}</Text>
            </View>
            {summary.harvestedKg > 0 && <>
              <View style={styles.row}><Text style={styles.rowLabel}>Зібрано</Text>
                <Text style={styles.rowValue}>{formatKilograms(summary.harvestedKg)}</Text></View>
              {cropYield !== null && <View style={styles.row}>
                <Text style={styles.rowLabel}>Урожайність</Text>
                <Text style={styles.rowValue}>{number(cropYield)} {areaM2 < 5000 ? 'кг/сотку' : 'ц/га'}</Text>
              </View>}
              {summary.costPerKgKopecks !== null && <View style={styles.row}>
                <Text style={styles.rowLabel}>Ціна беззбитковості</Text>
                <Text style={styles.rowValue}>{formatMoney(summary.costPerKgKopecks)}/кг</Text>
              </View>}
              {summary.expensesWithoutAmount > 0 && <Text style={styles.note}>
                Ціну беззбитковості покажемо, коли додасте вартість усіх робіт.
              </Text>}
            </>}
          </InfoCard>;
        })}
      </>}
    </>}
  </Page>;
}
