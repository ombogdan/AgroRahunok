import {localeTag, t} from '../../../shared/config/i18n';
import {useStyles} from './home.styles';
import React from 'react';
import {ActivityIndicator, Pressable, ScrollView, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton, AppIcon, InfoCard} from '../../../shared/components/ui';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import {
  fieldTypeLabels,
  formatArea,
  formatHectares,
  formatSotky,
  selectedAreaM2
} from '../../../shared/core/fields/model';
import {useFarmData} from '../../../shared/core/offline/FarmDataProvider';
import {rowsForSeason, varietyGroups} from '../../../shared/core/rows/model';
import {formatMoney} from '../../../shared/core/records/model';
import {useRecords} from '../../../shared/core/records/RecordsProvider';
import {useSeason} from '../../../shared/core/records/SeasonProvider';
import {useTheme} from '../../../shared/theme';
import {useRootNavigation} from '../../../navigation/useRootNavigation';
import {RecordRow} from '../components/record-row/record-row.component';


export function HomeScreen() {
  const styles = useStyles();
  const {theme} = useTheme();
  const navigation = useRootNavigation();
  const {fields, loadState, reload} = useFields();
  const {records} = useRecords();
  const {data, pendingCount, syncState} = useFarmData();
  const plantings = data.plantings;
  const {selectedSeason, setSelectedSeason} = useSeason();

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
  const date = new Intl.DateTimeFormat(localeTag(), {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date());

  return <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
    <View style={styles.heading}>
      <View style={styles.headingTop}>
        <Text style={styles.date}>{date.charAt(0).toUpperCase() + date.slice(1)}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={t("settings")}
                   onPress={() => navigation.navigate('Settings')} style={styles.settingsButton}>
          <AppIcon name="settings" color={theme.colors.textMuted} size={24}/>
        </Pressable>
      </View>
      <Text style={styles.title} accessibilityRole="header">{t("myFarm")}</Text>
    </View>
    <ScrollView contentContainerStyle={styles.content}>
      {loadState === 'ready' && pendingCount > 0 && <Text style={styles.syncHint}>
        {syncState === 'syncing' ? t("syncing") : t("pendingSyncCount", [pendingCount])}
      </Text>}
      {loadState === 'loading' && <ActivityIndicator color={theme.colors.primary} size="large"/>}
      {loadState === 'error' && <InfoCard>
        <Text style={styles.emptyTitle}>{t("couldNotLoadFields")}</Text>
        <Text style={styles.emptyText}>{t("couldNotOpenDataOnThePhoneRestartTheApp")}</Text>
        <AppButton label={t("tryAgain")} onPress={reload}/>
      </InfoCard>}
      {loadState === 'ready' && fields.length === 0 && <>
        <InfoCard>
          <View style={styles.empty}>
            <View style={styles.iconCircle}><AppIcon name="map" color={theme.colors.primary} size={56}/></View>
            <Text style={styles.emptyTitle}>{t("addYourFirstField")}</Text>
            <Text style={styles.emptyText}>{t("addFieldMethodsDescription")}</Text>
            <AppButton label={t("addField")} onPress={() => navigation.navigate('FieldMethod')}/>
          </View>
        </InfoCard>
        <Text style={styles.hint}>{t("homeEmptySeasonDescription")}</Text>
      </>}
      {loadState === 'ready' && fields.length > 0 && <>
        <View style={styles.yearSection}>
          <Text style={styles.yearLabel}>{t("harvestYear")}</Text>
          <View style={styles.yearOptions}>
            {availableSeasons.map(year => <Pressable key={year} accessibilityRole="button"
                                                     accessibilityState={{selected: season === year}}
                                                     accessibilityLabel={t("seasonYear", [year])}
                                                     onPress={() => setSelectedSeason(year)}
                                                     style={[styles.yearOption, season === year && styles.yearOptionSelected]}>
              <Text style={[styles.yearOptionText, season === year && styles.yearOptionTextSelected]}>{year}</Text>
            </Pressable>)}
          </View>
        </View>
        <InfoCard>
          <Text style={styles.summaryLabel}>{t("totalLand")}</Text>
          <View style={styles.totalRow}>
            <Text style={styles.total}>{formatHectares(totalM2)}</Text>
            <Text style={styles.subTotal}>{formatSotky(totalM2)}</Text>
          </View>
          <Text style={styles.hint}>{t("currentFieldAreaSeasonCrops", [], "after")}{season}</Text>
          <View style={styles.bar} accessible={false}>
            {fields.map(field =>
              <View key={field.id}
                    style={[styles.segment, {
                      flex: selectedAreaM2(field),
                      backgroundColor: cropColor(seasonPlantings.get(field.id)?.crop ?? null)
                    }]}/>)}
          </View>
          {fields.map(field => {
            const rowVarieties = varietyGroups(rowsForSeason(data.rows, field.id, season))
              .map(group => group.variety);
            const cropDetails = [seasonPlantings.get(field.id)?.crop ?? field.crop,
              rowVarieties.length > 0 ? rowVarieties.join(', ') : seasonPlantings.get(field.id)?.variety]
              .filter(Boolean).join(' · ');
            return (
              <Pressable
                key={field.id}
                accessibilityRole="button"
                style={styles.fieldRow}
                onPress={() => navigation.navigate('FieldDetail', {fieldId: field.id})}>
                <View style={[styles.dot, {backgroundColor: cropColor(seasonPlantings.get(field.id)?.crop ?? null)}]}/>
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle}>{field.name}</Text>
                  <Text
                    style={styles.rowDetail}>{cropDetails || t("cropNotRecordedForField", [t(fieldTypeLabels[field.type])])}</Text>
                </View>
                <Text style={styles.rowArea}>{formatArea(selectedAreaM2(field))}</Text>
              </Pressable>);
          })}
        </InfoCard>
        <InfoCard>
          <View style={styles.seasonHeader}>
            <Text style={styles.seasonTitle}>{t("season", [], "after")}{season}</Text>
            {(season === currentYear || (season === currentYear + 1 &&
                seasonRecords.some(record => Number(record.occurredOn.slice(0, 4)) === currentYear))) &&
              <View style={styles.badge}><Text style={styles.badgeText}>{t("inProgress")}</Text></View>}
          </View>
          <View style={styles.moneyRow}>
            <Text style={styles.moneyLabel}>{t("spent")}</Text>
            {spentKopecks > 0
              ? <Text style={styles.moneyBig}>{formatMoney(spentKopecks)}</Text>
              : <Text style={styles.moneyMuted}>{t("noneYet")}</Text>}
          </View>
          <View style={styles.moneyRow}>
            <Text style={styles.moneyLabel}>{t("incomeTotal")}</Text>
            <Text style={styles.moneyMuted}>{incomeKopecks > 0 ? formatMoney(incomeKopecks) : t("noneYet")}</Text>
          </View>
          <AppButton
            label={t("openFinances")}
            variant="quiet"
            onPress={() => navigation.navigate('Tabs', {screen: 'Money'})}/>
        </InfoCard>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("seasonRecords")}</Text>
          {seasonRecords.length > 0 &&
            <Pressable
              accessibilityRole="button"
              style={styles.link}
              onPress={() => navigation.navigate('Tabs', {screen: 'Journal'})}>
              <Text style={styles.linkText}>{t("allRecords")}</Text>
            </Pressable>}
        </View>
        {seasonRecords.length === 0
          ? <Text style={styles.hint}>{t("inSeason", [], "both")}{season}{t("noRecordsYetTapAddRecordBelowToLogWork", [], "both")}</Text>
          : <InfoCard>
            <View style={styles.recordsCard}>
              {seasonRecords.slice(0, 3).map((record, index) =>
                <RecordRow
                  key={record.id}
                  record={record}
                  first={index === 0}
                  field={record.fieldId === null ? undefined : fieldById.get(record.fieldId)}
                  detail={record.fieldId === null ? t("wholeFarm")
                    : [fieldById.get(record.fieldId)?.name, seasonPlantings.get(record.fieldId)?.crop]
                      .filter(Boolean).join(' · ')}
                  onPress={record.kind === 'work' ? () => navigation.navigate('WorkRecord', {recordId: record.id})
                    : record.kind === 'harvest' || record.kind === 'sale'
                      ? () => navigation.navigate('QuantityRecord', {
                        kind: record.kind as 'harvest' | 'sale',
                        recordId: record.id
                      })
                      : record.kind === 'other' ? () => navigation.navigate('OtherRecord', {recordId: record.id})
                        : undefined}/>)}
            </View>
          </InfoCard>}
      </>}
    </ScrollView>
  </SafeAreaView>;
}
