import {Chip} from '../components/record-chip/record-chip.component';
import {RowSelection} from '../components/row-selection/row-selection.component';
import {useStyles} from './work-record.styles';
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
import {useFarmData} from '../../../shared/core/offline/FarmDataProvider';
import {rowsForSeason, varietyGroups} from '../../../shared/core/rows/model';
import {logSupabaseError} from '../../../shared/core/supabase/errors';
import {useTheme} from '../../../shared/theme';
import {FieldFlowHeader} from '../../../shared/components/field-flow-header/field-flow-header.component';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkRecord'>;
type Step = 1 | 2 | 3;
type DateChoice = 'today' | 'yesterday' | 'other';

// The iOS number pads have no return key, so number fields get a «Готово» bar above them.
const NUMBER_KEYBOARD_BAR = 'work-record-keyboard-bar';
const performers: Performer[] = ['self', 'family', 'neighbour', 'hired'];
const stepTitles: Record<Step, string> = {1: 'Де працювали?', 2: 'Що робили?', 3: 'Коли й скільки?'};


function moneyInputValue(kopecks: number): string {
  return String(Math.abs(kopecks) / 100).replace('.', ',');
}

export function WorkRecordScreen({route, navigation}: Props) {
  const styles = useStyles();
  const {theme} = useTheme();
  const {showToast} = useToast();
  const {fields} = useFields();
  const {records, addRecord, updateRecord, removeRecord} = useRecords();
  const {data} = useFarmData();
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
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>(editing?.details.rowPlantingIds ?? []);
  const [seasonOverride, setSeasonOverride] = useState<number | null>(editing?.season ?? null);
  const [saving, setSaving] = useState(false);

  const field = fields.find(item => item.id === fieldId) ?? null;
  const occurredOn = dateChoice === 'today' ? today : dateChoice === 'yesterday' ? yesterday : parseDateInput(otherDate);
  const occurredDate = fromLocalIsoDate(occurredOn ?? today);
  const defaultSeason = seasonFor(occurredDate, field?.crop ?? null);
  const season = seasonOverride ?? defaultSeason;
  const seasonRows = field ? rowsForSeason(data.rows, field.id, season) : [];
  const rowGroups = varietyGroups(seasonRows);
  const selectedRows = seasonRows.filter(row => selectedRowIds.includes(row.id));
  const selectedGroups = varietyGroups(selectedRows);
  const selectedVariety = selectedGroups.length === 1 ? selectedGroups[0].variety : null;
  const seasonOptions = [...new Set([
    occurredDate.getFullYear(), occurredDate.getFullYear() + 1, season,
    ...records.map(record => record.season),
  ])].filter(year => year >= 2000 && year <= 2100).sort((a, b) => b - a);
  const areaM2 = field ? selectedAreaM2(field) : 0;
  const valueKopecks = parseMoneyInput(costInput);
  const costInvalid = costInput.trim() !== '' && valueKopecks === null;
  const costKopecks = workCostKopecks(costMode, valueKopecks, areaM2);
  const canSave = !!field && !!workType && !!occurredOn && !costInvalid && !saving &&
    (selectedRows.length === 0 || costMode === 'sum');
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
        ...(selectedVariety ? {
          rowPlantingIds: selectedRows.map(row => row.id),
          varietySnapshot: selectedVariety,
          rowNumbersSnapshot: selectedRows.map(row => row.rowNumber).sort((a, b) => a - b),
        } : {}),
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
          onPress={() => { setFieldId(item.id); setSelectedRowIds([]); setStep(2); }}
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

        {rowGroups.length > 0 && <RowSelection groups={rowGroups} selectedIds={selectedRowIds}
          onChange={setSelectedRowIds} mode="work" />}

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
          {selectedRows.length > 0 && costMode === 'perHa' && <Text style={styles.error}>
            Для роботи по рядах оберіть «Сумою» або всю ділянку.
          </Text>}
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
