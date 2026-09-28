import {t} from '../../../shared/config/i18n';
import {Chip} from '../components/record-chip/record-chip.component';
import {RowSelection} from '../components/row-selection/row-selection.component';
import {useStyles} from './work-record.styles';
import React, {useState} from 'react';
import {
  Alert, InputAccessoryView, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton, AppIcon, CalendarDatePicker, useToast} from '../../../shared/components/ui';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import {fieldTypeLabels, formatArea, formatHectares, selectedAreaM2} from '../../../shared/core/fields/model';
import type {CostMode, NewRecord, Performer, WorkType} from '../../../shared/core/records/model';
import {
  formatDateInput, formatMoney, fromLocalIsoDate, materialsCostKopecks, parseDateInput, parseMoneyInput,
  performerLabels, seasonFor, toLocalIsoDate, workCostKopecks, workTypeLabels, workTypes,
} from '../../../shared/core/records/model';
import {useRecords} from '../../../shared/core/records/RecordsProvider';
import {useFarmData} from '../../../shared/core/offline/FarmDataProvider';
import {rowsForSeason, varietyGroups} from '../../../shared/core/rows/model';
import {fieldRotation, seasonCropOf, seasonOnField} from '../../../shared/core/rotation/model';
import {logSupabaseError} from '../../../shared/core/supabase/errors';
import {useTheme} from '../../../shared/theme';
import {FieldFlowHeader} from '../../../shared/components/field-flow-header/field-flow-header.component';
import {MaterialsSection} from './components/materials-section/materials-section.component';
import type {MaterialDraft} from './components/material-sheet/material-draft';
import {draftFrom, parseDraft} from './components/material-sheet/material-draft';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkRecord'>;
type Step = 1 | 2 | 3;
type DateChoice = 'today' | 'yesterday' | 'other';

