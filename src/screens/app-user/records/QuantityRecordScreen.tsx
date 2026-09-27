import React, {useEffect, useState} from 'react';
import {
  Alert, InputAccessoryView, Keyboard, Platform, Pressable, ScrollView, Text, TextInput, View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton, useToast} from '../../../shared/components/ui';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import {formatArea, parsePositiveNumber, selectedAreaM2} from '../../../shared/core/fields/model';
import {useRecords} from '../../../shared/core/records/RecordsProvider';
import {
  formatDateInput, formatKilograms, formatMoney, fromLocalIsoDate, kilogramsFor, parseDateInput,
  parseMoneyInput, saleAmountKopecks, toLocalIsoDate,
} from '../../../shared/core/records/model';
import type {NewRecord} from '../../../shared/core/records/model';
import {addQuantityUnit, fetchQuantityUnits} from '../../../shared/core/records/quantityUnitsRepository';
import type {QuantityUnit} from '../../../shared/core/records/quantityUnitsRepository';
import {logSupabaseError} from '../../../shared/core/supabase/errors';
import {useTheme, useThemedStyles} from '../../../shared/theme';
import type {AppTheme} from '../../../shared/theme/theme';
import {FieldFlowHeader} from '../field-create/FieldFlowHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'QuantityRecord'>;
type DateChoice = 'today' | 'yesterday' | 'other';

const builtInUnits: QuantityUnit[] = [
  {id: 'kg', name: 'кг', kilogramsPerUnit: 1},
  {id: 'centner', name: 'ц', kilogramsPerUnit: 100},
  {id: 'tonne', name: 'т', kilogramsPerUnit: 1000},
];
const NUMBER_KEYBOARD_BAR = 'quantity-record-keyboard-bar';

const createStyles = (theme: AppTheme) => ({
  safe: {flex: 1, backgroundColor: theme.colors.background},
  header: {paddingHorizontal: 20, paddingBottom: 12, backgroundColor: theme.colors.background},
  title: {color: theme.colors.text, fontSize: 28, lineHeight: 34, fontWeight: '700' as const},
  content: {paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 24},
  section: {gap: 10},
  label: {color: theme.colors.text, fontSize: 17, fontWeight: '600' as const},
  chips: {flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8},
  chip: {minHeight: 44, paddingHorizontal: 16, borderRadius: 999, borderWidth: 2,
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface, justifyContent: 'center' as const},
  chipSelected: {borderColor: theme.colors.primary, backgroundColor: theme.colors.primary},
  chipText: {color: theme.colors.text, fontSize: 17, fontWeight: '600' as const},
  chipTextSelected: {color: theme.colors.onPrimary},
  input: {minHeight: 58, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1,
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface,
    color: theme.colors.text, fontSize: 19},
  inputLarge: {fontSize: 28, fontWeight: '700' as const},
  result: {borderRadius: 12, padding: 14, backgroundColor: theme.colors.accentSoft},
  resultText: {color: theme.colors.accentInk, fontSize: 17, fontWeight: '700' as const},
  note: {color: theme.colors.textMuted, fontSize: 15, lineHeight: 21},
  error: {color: theme.colors.danger, fontSize: 15, lineHeight: 20},
  custom: {gap: 12, padding: 16, backgroundColor: theme.colors.surface, borderRadius: 20,
    borderWidth: 1, borderColor: theme.colors.border},
  keyboardBar: {flexDirection: 'row' as const, justifyContent: 'flex-end' as const,
    paddingHorizontal: 12, backgroundColor: theme.colors.surface,
    borderTopWidth: 1, borderTopColor: theme.colors.border},
  keyboardDone: {minHeight: 44, paddingHorizontal: 8, justifyContent: 'center' as const},
  keyboardDoneText: {color: theme.colors.primary, fontSize: 17, fontWeight: '600' as const},
});

function Chip({label, selected, onPress}: {label: string; selected: boolean; onPress: () => void}) {
  const styles = useThemedStyles(createStyles);
  return <Pressable accessibilityRole="button" accessibilityState={{selected}} onPress={onPress}
    style={[styles.chip, selected && styles.chipSelected]}>
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </Pressable>;
}

function inputNumber(value: number | undefined): string {
  return value === undefined ? '' : String(value).replace('.', ',');
}

