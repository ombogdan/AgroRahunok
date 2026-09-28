import {getLanguage, t} from '../../../shared/config/i18n';
import React, {useState} from 'react';
import {Alert} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton, Page} from '../../../shared/components/ui';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import {useFarmData} from '../../../shared/core/offline/FarmDataProvider';
import type {RowPlanting} from '../../../shared/core/rows/model';
import {currentRows, parseRowRange} from '../../../shared/core/rows/model';
import {RowCountCard} from './components/row-count-card/row-count-card.component';
import {RowScheme} from './components/row-scheme/row-scheme.component';
import {RowVarietyForm} from './components/row-variety-form/row-variety-form.component';

type Props = NativeStackScreenProps<RootStackParamList, 'RowsSetup'>;

export function RowsSetupScreen({route, navigation}: Props) {
  const {fields} = useFields();
  const {data, store} = useFarmData();
  const field = fields.find(item => item.id === route.params.fieldId);
  const rows = currentRows(data.rows, route.params.fieldId);
  const [countInput, setCountInput] = useState('');
  const [firstInput, setFirstInput] = useState('1');
  const [lastInput, setLastInput] = useState('');
  const [variety, setVariety] = useState(field?.variety ?? '');
  const [yearInput, setYearInput] = useState(String(new Date().getFullYear()));
  const [saving, setSaving] = useState(false);

  if (!field) return <Page title={t("fieldNotFound")} onBack={() => navigation.goBack()} />;

  const requestedCount = Number(countInput);
  const canAdd = !!store && /^\d+$/.test(countInput) && requestedCount > rows.length &&
    requestedCount <= 200 && !saving;
  const range = parseRowRange(firstInput, lastInput, rows.length);
  const year = Number(yearInput);
  const canAssign = !!store && range !== null && /^\d{4}$/.test(yearInput) &&
    year >= 2000 && year <= new Date().getFullYear() + 1 && variety.trim().length > 0 && !saving;
  const lastRow = rows[rows.length - 1];
  const canRemoveLast = !!lastRow && lastRow.variety === null &&
    !data.rows.some(item => item.fieldId === field.id && item.rowNumber === lastRow.rowNumber && item.id !== lastRow.id);

  const addRows = async () => {
    if (!store || !canAdd) return;
    setSaving(true);
    try {
      await store.ensureRowCount(field.id, requestedCount);
      setCountInput('');
    } catch (error) {
      Alert.alert(t("couldNotAddRows"), getLanguage() === 'uk' && error instanceof Error ? error.message : t('pleaseTryAgain'));
    } finally { setSaving(false); }
  };

  const saveVariety = async () => {
    if (!store || !canAssign || !range) return;
    setSaving(true);
    try {
      await store.assignRowVariety(field.id, range.first, range.last, variety, year);
      setFirstInput('');
      setLastInput('');
      setVariety('');
    } catch (error) {
      Alert.alert(t("couldNotAssignVariety"), getLanguage() === 'uk' && error instanceof Error ? error.message : t('pleaseTryAgain'));
    } finally { setSaving(false); }
  };

  const removeLast = () => {
    if (!store || !canRemoveLast || saving) return;
    Alert.alert(t("confirmRemoveRowTitle", [lastRow.rowNumber]), t("onlyTheLastEmptyRowCanBeRemoved"), [
      {text: t("cancel"), style: 'cancel'},
      {text: t("remove"), style: 'destructive', onPress: () => {
        store.removeLastEmptyRow(field.id).catch(error => {
          Alert.alert(t("couldNotRemoveRow"), getLanguage() === 'uk' && error instanceof Error ? error.message : t('pleaseTryAgain'));
        });
      }},
    ]);
  };

  const selectRow = (row: RowPlanting) => {
    setFirstInput(String(row.rowNumber));
    setLastInput('');
    setVariety(row.variety ?? '');
    setYearInput(String(row.plantedYear ?? new Date().getFullYear()));
  };

  return <Page title={t("rowsAndVarieties")} subtitle={field.name} onBack={() => navigation.goBack()}>
    {rows.length === 0 && <RowCountCard count={0} value={countInput} onChange={setCountInput}
      canAdd={canAdd} saving={saving} onAdd={addRows} />}
    {rows.length > 0 && <>
      <RowVarietyForm rowCount={rows.length} first={firstInput} last={lastInput}
        onFirstChange={setFirstInput} onLastChange={setLastInput} variety={variety}
        onVarietyChange={setVariety} year={yearInput} onYearChange={setYearInput}
        canSave={canAssign} saving={saving} onSave={saveVariety} />
      <RowScheme fieldId={field.id} rows={rows} history={data.rows} onSelect={selectRow} />
      <RowCountCard count={rows.length} value={countInput} onChange={setCountInput}
        canAdd={canAdd} saving={saving} onAdd={addRows}
        canRemoveLast={canRemoveLast} onRemoveLast={removeLast} />
      <AppButton label={t("done")} variant="secondary" onPress={() => navigation.goBack()} />
    </>}
  </Page>;
}