// The iOS number pads have no return key, so number fields get a «Готово» bar above them.
const NUMBER_KEYBOARD_BAR = 'work-record-keyboard-bar';
const performers: Performer[] = ['self', 'family', 'neighbour', 'hired'];
const stepTitles: Record<Step, string> = {1: 'whereDidYouWork', 2: 'whatWorkWasDone', 3: 'whenAndHowMuch'};


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
  // The saved amount includes the materials, so the job's own cost is what is left without them.
  const editingMaterialsCost = materialsCostKopecks(editing?.details.materials);
  const initialCost = editing
    ? initialCostMode === 'perHa' && editing.details.ratePerHaKopecks
      ? moneyInputValue(editing.details.ratePerHaKopecks)
      : editing.amountKopecks === null ? ''
        : editingMaterialsCost === 0 ? moneyInputValue(editing.amountKopecks)
          : Math.abs(editing.amountKopecks) > editingMaterialsCost
            ? moneyInputValue(Math.abs(editing.amountKopecks) - editingMaterialsCost) : ''
    : '';

  const [step, setStep] = useState<Step>(editing ? 3 : singleField ? 2 : 1);
  const [showFieldStep, setShowFieldStep] = useState(!singleField);
  const [fieldId, setFieldId] = useState<string | null>(editing?.fieldId ?? singleField?.id ?? null);
  const [workType, setWorkType] = useState<WorkType | null>(editing?.workType ?? null);
  const [dateChoice, setDateChoice] = useState<DateChoice>(initialDate);
  const [otherDate, setOtherDate] = useState(editing && initialDate === 'other' ? formatDateInput(editing.occurredOn) : '');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [costMode, setCostMode] = useState<CostMode>(initialCostMode);
  const [costInput, setCostInput] = useState(initialCost);
  const [performer, setPerformer] = useState<Performer | null>(editing?.details.performer ?? null);
  const [note, setNote] = useState(editing?.note ?? '');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>(editing?.details.rowPlantingIds ?? []);
  const [materialDrafts, setMaterialDrafts] = useState<MaterialDraft[]>(() =>
    (editing?.details.materials ?? []).map(draftFrom));
  const [seasonOverride, setSeasonOverride] = useState<number | null>(editing?.season ?? null);
  const [saving, setSaving] = useState(false);

  const field = fields.find(item => item.id === fieldId) ?? null;
  const occurredOn = dateChoice === 'today' ? today : dateChoice === 'yesterday' ? yesterday : parseDateInput(otherDate);
  const occurredDate = fromLocalIsoDate(occurredOn ?? today);
  // The crop rotation's start of works decides when autumn jobs already count for next year.
  const defaultSeason = field
    ? seasonOnField(occurredDate, fieldRotation(data.plantings, field.id), field.crop)
    : seasonFor(occurredDate, null);
  const season = seasonOverride ?? defaultSeason;
  const seasonRows = field ? rowsForSeason(data.rows, field.id, season) : [];
  const rowGroups = varietyGroups(seasonRows);
  const selectedRows = seasonRows.filter(row => selectedRowIds.includes(row.id));
  const selectedGroups = varietyGroups(selectedRows);
  const selectedGroup = selectedGroups.length === 1 ? selectedGroups[0] : null;
  const seasonOptions = [...new Set([
    occurredDate.getFullYear(), occurredDate.getFullYear() + 1, season,
    ...records.map(record => record.season),
  ])].filter(year => year >= 2000 && year <= 2100).sort((a, b) => b - a);
  const areaM2 = field ? selectedAreaM2(field) : 0;
  const valueKopecks = parseMoneyInput(costInput);
  const costInvalid = costInput.trim() !== '' && valueKopecks === null;
  const costKopecks = workCostKopecks(costMode, valueKopecks, areaM2);
  const parsedMaterials = materialDrafts.map(parseDraft);
  const materials = parsedMaterials.flatMap(item => item.material ?? []);
  const materialsCost = materialsCostKopecks(materials);
  // What the record adds to the season's expenses: the job itself and the priced materials.
  const totalCostKopecks = costKopecks === null && materialsCost === 0 ? null : (costKopecks ?? 0) + materialsCost;
  // New seed starts with the crop the rotation has on this plot for the season.
  const seedName = field ? seasonCropOf(field, season, data.plantings, data.rows).label ?? '' : '';
  const canSave = !!field && !!workType && !!occurredOn && !costInvalid && !saving &&
    parsedMaterials.every(item => item.valid) && (selectedRows.length === 0 || costMode === 'sum');
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
      amountKopecks: totalCostKopecks === null ? null : -totalCostKopecks,
      quantityKg: null,
      note: note.trim() || null,
      details: {
        costMode,
        ...(costMode === 'perHa' && valueKopecks !== null ? {ratePerHaKopecks: valueKopecks} : {}),
        ...(performer ? {performer} : {}),
        ...(materials.length > 0 ? {materials} : {}),
        ...(selectedGroup ? {
          rowPlantingIds: selectedRows.map(row => row.id),
          ...(selectedGroup.crop ? {cropSnapshot: selectedGroup.crop} : {}),
          varietySnapshot: selectedGroup.variety,
          rowNumbersSnapshot: selectedRows.map(row => row.rowNumber).sort((a, b) => a - b),
        } : {}),
      },
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
      const parts = [t(workTypeLabels[workType]), field.name, totalCostKopecks ? formatMoney(totalCostKopecks) : null];
      showToast({
        text: t("recordedValue", [parts.filter(Boolean).join(' · ')]),
        actionLabel: t("cancel"),
        onAction: () => {
          removeRecord(record.id).catch(error => {
            logSupabaseError(t("couldNotUndoTheRecord"), error);
            Alert.alert(t("couldNotUndo"), t("youCanDeleteTheRecordInTheLogbook"));
          });
        },
      });
    } catch (error) {
      logSupabaseError(t("couldNotSaveRecord"), error);
      Alert.alert(t("couldNotSaveRecord"), t("couldNotSaveDataOnThePhone"));
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!editing) return;
    Alert.alert(t("confirmDeleteRecordTitle"), t("theRecordWillBePermanentlyDeleted"), [
      {text: t("cancel"), style: 'cancel'},
      {text: t("delete"), style: 'destructive', onPress: () => {
        removeRecord(editing.id).then(() => navigation.goBack()).catch(error => {
          logSupabaseError(t("couldNotDeleteRecord"), error);
          Alert.alert(t("couldNotDeleteRecord"), t("couldNotSaveChangesOnThePhone"));
        });
      }},
    ]);
  };

  return <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
    <View style={styles.header}>
      <FieldFlowHeader title={editing ? t("editRecord") : undefined} onBack={goBack}
        rightLabel={t("cancel")} onRight={() => navigation.goBack()} />
      {!editing && <>
        <Text style={styles.stepLabel}>{t("workStep", [], "after")}{visibleStep}{t("of", [], "both")}{visibleStepCount}</Text>
        <View style={styles.progress}>
          {Array.from({length: visibleStepCount}, (_, index) => <View key={index}
            style={[styles.progressBar, index < visibleStep && styles.progressDone]} />)}
        </View>
      </>}
      <Text style={styles.title} accessibilityRole="header">{t(stepTitles[step])}</Text>
    </View>
    <KeyboardAvoidingView style={styles.body} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive"
      contentContainerStyle={styles.content}>

      {step === 1 && <>
        {fields.map(item => <Pressable key={item.id} accessibilityRole="button"
          onPress={() => { setFieldId(item.id); setSelectedRowIds([]); setStep(2); }}
          style={[styles.tile, item.id === fieldId && styles.tileSelected]}>
          <Text style={styles.tileName}>{item.name}</Text>
          <Text style={styles.tileDetail}>
            {[item.crop || t(fieldTypeLabels[item.type]), item.variety, formatArea(selectedAreaM2(item))].filter(Boolean).join(' · ')}
          </Text>
        </Pressable>)}
      </>}

      {step === 2 && <>
        <View style={styles.grid}>
          {workTypes.map(type => <Pressable key={type} accessibilityRole="button"
            onPress={() => { setWorkType(type); setStep(3); }}
            style={[styles.workTile, type === workType && styles.tileSelected]}>
            <AppIcon name={type} color={theme.colors.primary} size={34} strokeWidth={1.8} />
            <Text style={styles.workLabel}>{t(workTypeLabels[type])}</Text>
          </Pressable>)}
        </View>
      </>}

      {step === 3 && field && workType && <>
        <View style={styles.pills}>
          <Pressable accessibilityRole="button" accessibilityHint={t("editField")} style={styles.pill}
            onPress={() => { setShowFieldStep(true); setStep(1); }}><Text style={styles.pillText}>{field.name}</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityHint={t("editWorkRecord")} style={styles.pill}
            onPress={() => setStep(2)}><Text style={styles.pillText}>{t(workTypeLabels[workType])}</Text></Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("when")}</Text>
          <View style={styles.chips}>
            <Chip label={t("today")} selected={dateChoice === 'today'} onPress={() => {
              setDateChoice('today'); setSeasonOverride(null);
            }} />
            <Chip label={t("yesterday")} selected={dateChoice === 'yesterday'} onPress={() => {
              setDateChoice('yesterday'); setSeasonOverride(null);
            }} />
            <Chip label={dateChoice === 'other' ? t("selectedOtherDate", [otherDate]) : t("otherDate")}
              selected={dateChoice === 'other'} onPress={() => { Keyboard.dismiss(); setCalendarOpen(true); }} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{costMode === 'sum' ? t("costOptional") : t("costPerHectare")}</Text>
          <View style={styles.numberField}>
            <TextInput value={costInput} onChangeText={setCostInput} keyboardType="decimal-pad"
              inputAccessoryViewID={NUMBER_KEYBOARD_BAR} placeholder="0"
              placeholderTextColor={theme.colors.textMuted} style={styles.numberInput}
              accessibilityLabel={costMode === 'sum' ? t("amountInUah") : t("pricePerHectareInUah")} />
            <Text style={styles.suffix}>{costMode === 'sum' ? t("uah") : t("uahHa")}</Text>
          </View>
          {costMode === 'perHa' && valueKopecks !== null && costKopecks !== null && <View style={styles.calcLine}>
            <Text style={styles.calcText}>
              {t("costPerHectareFormula", [formatMoney(valueKopecks), formatHectares(areaM2), formatMoney(costKopecks)])}
            </Text>
          </View>}
          {costInvalid && <Text style={styles.error}>{t("enterAnAmountSuchAs3000Or250")}</Text>}
          {selectedRows.length > 0 && costMode === 'perHa' && <Text style={styles.error}>{t("selectedRowsCostModeHint", [], "both")}</Text>}
        </View>

        <MaterialsSection drafts={materialDrafts} onChange={setMaterialDrafts} seedName={seedName} season={season}
          workCostKopecks={costKopecks} />

        {/* Always open: optional fields hidden behind a toggle were never filled in. */}
        <Text style={styles.detailsHeading} accessibilityRole="header">{t("detailsOptional")}</Text>
        <View style={styles.section}>
          <Text style={styles.label}>{t("howShouldTheCostBeCalculated")}</Text>
          <View style={styles.segmented}>
            {(['sum', 'perHa'] as const).map(mode => <Pressable key={mode} accessibilityRole="button"
              accessibilityState={{selected: costMode === mode}} onPress={() => setCostMode(mode)}
              style={[styles.segment, costMode === mode && styles.segmentSelected]}>
              <Text style={styles.segmentText}>{mode === 'sum' ? t("totalAmount") : t("perHectare")}</Text>
            </Pressable>)}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>{t("seasonHarvestYear")}</Text>
          <View style={styles.chips}>
            {seasonOptions.map(year => <Chip key={year} label={String(year)}
              selected={season === year} onPress={() => setSeasonOverride(year)} />)}
          </View>
          <Text style={styles.note}>{t("automatically", [], "after")}{season}{t("winterCropSeasonHint")}</Text>
        </View>
        {rowGroups.length > 0 && <RowSelection groups={rowGroups} selectedIds={selectedRowIds}
          onChange={setSelectedRowIds} mode="work" />}
        <View style={styles.section}>
          <Text style={styles.label}>{t("whoDidTheWork")}</Text>
          <View style={styles.chips}>
            {performers.map(value => <Chip key={value} label={t(performerLabels[value])} selected={performer === value}
              onPress={() => setPerformer(current => (current === value ? null : value))} />)}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>{t("note")}</Text>
          <TextInput value={note} onChangeText={setNote} multiline maxLength={500}
            placeholder={t("forExampleSeed450Kg")} placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, styles.noteInput]} />
        </View>

        {editing && <AppButton label={t("deleteRecord")} variant="danger" onPress={confirmDelete} />}
      </>}
    </ScrollView>
    {step === 3 && <View style={styles.footer}>
      <AppButton label={saving ? t("saving") : t("save")} disabled={!canSave} onPress={() => { save(); }} />
    </View>}
    </KeyboardAvoidingView>
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
  </SafeAreaView>;
}
