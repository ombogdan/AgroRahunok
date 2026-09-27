import React, {useState} from 'react';
import {
  Alert, InputAccessoryView, Keyboard, Platform, Pressable, ScrollView, Text, TextInput, View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton, AppIcon, useToast} from '../../../shared/components/ui';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import {fieldTypeLabels, formatArea, formatHectares, selectedAreaM2} from '../../../shared/core/fields/model';
import type {CostMode, NewRecord, Performer, WorkType} from '../../../shared/core/records/model';
import {
  formatDateInput, formatMoney, fromLocalIsoDate, parseDateInput, parseMoneyInput, performerLabels,
  seasonFor, toLocalIsoDate, workCostKopecks, workTypeLabels, workTypes,
} from '../../../shared/core/records/model';
import {useRecords} from '../../../shared/core/records/RecordsProvider';
import {logSupabaseError} from '../../../shared/core/supabase/errors';
import {useTheme, useThemedStyles} from '../../../shared/theme';
import type {AppTheme} from '../../../shared/theme/theme';
import {FieldFlowHeader} from '../field-create/FieldFlowHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkRecord'>;
type Step = 1 | 2 | 3;
type DateChoice = 'today' | 'yesterday' | 'other';

// The iOS number pads have no return key, so number fields get a «Готово» bar above them.
const NUMBER_KEYBOARD_BAR = 'work-record-keyboard-bar';
const performers: Performer[] = ['self', 'family', 'neighbour', 'hired'];
const stepTitles: Record<Step, string> = {1: 'Де працювали?', 2: 'Що робили?', 3: 'Коли й скільки?'};

