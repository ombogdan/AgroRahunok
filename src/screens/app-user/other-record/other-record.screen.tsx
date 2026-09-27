import {Chip} from '../components/record-chip/record-chip.component';
import {useStyles} from './other-record.styles';
import React, {useState} from 'react';
import {Alert, InputAccessoryView, Keyboard, Platform, Pressable, Text, TextInput, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton, CalendarDatePicker, Page, useToast} from '../../../shared/components/ui';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import {useRecords} from '../../../shared/core/records/RecordsProvider';
import type {NewRecord} from '../../../shared/core/records/model';
import {
  formatDateInput,
  formatMoney,
  fromLocalIsoDate,
  parseDateInput,
  parseMoneyInput,
  toLocalIsoDate
} from '../../../shared/core/records/model';
import {logSupabaseError} from '../../../shared/core/supabase/errors';
import {useTheme} from '../../../shared/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'OtherRecord'>;
type DateChoice = 'today' | 'yesterday' | 'other';
const categories = ['Податок', 'Тара', 'Ремонт', 'Інше'];
const NUMBER_KEYBOARD_BAR = 'other-record-keyboard-bar';


export function OtherRecordScreen({route, navigation}: Props) {
  const styles = useStyles();
  const {theme} = useTheme();
  const {showToast} = useToast();
  const {fields} = useFields();
  const {records, addRecord, updateRecord, removeRecord} = useRecords();
  const editing = route.params?.recordId
    ? records.find(item => item.id === route.params?.recordId && item.kind === 'other') ?? null : null;
  const now = new Date();
  const today = toLocalIsoDate(now);
  const yesterday = toLocalIsoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  const initialDate: DateChoice = !editing || editing.occurredOn === today ? 'today' : editing.occurredOn === yesterday ? 'yesterday' : 'other';
  const initialCategory = editing?.details.category ?? categories[0];
  const [isIncome, setIsIncome] = useState((editing?.amountKopecks ?? -1) > 0);
  const [fieldId, setFieldId] = useState<string | null>(editing?.fieldId ?? null);
  const [category, setCategory] = useState(categories.includes(initialCategory) ? initialCategory : 'Інше');
  const [customCategory, setCustomCategory] = useState(categories.includes(initialCategory) ? '' : initialCategory);
  const [amountInput, setAmountInput] = useState(editing?.amountKopecks !== null && editing?.amountKopecks !== undefined
    ? String(Math.abs(editing.amountKopecks) / 100).replace('.', ',') : '');
  const [dateChoice, setDateChoice] = useState<DateChoice>(initialDate);
  const [otherDate, setOtherDate] = useState(editing && initialDate === 'other' ? formatDateInput(editing.occurredOn) : '');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [seasonOverride, setSeasonOverride] = useState<number | null>(editing?.season ?? null);
  const [note, setNote] = useState(editing?.note ?? '');
  const [saving, setSaving] = useState(false);

  const occurredOn = dateChoice === 'today' ? today : dateChoice === 'yesterday' ? yesterday : parseDateInput(otherDate);
  const dateYear = fromLocalIsoDate(occurredOn ?? today).getFullYear();
  const season = seasonOverride ?? dateYear;
  const seasonOptions = [...new Set([dateYear, dateYear + 1, season, ...records.map(item => item.season)])].filter(year => year >= 2000 && year <= 2100).sort((a, b) => b - a);
  const amountKopecks = parseMoneyInput(amountInput);
  const categoryName = category === 'Інше' ? customCategory.trim() : category;
  const canSave = !!occurredOn && season >= 2000 && season <= 2100 && amountKopecks !== null &&
    categoryName.length > 0 && !saving;

  const save = async () => {
    if (!canSave || !occurredOn || amountKopecks === null) return;
    setSaving(true);
    const input: NewRecord = {
      fieldId, kind: 'other', workType: null, occurredOn, season,
      amountKopecks: isIncome ? amountKopecks : -amountKopecks,
      quantityKg: null, note: note.trim() || null,
      details: {category: categoryName},
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
        text: `${categoryName}: ${isIncome ? '+' : '−'}${formatMoney(amountKopecks)}`,
        actionLabel: 'Скасувати',
        onAction: () => {
          removeRecord(record.id).catch(error => logSupabaseError('Не вдалося скасувати запис', error));
        },
      });
    } catch (error) {
      logSupabaseError('Не вдалося зберегти суму', error);
      Alert.alert('Не вдалося зберегти запис', 'Не вдалося записати дані на телефон.');
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!editing) return;
    Alert.alert('Видалити запис?', 'Запис буде видалено назавжди.', [
      {text: 'Скасувати', style: 'cancel'},
      {
        text: 'Видалити', style: 'destructive', onPress: () => {
          removeRecord(editing.id).then(() => navigation.goBack()).catch(error => {
            logSupabaseError('Не вдалося видалити запис', error);
            Alert.alert('Не вдалося видалити запис', 'Не вдалося записати зміни на телефон.');
          });
        }
      },
    ]);
  };

  return <>
    <Page title={editing ? 'Змінити суму' : 'Інша витрата чи дохід'} onBack={() => navigation.goBack()}>
      <View style={styles.section}>
        <Text style={styles.label}>Що записати?</Text>
        <View style={styles.chips}>
          <Chip label="Витрата" selected={!isIncome} onPress={() => setIsIncome(false)}/>
          <Chip label="Дохід" selected={isIncome} onPress={() => setIsIncome(true)}/>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Категорія</Text>
        <View style={styles.chips}>
          {categories.map(item => <Chip key={item} label={item} selected={category === item}
                                        onPress={() => setCategory(item)}/>)}
        </View>
        {category === 'Інше' && <TextInput value={customCategory} onChangeText={setCustomCategory}
                                           maxLength={60} placeholder="Назва категорії"
                                           placeholderTextColor={theme.colors.textMuted}
                                           accessibilityLabel="Назва категорії" style={styles.input}/>}
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>До чого належить?</Text>
        <View style={styles.chips}>
          <Chip label="Усе господарство" selected={fieldId === null} onPress={() => setFieldId(null)}/>
          {fields.map(field => <Chip key={field.id} label={field.name} selected={fieldId === field.id}
                                     onPress={() => setFieldId(field.id)}/>)}
        </View>
        <Text style={styles.note}>Загальні суми не розподіляються між ділянками.</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Сума</Text>
        <TextInput value={amountInput} onChangeText={setAmountInput} keyboardType="decimal-pad"
                   inputAccessoryViewID={NUMBER_KEYBOARD_BAR} placeholder="0 грн"
                   placeholderTextColor={theme.colors.textMuted} accessibilityLabel="Сума в гривнях"
                   style={[styles.input, styles.amount]}/>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Коли</Text>
        <View style={styles.chips}>
          <Chip label="Сьогодні" selected={dateChoice === 'today'} onPress={() => {
            setDateChoice('today');
            setSeasonOverride(null);
          }}/>
          <Chip label="Вчора" selected={dateChoice === 'yesterday'} onPress={() => {
            setDateChoice('yesterday');
            setSeasonOverride(null);
          }}/>
          <Chip label={dateChoice === 'other' ? `Інша дата · ${otherDate}` : 'Інша дата'}
            selected={dateChoice === 'other'} onPress={() => { Keyboard.dismiss(); setCalendarOpen(true); }}/>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Сезон (рік урожаю)</Text>
        <View style={styles.chips}>
          {seasonOptions.map(year => <Chip key={year} label={String(year)} selected={season === year}
                                           onPress={() => setSeasonOverride(year)}/>)}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Нотатка · необов’язково</Text>
        <TextInput value={note} onChangeText={setNote} maxLength={500} multiline
                   placeholder="Додайте подробиці" placeholderTextColor={theme.colors.textMuted}
                   accessibilityLabel="Нотатка" style={styles.input}/>
      </View>
      <AppButton label={saving ? 'Зберігаємо…' : 'Зберегти'} disabled={!canSave} onPress={() => {
        save();
      }}/>
      {editing && <AppButton label="Видалити запис" variant="danger" onPress={confirmDelete}/>}
    </Page>
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
  </>;
}