export function QuantityRecordScreen({route, navigation}: Props) {
  const styles = useThemedStyles(createStyles);
  const {theme} = useTheme();
  const {showToast} = useToast();
  const {fields} = useFields();
  const {records, addRecord, updateRecord, removeRecord} = useRecords();
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
  const [seasonOverride, setSeasonOverride] = useState<number | null>(editing?.season ?? null);
  const [unitName, setUnitName] = useState(editing?.details.unitName ?? previousRecord?.details.unitName ?? 'кг');
  const [quantityInput, setQuantityInput] = useState(inputNumber(editing?.details.enteredQuantity ?? editing?.quantityKg ?? undefined));
  const [priceInput, setPriceInput] = useState(inputNumber(
    editing?.details.pricePerUnitKopecks ? editing.details.pricePerUnitKopecks / 100 : undefined));
  const [buyer, setBuyer] = useState(editing?.details.buyer ?? previousRecord?.details.buyer ?? '');
  const [note, setNote] = useState(editing?.note ?? '');
  const [customUnits, setCustomUnits] = useState<QuantityUnit[]>([]);
  const [unitLoadError, setUnitLoadError] = useState(false);
  const [addingUnit, setAddingUnit] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitWeight, setNewUnitWeight] = useState('');
  const [savingUnit, setSavingUnit] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetchQuantityUnits().then(items => {
      if (active) { setCustomUnits(items); setUnitLoadError(false); }
    }).catch(error => {
      logSupabaseError('Не вдалося завантажити одиниці', error);
      if (active) setUnitLoadError(true);
    });
    return () => { active = false; };
  }, []);

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
  const seasonOptions = [...new Set([dateYear, dateYear + 1, season, ...records.map(item => item.season)])]
    .filter(year => year >= 2000 && year <= 2100).sort((a, b) => b - a);
  const quantity = parsePositiveNumber(quantityInput);
  const quantityKg = quantity === null ? null : kilogramsFor(quantity, unit.kilogramsPerUnit);
  const priceKopecks = parseMoneyInput(priceInput);
  const saleTotal = quantity !== null && priceKopecks !== null ? saleAmountKopecks(quantity, priceKopecks) : null;
  const canSave = !!field && !!occurredOn && season >= 2000 && season <= 2100 &&
    quantityKg !== null && quantityKg > 0 && (!isSale || (saleTotal !== null && saleTotal > 0)) && !saving;
  const newUnitKgRaw = parsePositiveNumber(newUnitWeight);
  const newUnitKg = newUnitKgRaw === null ? null : Math.round(newUnitKgRaw * 1000) / 1000;
  const newUnitValid = newUnitName.trim().length > 0 && newUnitKg !== null && newUnitKg > 0 &&
    !units.some(item => item.name.toLocaleLowerCase('uk') === newUnitName.trim().toLocaleLowerCase('uk'));

  const saveUnit = async () => {
    if (!newUnitValid || newUnitKg === null) return;
    setSavingUnit(true);
    try {
      const saved = await addQuantityUnit(newUnitName.trim(), newUnitKg);
      setCustomUnits(current => [...current, saved]);
      setUnitName(saved.name);
      setAddingUnit(false);
      setNewUnitName('');
      setNewUnitWeight('');
    } catch (error) {
      logSupabaseError('Не вдалося зберегти одиницю', error);
      Alert.alert('Не вдалося зберегти одиницю', 'Перевірте інтернет і спробуйте ще раз.');
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
      Alert.alert('Не вдалося зберегти запис', 'Перевірте інтернет і спробуйте ще раз.');
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
          Alert.alert('Не вдалося видалити запис', 'Перевірте інтернет і спробуйте ще раз.');
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
              if (!editing) {
                const previous = records.find(record => record.kind === kind && record.fieldId === item.id);
                setUnitName(previous?.details.unitName ?? 'кг');
                setBuyer(previous?.details.buyer ?? '');
              }
            }} />)}
        </View>
      </View>}
      {field && <Text style={styles.note}>{field.name} · {formatArea(selectedAreaM2(field))}</Text>}

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
        {unitLoadError && <Text style={styles.error}>Власні одиниці не завантажилися. Стандартні доступні.</Text>}
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
          <Chip label="Інша дата" selected={dateChoice === 'other'} onPress={() => {
            setDateChoice('other'); setSeasonOverride(null);
            if (!otherDate) setOtherDate(formatDateInput(today));
          }} />
        </View>
        {dateChoice === 'other' && <TextInput value={otherDate} onChangeText={value => {
          setOtherDate(value); setSeasonOverride(null);
        }} placeholder="дд.мм.рррр" placeholderTextColor={theme.colors.textMuted}
          accessibilityLabel="Дата запису" style={styles.input} maxLength={10} />}
        {dateChoice === 'other' && !occurredOn && <Text style={styles.error}>Введіть дату як 26.09.2026.</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Сезон (рік урожаю)</Text>
        <View style={styles.chips}>
          {seasonOptions.map(year => <Chip key={year} label={String(year)} selected={season === year}
            onPress={() => setSeasonOverride(year)} />)}
        </View>
      </View>

      <TextInput value={note} onChangeText={setNote} maxLength={500} multiline
        placeholder="Нотатка · необов’язково" placeholderTextColor={theme.colors.textMuted}
        accessibilityLabel="Нотатка" style={styles.input} />
      <AppButton label={saving ? 'Зберігаємо…' : 'Зберегти'} disabled={!canSave} onPress={() => { save(); }} />
      {editing && <AppButton label="Видалити запис" variant="danger" onPress={confirmDelete} />}
    </ScrollView>
    {Platform.OS === 'ios' && <InputAccessoryView nativeID={NUMBER_KEYBOARD_BAR}>
      <View style={styles.keyboardBar}>
        <Pressable accessibilityRole="button" onPress={Keyboard.dismiss} style={styles.keyboardDone}>
          <Text style={styles.keyboardDoneText}>Готово</Text>
        </Pressable>
      </View>
    </InputAccessoryView>}
  </SafeAreaView>;
}