const createStyles = (theme: AppTheme) => ({
  safe: {flex: 1, backgroundColor: theme.colors.background},
  header: {paddingHorizontal: 20, paddingBottom: 12, gap: 12, backgroundColor: theme.colors.background},
  content: {paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32, gap: 20},
  progress: {flexDirection: 'row' as const, gap: 6},
  progressBar: {flex: 1, height: 6, borderRadius: 999, backgroundColor: theme.colors.border},
  progressDone: {backgroundColor: theme.colors.primary},
  title: {color: theme.colors.text, fontSize: 28, lineHeight: 34, fontWeight: '700' as const},
  tile: {minHeight: 96, borderRadius: 20, borderWidth: 2, borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface, padding: 16, justifyContent: 'center' as const, gap: 4},
  tileSelected: {borderColor: theme.colors.primary},
  tileName: {color: theme.colors.text, fontSize: 22, lineHeight: 28, fontWeight: '600' as const},
  tileDetail: {color: theme.colors.textMuted, fontSize: 15, lineHeight: 20},
  grid: {flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 12},
  workTile: {flexBasis: '46%' as const, flexGrow: 1, minHeight: 96, borderRadius: 20, borderWidth: 2,
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface,
    alignItems: 'center' as const, justifyContent: 'center' as const, gap: 8, padding: 10},
  workLabel: {color: theme.colors.text, fontSize: 17, fontWeight: '600' as const, textAlign: 'center' as const},
  pills: {flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8},
  pill: {borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: theme.colors.primarySoft},
  pillText: {color: theme.colors.primary, fontSize: 15, fontWeight: '600' as const},
  section: {gap: 10},
  label: {color: theme.colors.text, fontSize: 17, fontWeight: '600' as const},
  chips: {flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8},
  chip: {minHeight: 44, paddingHorizontal: 15, borderRadius: 999, borderWidth: 2,
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface, justifyContent: 'center' as const},
  chipSelected: {borderColor: theme.colors.primary, backgroundColor: theme.colors.primary},
  chipText: {color: theme.colors.text, fontSize: 17, fontWeight: '600' as const},
  chipTextSelected: {color: theme.colors.onPrimary},
  segmented: {flexDirection: 'row' as const, borderRadius: 12, padding: 3, backgroundColor: theme.colors.segment},
  segment: {flex: 1, minHeight: 44, borderRadius: 10, alignItems: 'center' as const, justifyContent: 'center' as const},
  segmentSelected: {backgroundColor: theme.colors.surface, shadowColor: '#000000', shadowOpacity: 0.12,
    shadowRadius: 3, shadowOffset: {width: 0, height: 1}, elevation: 1},
  segmentText: {color: theme.colors.text, fontSize: 17, fontWeight: '600' as const},
  numberField: {minHeight: 64, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface, flexDirection: 'row' as const, alignItems: 'center' as const,
    paddingHorizontal: 16, gap: 8},
  numberInput: {flex: 1, color: theme.colors.text, fontSize: 28, fontWeight: '700' as const, paddingVertical: 8},
  suffix: {color: theme.colors.textMuted, fontSize: 20, fontWeight: '600' as const},
  input: {minHeight: 56, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1,
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text, fontSize: 19},
  noteInput: {minHeight: 88, paddingTop: 14, textAlignVertical: 'top' as const},
  calcLine: {borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: theme.colors.accentSoft},
  calcText: {color: theme.colors.accentInk, fontSize: 17, fontWeight: '700' as const},
  note: {color: theme.colors.textMuted, fontSize: 15, lineHeight: 20},
  error: {color: theme.colors.danger, fontSize: 15, lineHeight: 20},
  detailsToggle: {minHeight: 44, flexDirection: 'row' as const, alignItems: 'center' as const,
    justifyContent: 'space-between' as const},
  keyboardBar: {flexDirection: 'row' as const, justifyContent: 'flex-end' as const, paddingHorizontal: 12,
    backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border},
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

function moneyInputValue(kopecks: number): string {
  return String(Math.abs(kopecks) / 100).replace('.', ',');
}

export function WorkRecordScreen({route, navigation}: Props) {
  const styles = useThemedStyles(createStyles);
  const {theme} = useTheme();
  const {showToast} = useToast();
  const {fields} = useFields();
  const {records, addRecord, updateRecord, removeRecord} = useRecords();
  const editing = route.params?.recordId ? records.find(item => item.id === route.params?.recordId) ?? null : null;
  const now = new Date();
  const today = toLocalIsoDate(now);
  const yesterday = toLocalIsoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  const singleField = fields.length === 1 ? fields[0] : null;

  const initialDate: DateChoice = !editing || editing.occurredOn === today ? 'today'
    : editing.occurredOn === yesterday ? 'yesterday' : 'other';
  const initialCostMode: CostMode = editing?.details.costMode ?? 'sum';
  const initialCost = editing
    ? initialCostMode === 'perHa' && editing.details.ratePerHaKopecks
      ? moneyInputValue(editing.details.ratePerHaKopecks)
      : editing.amountKopecks ? moneyInputValue(editing.amountKopecks) : ''
    : '';

  const [step, setStep] = useState<Step>(editing ? 3 : singleField ? 2 : 1);
  const [showFieldStep, setShowFieldStep] = useState(!singleField);
  const [fieldId, setFieldId] = useState<string | null>(editing?.fieldId ?? singleField?.id ?? null);
  const [workType, setWorkType] = useState<WorkType | null>(editing?.workType ?? null);
  const [dateChoice, setDateChoice] = useState<DateChoice>(initialDate);
  const [otherDate, setOtherDate] = useState(editing && initialDate === 'other' ? formatDateInput(editing.occurredOn) : '');
  const [costMode, setCostMode] = useState<CostMode>(initialCostMode);
  const [costInput, setCostInput] = useState(initialCost);
  const [detailsOpen, setDetailsOpen] = useState(!!editing && (!!editing.note || !!editing.details.performer));
  const [performer, setPerformer] = useState<Performer | null>(editing?.details.performer ?? null);
  const [note, setNote] = useState(editing?.note ?? '');
  const [seasonOverride, setSeasonOverride] = useState<number | null>(editing?.season ?? null);
  const [saving, setSaving] = useState(false);

  const field = fields.find(item => item.id === fieldId) ?? null;
  const occurredOn = dateChoice === 'today' ? today : dateChoice === 'yesterday' ? yesterday : parseDateInput(otherDate);
  const occurredDate = fromLocalIsoDate(occurredOn ?? today);
  const defaultSeason = seasonFor(occurredDate, field?.crop ?? null);
  const season = seasonOverride ?? defaultSeason;
  const seasonOptions = [...new Set([
    occurredDate.getFullYear(), occurredDate.getFullYear() + 1, season,
    ...records.map(record => record.season),
  ])].filter(year => year >= 2000 && year <= 2100).sort((a, b) => b - a);
  const areaM2 = field ? selectedAreaM2(field) : 0;
  const valueKopecks = parseMoneyInput(costInput);
  const costInvalid = costInput.trim() !== '' && valueKopecks === null;
  const costKopecks = workCostKopecks(costMode, valueKopecks, areaM2);
  const canSave = !!field && !!workType && !!occurredOn && !costInvalid && !saving;
  const firstStep: Step = showFieldStep ? 1 : 2;
  const visibleStep = showFieldStep ? step : step - 1;
  const visibleStepCount = showFieldStep ? 3 : 2;

  const goBack = () => {
    if (editing && step < 3) setStep(3);
    else if (!editing && step > firstStep) setStep((step - 1) as Step);
    else navigation.goBack();
  };

  const save = async () => {
    if (!canSave || !field || !workType || !occurredOn) return;
    setSaving(true);
    const input: NewRecord = {
      fieldId: field.id,
      kind: 'work',
      workType,
      occurredOn,
      season,
      amountKopecks: costKopecks === null ? null : -costKopecks,
      quantityKg: null,
      note: note.trim() || null,
      details: {
        costMode,
        ...(costMode === 'perHa' && valueKopecks !== null ? {ratePerHaKopecks: valueKopecks} : {}),
        ...(performer ? {performer} : {}),
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
      const parts = [workTypeLabels[workType], field.name, costKopecks ? formatMoney(costKopecks) : null];
      showToast({
        text: `Записано: ${parts.filter(Boolean).join(' · ')}`,
        actionLabel: 'Скасувати',
        onAction: () => {
          removeRecord(record.id).catch(error => {
            logSupabaseError('Не вдалося скасувати запис', error);
            Alert.alert('Не вдалося скасувати', 'Запис можна видалити в журналі.');
          });
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

  const headerTitle = editing ? 'Змінити запис' : `Робота · крок ${visibleStep} з ${visibleStepCount}`;

  return <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
    <View style={styles.header}>
      <FieldFlowHeader title={headerTitle} onBack={goBack}
        rightLabel="Скасувати" onRight={() => navigation.goBack()} />
      {!editing && <View style={styles.progress}>
        {Array.from({length: visibleStepCount}, (_, index) => <View key={index}
          style={[styles.progressBar, index < visibleStep && styles.progressDone]} />)}
      </View>}
      <Text style={styles.title} accessibilityRole="header">{stepTitles[step]}</Text>
    </View>
    <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets contentContainerStyle={styles.content}>

      {step === 1 && <>
        {fields.map(item => <Pressable key={item.id} accessibilityRole="button"
          onPress={() => { setFieldId(item.id); setStep(2); }}
          style={[styles.tile, item.id === fieldId && styles.tileSelected]}>
          <Text style={styles.tileName}>{item.name}</Text>
          <Text style={styles.tileDetail}>
            {[item.crop || fieldTypeLabels[item.type], item.variety, formatArea(selectedAreaM2(item))].filter(Boolean).join(' · ')}
          </Text>
        </Pressable>)}
      </>}

      {step === 2 && <>
        <View style={styles.grid}>
          {workTypes.map(type => <Pressable key={type} accessibilityRole="button"
            onPress={() => { setWorkType(type); setStep(3); }}
            style={[styles.workTile, type === workType && styles.tileSelected]}>
            <AppIcon name={type} color={theme.colors.primary} size={34} strokeWidth={1.8} />
            <Text style={styles.workLabel}>{workTypeLabels[type]}</Text>
          </Pressable>)}
        </View>
      </>}

      {step === 3 && field && workType && <>
        <View style={styles.pills}>
          <Pressable accessibilityRole="button" accessibilityHint="Змінити ділянку" style={styles.pill}
            onPress={() => { setShowFieldStep(true); setStep(1); }}><Text style={styles.pillText}>{field.name}</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityHint="Змінити роботу" style={styles.pill}
            onPress={() => setStep(2)}><Text style={styles.pillText}>{workTypeLabels[workType]}</Text></Pressable>
        </View>

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
          {dateChoice === 'other' && <>
            <TextInput value={otherDate} onChangeText={value => {
              setOtherDate(value); setSeasonOverride(null);
            }} placeholder="дд.мм.рррр"
              placeholderTextColor={theme.colors.textMuted} keyboardType="numbers-and-punctuation"
              accessibilityLabel="Дата роботи, день, місяць і рік через крапку" maxLength={10} style={styles.input} />
            {!occurredOn && <Text style={styles.error}>Введіть дату як 26.09.2026.</Text>}
          </>}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Сезон (рік урожаю)</Text>
          <View style={styles.chips}>
            {seasonOptions.map(year => <Chip key={year} label={String(year)}
              selected={season === year} onPress={() => setSeasonOverride(year)} />)}
          </View>
          <Text style={styles.note}>Робота потрапить до сезону {season}. Осінні роботи під озимі належать до врожаю наступного року.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Скільки коштувало</Text>
          <View style={styles.segmented}>
            {(['sum', 'perHa'] as const).map(mode => <Pressable key={mode} accessibilityRole="button"
              accessibilityState={{selected: costMode === mode}} onPress={() => setCostMode(mode)}
              style={[styles.segment, costMode === mode && styles.segmentSelected]}>
              <Text style={styles.segmentText}>{mode === 'sum' ? 'Сумою' : 'За гектар'}</Text>
            </Pressable>)}
          </View>
          <View style={styles.numberField}>
            <TextInput value={costInput} onChangeText={setCostInput} keyboardType="decimal-pad"
              inputAccessoryViewID={NUMBER_KEYBOARD_BAR} placeholder="0"
              placeholderTextColor={theme.colors.textMuted} style={styles.numberInput}
              accessibilityLabel={costMode === 'sum' ? 'Сума в гривнях' : 'Ціна за гектар у гривнях'} />
            <Text style={styles.suffix}>{costMode === 'sum' ? 'грн' : 'грн/га'}</Text>
          </View>
          {costMode === 'perHa' && valueKopecks !== null && costKopecks !== null && <View style={styles.calcLine}>
            <Text style={styles.calcText}>
              {`${formatMoney(valueKopecks)}/га × ${formatHectares(areaM2)} = ${formatMoney(costKopecks)}`}
            </Text>
          </View>}
          {costInvalid
            ? <Text style={styles.error}>Введіть суму числом, наприклад 3000 або 2,50.</Text>
            : costInput.trim() === '' && <Text style={styles.note}>Можна залишити порожнім і дописати пізніше.</Text>}
        </View>

        <Pressable accessibilityRole="button" accessibilityState={{expanded: detailsOpen}}
          onPress={() => setDetailsOpen(open => !open)} style={styles.detailsToggle}>
          <Text style={styles.label}>Подробиці</Text>
          <AppIcon name={detailsOpen ? 'chevronUp' : 'chevronDown'} color={theme.colors.textMuted} size={22} />
        </Pressable>
        {detailsOpen && <>
          <View style={styles.section}>
            <Text style={styles.label}>Хто робив</Text>
            <View style={styles.chips}>
              {performers.map(value => <Chip key={value} label={performerLabels[value]} selected={performer === value}
                onPress={() => setPerformer(current => (current === value ? null : value))} />)}
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Нотатка</Text>
            <TextInput value={note} onChangeText={setNote} multiline maxLength={500}
              placeholder="Наприклад, насіння 450 кг" placeholderTextColor={theme.colors.textMuted}
              style={[styles.input, styles.noteInput]} />
          </View>
        </>}

        <AppButton label={saving ? 'Зберігаємо…' : 'Зберегти'} disabled={!canSave} onPress={() => { save(); }} />
        {editing && <AppButton label="Видалити запис" variant="danger" onPress={confirmDelete} />}
      </>}
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
