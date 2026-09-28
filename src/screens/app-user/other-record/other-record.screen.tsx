import {t} from '../../../shared/config/i18n';
import {Chip} from '../components/record-chip/record-chip.component';
import {useStyles} from './other-record.styles';
import React, {useState} from 'react';
import {Alert, InputAccessoryView, Keyboard, Platform, Pressable, Text, TextInput, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton, AppIcon, CalendarDatePicker, Page, useToast} from '../../../shared/components/ui';
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
const categoryKeys: Record<string, string> = {Податок: 'tax', Тара: 'packaging', Ремонт: 'repairs', Інше: 'other'};
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
  const [detailsOpen, setDetailsOpen] = useState(!!editing);
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
        showToast({text: t("changesSaved")});
        return;
      }
      const record = await addRecord(input);
      navigation.goBack();
      showToast({
        text: `${categoryName}: ${isIncome ? '+' : '−'}${formatMoney(amountKopecks)}`,
        actionLabel: t("cancel"),
        onAction: () => {
          removeRecord(record.id).catch(error => logSupabaseError(t("couldNotUndoTheRecord"), error));
        },
      });
    } catch (error) {
      logSupabaseError(t("couldNotSaveAmount"), error);
      Alert.alert(t("couldNotSaveRecord"), t("couldNotSaveDataOnThePhone"));
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!editing) return;
    Alert.alert(t("confirmDeleteRecordTitle"), t("theRecordWillBePermanentlyDeleted"), [
      {text: t("cancel"), style: 'cancel'},
      {
        text: t("delete"), style: 'destructive', onPress: () => {
          removeRecord(editing.id).then(() => navigation.goBack()).catch(error => {
            logSupabaseError(t("couldNotDeleteRecord"), error);
            Alert.alert(t("couldNotDeleteRecord"), t("couldNotSaveChangesOnThePhone"));
          });
        }
      },
    ]);
  };

  return <>
    <Page title={editing ? t("editAmount") : t("otherExpenseOrIncome")} onBack={() => navigation.goBack()}
      footer={<AppButton label={saving ? t("saving") : t("save")} disabled={!canSave} onPress={() => { save(); }} />}>
      <View style={styles.section}>
        <Text style={styles.label}>{t("whatWouldYouLikeToRecord")}</Text>
        <View style={styles.chips}>
          <Chip label={t("expense")} selected={!isIncome} onPress={() => setIsIncome(false)}/>
          <Chip label={t("incomeSingle")} selected={isIncome} onPress={() => setIsIncome(true)}/>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>{t("category")}</Text>
        <View style={styles.chips}>
          {categories.map(item => <Chip key={item} label={t(categoryKeys[item])} selected={category === item}
                                        onPress={() => setCategory(item)}/>)}
        </View>
        {category === 'Інше' && <TextInput value={customCategory} onChangeText={setCustomCategory}
                                           maxLength={60} placeholder={t("categoryName")}
                                           placeholderTextColor={theme.colors.textMuted}
                                           accessibilityLabel={t("categoryName")} style={styles.input}/>}
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>{t("amount")}</Text>
        <TextInput value={amountInput} onChangeText={setAmountInput} keyboardType="decimal-pad"
                   inputAccessoryViewID={NUMBER_KEYBOARD_BAR} placeholder={t("zeroCostExample")}
                   placeholderTextColor={theme.colors.textMuted} accessibilityLabel={t("amountInUah")}
                   style={[styles.input, styles.amount]}/>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>{t("when")}</Text>
        <View style={styles.chips}>
          <Chip label={t("today")} selected={dateChoice === 'today'} onPress={() => {
            setDateChoice('today');
            setSeasonOverride(null);
          }}/>
          <Chip label={t("yesterday")} selected={dateChoice === 'yesterday'} onPress={() => {
            setDateChoice('yesterday');
            setSeasonOverride(null);
          }}/>
          <Chip label={dateChoice === 'other' ? t("selectedOtherDate", [otherDate]) : t("otherDate")}
            selected={dateChoice === 'other'} onPress={() => { Keyboard.dismiss(); setCalendarOpen(true); }}/>
        </View>
      </View>
      <Pressable accessibilityRole="button" accessibilityState={{expanded: detailsOpen}}
        onPress={() => setDetailsOpen(open => !open)} style={styles.detailsToggle}>
        <Text style={styles.label}>{t("detailsOptional")}</Text>
        <AppIcon name={detailsOpen ? 'chevronUp' : 'chevronDown'} color={theme.colors.textMuted} size={22} />
      </Pressable>
      {detailsOpen && <>
        <View style={styles.section}>
          <Text style={styles.label}>{t("whatIsThisFor")}</Text>
          <View style={styles.chips}>
            <Chip label={t("wholeFarm")} selected={fieldId === null} onPress={() => setFieldId(null)}/>
            {fields.map(field => <Chip key={field.id} label={field.name} selected={fieldId === field.id}
              onPress={() => setFieldId(field.id)}/>)}
          </View>
          <Text style={styles.note}>{t("farmWideAmountsAreNotAllocatedToFields")}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>{t("seasonHarvestYear")}</Text>
          <View style={styles.chips}>
            {seasonOptions.map(year => <Chip key={year} label={String(year)} selected={season === year}
              onPress={() => setSeasonOverride(year)}/>)}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>{t("noteOptional")}</Text>
          <TextInput value={note} onChangeText={setNote} maxLength={500} multiline
            placeholder={t("addDetails")} placeholderTextColor={theme.colors.textMuted}
            accessibilityLabel={t("note")} style={styles.input}/>
        </View>
      </>}
      {editing && <AppButton label={t("deleteRecord")} variant="danger" onPress={confirmDelete}/>}
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
          <Text style={styles.keyboardDoneText}>{t("done")}</Text>
        </Pressable>
      </View>
    </InputAccessoryView>}
  </>;
}
