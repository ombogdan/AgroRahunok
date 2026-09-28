import {t} from '../../../shared/config/i18n';
import {useStyles} from './field-detail.styles';
import React from 'react';
import {Alert, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton, InfoCard, Page} from '../../../shared/components/ui';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import {fieldTypeLabels, formatArea, selectedAreaM2} from '../../../shared/core/fields/model';
import {useFarmData} from '../../../shared/core/offline/FarmDataProvider';
import {formatKilograms} from '../../../shared/core/records/model';
import {useSeason} from '../../../shared/core/records/SeasonProvider';
import {currentRows, rowsForSeason, varietyGroups} from '../../../shared/core/rows/model';
import {logSupabaseError} from '../../../shared/core/supabase/errors';
import {FieldMapPreview} from '../../../shared/components/field-map-preview/field-map-preview.component';
import {fieldRotation} from '../../../shared/core/rotation/model';
import {RotationCard} from './components/rotation-card/rotation-card.component';

type Props = NativeStackScreenProps<RootStackParamList, 'FieldDetail'>;


function AreaRow({label, areaM2, selected}: {label: string; areaM2: number; selected: boolean}) {
  const styles = useStyles();
  return <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    {selected && <View style={styles.badge}><Text style={styles.badgeText}>{t("usedInCalculations")}</Text></View>}
    <Text style={styles.rowValue}>{formatArea(areaM2)}</Text>
  </View>;
}

export function FieldDetailScreen({route, navigation}: Props) {
  const styles = useStyles();
  const {fields, removeField} = useFields();
  const {data} = useFarmData();
  const {selectedSeason} = useSeason();
  const field = fields.find(item => item.id === route.params.fieldId);
  const rows = currentRows(data.rows, route.params.fieldId);
  const season = selectedSeason ?? new Date().getFullYear();
  const groups = varietyGroups(rowsForSeason(data.rows, route.params.fieldId, season));
  const harvests = data.records.filter(record => record.fieldId === route.params.fieldId &&
    record.kind === 'harvest' && record.season === season);
  if (!field) return <Page title={t("fieldNotFound")} onBack={() => navigation.goBack()} />;

  const confirmDelete = () => Alert.alert(t("confirmDeleteFieldTitle"),
    t("namedItemDeletionWarning", [field.name]), [
      {text: t("cancel"), style: 'cancel'},
      {text: t("delete"), style: 'destructive', onPress: () => {
        removeField(field.id).then(() => navigation.goBack())
          .catch(error => {
            logSupabaseError(t("couldNotDeleteField"), error);
            Alert.alert(t("couldNotDeleteField"), t("couldNotSaveChangesOnThePhone"));
          });
      }},
    ]);

  const subtitle = [t(fieldTypeLabels[field.type]), field.crop,
    rows.length > 0 ? null : field.variety].filter(Boolean).join(' · ');

  return <Page title={field.name} subtitle={subtitle} onBack={() => navigation.goBack()}>
    {field.type === 'berries' && <AppButton
      label={rows.length > 0 ? t("rowsAndVarietiesCount", [rows.length]) : t("addRowsAndVarieties")}
      variant="secondary" onPress={() => navigation.navigate('RowsSetup', {fieldId: field.id})} />}
    {field.polygon.length >= 3 && <FieldMapPreview polygon={field.polygon} />}
    <InfoCard>
      <Text style={styles.label}>{t("areaUsedInCalculations")}</Text>
      <Text style={styles.metric}>{formatArea(selectedAreaM2(field))}</Text>
      {field.documentAreaM2 !== null && <AreaRow label={t("documentedAreaOption")} areaM2={field.documentAreaM2}
        selected={field.areaSource === 'document'} />}
      {field.measuredAreaM2 !== null && <AreaRow label={t("measuredArea")} areaM2={field.measuredAreaM2}
        selected={field.areaSource === 'measured'} />}
    </InfoCard>
    {/* The current crop is the rotation line marked «Іде зараз». */}
    <RotationCard field={field} rotation={fieldRotation(data.plantings, field.id)} records={data.records}
      onOpen={plantingSeason => navigation.navigate('PlantingForm', {fieldId: field.id, season: plantingSeason})}
      onAdd={() => navigation.navigate('PlantingForm', {fieldId: field.id})} />
    {(field.type === 'berries' || rows.length > 0) && <InfoCard>
      <Text style={styles.sectionTitle}>{t("rowsAndVarieties")}</Text>
      {rows.length === 0 ? <Text style={styles.hint}>{t("enterTheNumberOfRowsAndAssignAVarietyToEachOne", [], "both")}</Text> : <>
        <Text style={styles.hint}>{t("rowsCountPrefix", [], "after")}{rows.length}</Text>
        <Text style={styles.hint}>{t("varietiesAndSeasonalHarvest", [], "after")}{season}</Text>
        {groups.map(group => {
          const totalKg = harvests.filter(record =>
            record.details.varietySnapshot?.toLocaleLowerCase('uk') === group.variety.toLocaleLowerCase('uk'))
            .reduce((sum, record) => sum + (record.quantityKg ?? 0), 0);
          return <View key={group.variety} style={styles.row}>
            <Text style={styles.rowLabel}>{group.variety}{t("rowsSuffix", [], "both")}{group.rows.map(item => item.rowNumber).join(', ')}</Text>
            {totalKg > 0 && <Text style={styles.rowValue}>{formatKilograms(totalKg)}</Text>}
          </View>;
        })}
        {groups.length === 0 && <Text style={styles.hint}>{t("noRowVarietiesRecordedForThisSeasonYet")}</Text>}
        {rows.some(row => row.variety === null) && <Text style={styles.hint}>{t("noVariety", [], "both")}{rows.filter(row => row.variety === null).map(row => row.rowNumber).join(', ')}
        </Text>}
        {harvests.some(record => !record.details.varietySnapshot) && <Text style={styles.hint}>{t("harvestsWithoutVarietyNotice", [], "both")}</Text>}
      </>}
      <AppButton label={rows.length ? t("editRowsAndVarieties") : t("addRows")} variant="secondary"
        onPress={() => navigation.navigate('RowsSetup', {fieldId: field.id})} />
    </InfoCard>}
    {field.type !== 'berries' && rows.length === 0 && field.type !== 'field' &&
      <AppButton label={t("trackVarietiesByRow")} variant="quiet"
        onPress={() => navigation.navigate('RowsSetup', {fieldId: field.id})} />}
    <AppButton label={t("edit")} variant="secondary"
      onPress={() => navigation.navigate('FieldForm', {mode: 'edit', fieldId: field.id})} />
    <AppButton label={t("deleteField")} variant="danger" onPress={confirmDelete} />
  </Page>;
}
