import {Chip} from '../components/record-chip/record-chip.component';
import {RowSelection} from '../components/row-selection/row-selection.component';
import {useStyles} from './quantity-record.styles';
import React, {useState} from 'react';
import {
  Alert, InputAccessoryView, Keyboard, Platform, Pressable, ScrollView, Text, TextInput, View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton, CalendarDatePicker, useToast} from '../../../shared/components/ui';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import {formatArea, parsePositiveNumber, selectedAreaM2} from '../../../shared/core/fields/model';
import {useRecords} from '../../../shared/core/records/RecordsProvider';
import {
  formatDateInput, formatKilograms, formatMoney, fromLocalIsoDate, kilogramsFor, parseDateInput,
  parseMoneyInput, saleAmountKopecks, toLocalIsoDate,
} from '../../../shared/core/records/model';
import type {NewRecord} from '../../../shared/core/records/model';
import type {QuantityUnit} from '../../../shared/core/records/quantityUnitsRepository';
import {useFarmData} from '../../../shared/core/offline/FarmDataProvider';
import {rowsForSeason, varietyGroups} from '../../../shared/core/rows/model';
import {logSupabaseError} from '../../../shared/core/supabase/errors';
import {useTheme} from '../../../shared/theme';
import {FieldFlowHeader} from '../../../shared/components/field-flow-header/field-flow-header.component';

type Props = NativeStackScreenProps<RootStackParamList, 'QuantityRecord'>;
type DateChoice = 'today' | 'yesterday' | 'other';

const builtInUnits: QuantityUnit[] = [
  {id: 'kg', name: 'кг', kilogramsPerUnit: 1},
  {id: 'centner', name: 'ц', kilogramsPerUnit: 100},
  {id: 'tonne', name: 'т', kilogramsPerUnit: 1000},
];
const NUMBER_KEYBOARD_BAR = 'quantity-record-keyboard-bar';


function inputNumber(value: number | undefined): string {
  return value === undefined ? '' : String(value).replace('.', ',');
}

