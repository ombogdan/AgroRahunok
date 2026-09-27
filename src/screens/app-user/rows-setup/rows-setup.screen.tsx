import React, {useEffect, useState} from 'react';
import {Alert} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton, Page} from '../../../shared/components/ui';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import {useFarmData} from '../../../shared/core/offline/FarmDataProvider';
import type {RowPlanting} from '../../../shared/core/rows/model';
import {currentRows} from '../../../shared/core/rows/model';
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

  useEffect(() => {
    if (rows.length > 0) setLastInput(previous => previous || String(rows.length));
  }, [rows.length]);

  if (!field) return <Page title="Ділянку не знайдено" onBack={() => navigation.goBack()} />;

  const requestedCount = Number(countInput);
  const canAdd = !!store && /^\d+$/.test(countInput) && requestedCount > rows.length &&
    requestedCount <= 200 && !saving;
  const first = Number(firstInput);
  const last = Number(lastInput);
  const year = Number(yearInput);
  const canAssign = !!store && /^\d+$/.test(firstInput) && /^\d+$/.test(lastInput) &&
    /^\d{4}$/.test(yearInput) && first >= 1 && last >= first && last <= rows.length &&
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
      Alert.alert('Не вдалося додати ряди', error instanceof Error ? error.message : 'Спробуйте ще раз.');
    } finally { setSaving(false); }
  };

  const saveVariety = async () => {
    if (!store || !canAssign) return;
    setSaving(true);
    try {
      await store.assignRowVariety(field.id, first, last, variety, year);
      setFirstInput('');
      setLastInput('');
      setVariety('');
    } catch (error) {
      Alert.alert('Не вдалося призначити сорт', error instanceof Error ? error.message : 'Спробуйте ще раз.');
    } finally { setSaving(false); }
  };

  const removeLast = () => {
    if (!store || !canRemoveLast || saving) return;
    Alert.alert(`Прибрати ряд №${lastRow.rowNumber}?`, 'Можна прибрати лише порожній останній ряд.', [
      {text: 'Скасувати', style: 'cancel'},
      {text: 'Прибрати', style: 'destructive', onPress: () => {
        store.removeLastEmptyRow(field.id).catch(error => {
          Alert.alert('Не вдалося прибрати ряд', error instanceof Error ? error.message : 'Спробуйте ще раз.');
        });
      }},
    ]);
  };

  const selectRow = (row: RowPlanting) => {
    setFirstInput(String(row.rowNumber));
    setLastInput(String(row.rowNumber));
    setVariety(row.variety ?? '');
    setYearInput(String(row.plantedYear ?? new Date().getFullYear()));
  };

  return <Page title="Ряди та сорти" subtitle={field.name} onBack={() => navigation.goBack()}>
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
      <AppButton label="Готово" variant="secondary" onPress={() => navigation.goBack()} />
    </>}
  </Page>;
}