export function QuantityRecordScreen({route, navigation}: Props) {
  const styles = useStyles();
  const {theme} = useTheme();
  const {showToast} = useToast();
  const {fields} = useFields();
  const {records, addRecord, updateRecord, removeRecord} = useRecords();
  const {data, store} = useFarmData();
  const {kind, recordId} = route.params;
  const editing = recordId ? records.find(item => item.id === recordId && item.kind === kind) ?? null : null;
  const isSale = kind === 'sale';
  const title = isSale ? 'Продаж' : 'Збір урожаю';
  const now = new Date();
  const today = toLocalIsoDate(now);
  const yesterday = toLocalIsoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  const initialDate: DateChoice = !editing || editing.occurredOn === today ? 'today'
    : editing.occurredOn === yesterday ? 'yesterday' : 'other';
  const initialFieldId = editing?.fieldId ?? (fields.length === 1 ? fields[0].id : null);
  const previousRecord = records.find(item => item.kind === kind && item.fieldId === initialFieldId);
  const [fieldId, setFieldId] = useState<string | null>(initialFieldId);
  const [dateChoice, setDateChoice] = useState<DateChoice>(initialDate);
  const [otherDate, setOtherDate] = useState(editing && initialDate === 'other' ? formatDateInput(editing.occurredOn) : '');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [seasonOverride, setSeasonOverride] = useState<number | null>(editing?.season ?? null);
  const [unitName, setUnitName] = useState(editing?.details.unitName ?? previousRecord?.details.unitName ?? 'кг');
  const [quantityInput, setQuantityInput] = useState(inputNumber(editing?.details.enteredQuantity ?? editing?.quantityKg ?? undefined));
  const [priceInput, setPriceInput] = useState(inputNumber(
    editing?.details.pricePerUnitKopecks !== undefined ? editing.details.pricePerUnitKopecks / 100 : undefined));
  const [buyer, setBuyer] = useState(editing?.details.buyer ?? previousRecord?.details.buyer ?? '');
  const [note, setNote] = useState(editing?.note ?? '');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>(editing?.details.rowPlantingIds ?? []);
  const customUnits = data.units;
  const [addingUnit, setAddingUnit] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitWeight, setNewUnitWeight] = useState('');
  const [savingUnit, setSavingUnit] = useState(false);
  const [saving, setSaving] = useState(false);

  const rememberedRecord = records.find(item => item.kind === kind && item.fieldId === fieldId &&
    item.details.unitName === unitName && item.details.kilogramsPerUnit);
  const rememberedDetails = editing?.details.unitName === unitName ? editing.details : rememberedRecord?.details;
  const snapshotUnit = rememberedDetails?.unitName && rememberedDetails.kilogramsPerUnit
    ? {id: 'record-unit', name: rememberedDetails.unitName,
      kilogramsPerUnit: rememberedDetails.kilogramsPerUnit} : null;
  const units = [...builtInUnits, ...customUnits];
  if (snapshotUnit && !units.some(item => item.name === snapshotUnit.name)) units.push(snapshotUnit);
  const unit = units.find(item => item.name === unitName) ?? builtInUnits[0];
  const field = fields.find(item => item.id === fieldId) ?? null;
  const occurredOn = dateChoice === 'today' ? today : dateChoice === 'yesterday' ? yesterday : parseDateInput(otherDate);
  const dateYear = fromLocalIsoDate(occurredOn ?? today).getFullYear();
  // A harvest or sale belongs to the harvest year; sales of stored crops can be reassigned manually.
  const season = seasonOverride ?? dateYear;
  const seasonRows = field ? rowsForSeason(data.rows, field.id, season) : [];
  const rowGroups = varietyGroups(seasonRows);
  const selectedRows = seasonRows.filter(row => selectedRowIds.includes(row.id));
  const selectedGroups = varietyGroups(selectedRows);
  const selectedVariety = selectedGroups.length === 1 ? selectedGroups[0].variety : null;
  const seasonOptions = [...new Set([dateYear, dateYear + 1, season, ...records.map(item => item.season)])]
    .filter(year => year >= 2000 && year <= 2100).sort((a, b) => b - a);
  const quantity = parsePositiveNumber(quantityInput);
  const quantityKg = quantity === null ? null : kilogramsFor(quantity, unit.kilogramsPerUnit);
  const priceKopecks = parseMoneyInput(priceInput);
  const saleTotal = quantity !== null && priceKopecks !== null ? saleAmountKopecks(quantity, priceKopecks) : null;
  const canSave = !!field && !!occurredOn && season >= 2000 && season <= 2100 &&
    quantityKg !== null && quantityKg > 0 && (!isSale || saleTotal !== null) && !saving;
  const newUnitKgRaw = parsePositiveNumber(newUnitWeight);
  const newUnitKg = newUnitKgRaw === null ? null : Math.round(newUnitKgRaw * 1000) / 1000;
  const newUnitValid = newUnitName.trim().length > 0 && newUnitKg !== null && newUnitKg > 0 &&
    !units.some(item => item.name.toLocaleLowerCase('uk') === newUnitName.trim().toLocaleLowerCase('uk'));

  const saveUnit = async () => {
    if (!newUnitValid || newUnitKg === null) return;
    setSavingUnit(true);
    try {
      if (!store) throw new Error('Локальні дані ще завантажуються');
      const saved = await store.addUnit(newUnitName.trim(), newUnitKg);
      setUnitName(saved.name);
      setAddingUnit(false);
      setNewUnitName('');
      setNewUnitWeight('');
    } catch (error) {
      logSupabaseError('Не вдалося зберегти одиницю', error);
      Alert.alert('Не вдалося зберегти одиницю', 'Не вдалося записати дані на телефон.');
    } finally {
      setSavingUnit(false);
    }
  };

  const save = async () => {
    if (!canSave || !field || !occurredOn || quantity === null || quantityKg === null) return;
    setSaving(true);
    const input: NewRecord = {
      fieldId: field.id, kind, workType: null, occurredOn, season,
      amountKopecks: isSale ? saleTotal : null, quantityKg,
      note: note.trim() || null,
      details: {
        unitName: unit.name,
        kilogramsPerUnit: unit.kilogramsPerUnit,
        enteredQuantity: quantity,
        ...(selectedVariety ? {
          rowPlantingIds: selectedRows.map(row => row.id),
          varietySnapshot: selectedVariety,
          rowNumbersSnapshot: selectedRows.map(row => row.rowNumber).sort((a, b) => a - b),
        } : {}),
        ...(isSale ? {pricePerUnitKopecks: priceKopecks ?? undefined, buyer: buyer.trim() || undefined} : {}),
      },
    };
    try {
      if (editing) {
        await updateRecord(editing.id, input);
        navigation.goBack();
        showToast({text: 'Зміни збережено'});
        return;
      }
      const record = await addRecord(input);
      navigation.goBack();
      showToast({
        text: `${title}: ${formatKilograms(quantityKg)}${isSale && saleTotal !== null ? ` · ${formatMoney(saleTotal)}` : ''}`,
        actionLabel: 'Скасувати',
        onAction: () => {
          removeRecord(record.id).catch(error => logSupabaseError('Не вдалося скасувати запис', error));
        },
      });
    } catch (error) {
      logSupabaseError('Не вдалося зберегти запис', error);
      Alert.alert('Не вдалося зберегти запис', 'Не вдалося записати дані на телефон.');
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!editing) return;
    Alert.alert('Видалити запис?', 'Запис буде видалено назавжди.', [
      {text: 'Скасувати', style: 'cancel'},
      {text: 'Видалити', style: 'destructive', onPress: () => {
        removeRecord(editing.id).then(() => navigation.goBack()).catch(error => {
          logSupabaseError('Не вдалося видалити запис', error);
          Alert.alert('Не вдалося видалити запис', 'Не вдалося записати зміни на телефон.');
        });
      }},
    ]);
  };

  return <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
    <View style={styles.header}>
      <FieldFlowHeader title={editing ? 'Змінити запис' : title} onBack={() => navigation.goBack()}
        rightLabel="Скасувати" onRight={() => navigation.goBack()} />
      <Text style={styles.title} accessibilityRole="header">{title}</Text>
    </View>
    <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets contentContainerStyle={styles.content}>
      {fields.length > 1 && <View style={styles.section}>
        <Text style={styles.label}>Ділянка</Text>
        <View style={styles.chips}>
          {fields.map(item => <Chip key={item.id} label={item.name} selected={fieldId === item.id}
            onPress={() => {
              setFieldId(item.id);
              setSelectedRowIds([]);
              if (!editing) {
                const previous = records.find(record => record.kind === kind && record.fieldId === item.id);
                setUnitName(previous?.details.unitName ?? 'кг');
                setBuyer(previous?.details.buyer ?? '');
              }
            }} />)}
        </View>
      </View>}
      {field && <Text style={styles.note}>{field.name} · {formatArea(selectedAreaM2(field))}</Text>}

      {rowGroups.length > 0 && <RowSelection groups={rowGroups} selectedIds={selectedRowIds}
        onChange={setSelectedRowIds} mode="quantity" />}

      <View style={styles.section}>
        <Text style={styles.label}>Скільки {isSale ? 'продали' : 'зібрали'}</Text>
        <TextInput value={quantityInput} onChangeText={setQuantityInput} keyboardType="decimal-pad"
          inputAccessoryViewID={NUMBER_KEYBOARD_BAR} placeholder="0" placeholderTextColor={theme.colors.textMuted}
          accessibilityLabel="Кількість" style={[styles.input, styles.inputLarge]} />
        <View style={styles.chips}>
          {units.map(item => <Chip key={item.id} label={item.name} selected={unit.name === item.name}
            onPress={() => setUnitName(item.name)} />)}
          <Chip label="+ Своя одиниця" selected={addingUnit} onPress={() => setAddingUnit(open => !open)} />
        </View>
        {addingUnit && <View style={styles.custom}>
          <Text style={styles.label}>Нова одиниця</Text>
          <TextInput value={newUnitName} onChangeText={setNewUnitName} maxLength={30}
            placeholder="Наприклад, відро" placeholderTextColor={theme.colors.textMuted}
            accessibilityLabel="Назва одиниці" style={styles.input} />
          <TextInput value={newUnitWeight} onChangeText={setNewUnitWeight} keyboardType="decimal-pad"
            inputAccessoryViewID={NUMBER_KEYBOARD_BAR} placeholder="Скільки кг в одному відрі"
            placeholderTextColor={theme.colors.textMuted} accessibilityLabel="Вага одиниці в кілограмах"
            style={styles.input} />
          <AppButton label={savingUnit ? 'Зберігаємо…' : 'Зберегти одиницю'}
            disabled={!newUnitValid || savingUnit} onPress={() => { saveUnit(); }} />
        </View>}
        {quantityKg !== null && quantityKg > 0 && unit.kilogramsPerUnit !== 1 && <View style={styles.result}>
          <Text style={styles.resultText}>{quantityInput} {unit.name} = {formatKilograms(quantityKg)}</Text>
        </View>}
      </View>

      {isSale && <View style={styles.section}>
        <Text style={styles.label}>Ціна за {unit.name}</Text>
        <TextInput value={priceInput} onChangeText={setPriceInput} keyboardType="decimal-pad"
          inputAccessoryViewID={NUMBER_KEYBOARD_BAR} placeholder="0 грн"
          placeholderTextColor={theme.colors.textMuted} accessibilityLabel={`Ціна за ${unit.name} у гривнях`}
          style={styles.input} />
        {saleTotal !== null && quantity !== null && <View style={styles.result}>
          <Text style={styles.resultText}>{quantityInput} × {formatMoney(priceKopecks ?? 0)} = {formatMoney(saleTotal)}</Text>
        </View>}
        <TextInput value={buyer} onChangeText={setBuyer} maxLength={60}
          placeholder="Кому продали · необов’язково" placeholderTextColor={theme.colors.textMuted}
          accessibilityLabel="Покупець" style={styles.input} />
      </View>}

      <View style={styles.section}>
        <Text style={styles.label}>Коли</Text>
        <View style={styles.chips}>
          <Chip label="Сьогодні" selected={dateChoice === 'today'} onPress={() => {
            setDateChoice('today'); setSeasonOverride(null);
          }} />
          <Chip label="Вчора" selected={dateChoice === 'yesterday'} onPress={() => {
            setDateChoice('yesterday'); setSeasonOverride(null);
          }} />
          <Chip label={dateChoice === 'other' ? `Інша дата · ${otherDate}` : 'Інша дата'}
            selected={dateChoice === 'other'} onPress={() => { Keyboard.dismiss(); setCalendarOpen(true); }} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Сезон (рік урожаю)</Text>
        <View style={styles.chips}>
          {seasonOptions.map(year => <Chip key={year} label={String(year)} selected={season === year}
            onPress={() => setSeasonOverride(year)} />)}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Нотатка · необов’язково</Text>
        <TextInput value={note} onChangeText={setNote} maxLength={500} multiline
          placeholder="Додайте подробиці" placeholderTextColor={theme.colors.textMuted}
          accessibilityLabel="Нотатка" style={styles.input} />
      </View>
      <AppButton label={saving ? 'Зберігаємо…' : 'Зберегти'} disabled={!canSave} onPress={() => { save(); }} />
      {editing && <AppButton label="Видалити запис" variant="danger" onPress={confirmDelete} />}
    </ScrollView>
    <CalendarDatePicker visible={calendarOpen} selectedDate={parseDateInput(otherDate) ?? today}
      onClose={() => setCalendarOpen(false)} onSelect={date => {
        setOtherDate(formatDateInput(date));
        setDateChoice('other');
        setSeasonOverride(null);
        setCalendarOpen(false);
      }} />
    {Platform.OS === 'ios' && <InputAccessoryView nativeID={NUMBER_KEYBOARD_BAR}>
      <View style={styles.keyboardBar}>
        <Pressable accessibilityRole="button" onPress={Keyboard.dismiss} style={styles.keyboardDone}>
          <Text style={styles.keyboardDoneText}>Готово</Text>
        </Pressable>
      </View>
    </InputAccessoryView>}
  </SafeAreaView>;
}
