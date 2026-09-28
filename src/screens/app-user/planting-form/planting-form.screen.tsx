import {t} from '../../../shared/config/i18n';
import {useStyles} from './planting-form.styles';
import React, {useState} from 'react';
import {Alert, InputAccessoryView, Keyboard, Platform, Pressable, Text, TextInput, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton, AppIcon, AutocompleteInput, CalendarDatePicker, Page, useToast} from '../../../shared/components/ui';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import {matchSuggestions, parsePositiveNumber, selectedAreaM2} from '../../../shared/core/fields/model';
import type {NewPlanting} from '../../../shared/core/fields/plantingsRepository';
import {useFarmData} from '../../../shared/core/offline/FarmDataProvider';
import {PlantingSeasonTakenError} from '../../../shared/core/offline/farmStore';
import {toLocalIsoDate} from '../../../shared/core/records/model';
import {
  fieldRotation, firstFreeSeason, repeatedFrom, rotatesCrops, sameName, seasonOnField, yieldUnit,
} from '../../../shared/core/rotation/model';
import {logSupabaseError} from '../../../shared/core/supabase/errors';
import {useTheme} from '../../../shared/theme';
import {DateField} from './components/date-field/date-field.component';
import {YearStepper} from '../components/year-stepper/year-stepper.component';
import {ExtraCrops} from './components/extra-crops/extra-crops.component';
import type {ExtraCropDraft} from './components/extra-crops/extra-crop-draft';
import {extraDraftFrom, parseExtraDraft} from './components/extra-crops/extra-crop-draft';

type Props = NativeStackScreenProps<RootStackParamList, 'PlantingForm'>;
type DateKey = 'workStartOn' | 'sownOn' | 'harvestOn';

// The iOS decimal pad has no return key, so the yield field gets a «Готово» bar above it.
const NUMBER_KEYBOARD_BAR = 'planting-form-keyboard-bar';
// Yields are typed in centners per hectare or kilograms per sotka; anything this large is a typo.
const MAX_YIELD = 10000;

function decimalInput(value: number): string {
  return String(Number(value.toFixed(2))).replace('.', ',');
}

// One line of a plot's crop rotation: the harvest year, what grows, its dates and the planned yield.
export function PlantingFormScreen({route, navigation}: Props) {
  const styles = useStyles();
  const {theme} = useTheme();
  const {showToast} = useToast();
  const {fields, updateField} = useFields();
  const {data, store} = useFarmData();
  const {fieldId} = route.params;
  const field = fields.find(item => item.id === fieldId) ?? null;
  const rotation = fieldRotation(data.plantings, fieldId);
  // The line being edited, fixed when the screen opens: saving may move it to another year.
  const [original] = useState(() => (route.params.season === undefined ? null
    : rotation.find(item => item.season === route.params.season) ?? null));
  const [season, setSeason] = useState(() => route.params.season ?? firstFreeSeason(rotation, new Date().getFullYear()));
  const [crop, setCrop] = useState(original?.crop ?? '');
  const [variety, setVariety] = useState(original?.variety ?? '');
  const [yieldInput, setYieldInput] = useState(original?.plannedYieldKgPerHa
    ? decimalInput(original.plannedYieldKgPerHa / 100) : '');
  const [dates, setDates] = useState<Record<DateKey, string | null>>({
    workStartOn: original?.workStartOn ?? null,
    sownOn: original?.sownOn ?? null,
    harvestOn: original?.harvestOn ?? null,
  });
  const [picking, setPicking] = useState<DateKey | null>(null);
  const [note, setNote] = useState(original?.note ?? '');
  const [extraDrafts, setExtraDrafts] = useState<ExtraCropDraft[]>(() =>
    (original?.extraCrops ?? []).map(extraDraftFrom));
  const [saving, setSaving] = useState(false);

  if (!field) return <Page title={t("fieldNotFound")} onBack={() => navigation.goBack()} />;

  // The rest of the rotation, without the line that is being moved or rewritten.
  const others = rotation.filter(item => item.season !== original?.season);
  const taken = others.some(item => item.season === season);
  const previous = others.find(item => item.season === season - 1);
  const cropName = crop.trim();
  const repeat = rotatesCrops(field) ? repeatedFrom({season, crop: cropName || null}, others) : null;
  // Other crops take their own areas; the main crop keeps the rest of the plot.
  const plotAreaM2 = selectedAreaM2(field);
  const parsedExtras = extraDrafts.map(parseExtraDraft);
  const extraCrops = parsedExtras.flatMap(item => item.share ?? []);
  const areaM2 = plotAreaM2 - extraCrops.reduce((sum, share) => sum + share.areaM2, 0);
  const extrasValid = parsedExtras.every(item => item.valid) && areaM2 >= 1;
  const yieldValue = yieldInput.trim() === '' ? null : parsePositiveNumber(yieldInput);
  const yieldInvalid = yieldInput.trim() !== '' && (yieldValue === null || yieldValue >= MAX_YIELD);
  const sowingTooEarly = !!dates.workStartOn && !!dates.sownOn && dates.sownOn < dates.workStartOn;
  const harvestTooEarly = !!dates.harvestOn && ((!!dates.sownOn && dates.harvestOn < dates.sownOn) ||
    (!!dates.workStartOn && dates.harvestOn < dates.workStartOn));
  const canSave = !!store && cropName.length > 0 && !taken && !yieldInvalid && !sowingTooEarly &&
    !harvestTooEarly && extrasValid && !saving;

  // Earlier crops and varieties come first; the plots' current crops are offered too.
  const newestFirst = [...data.plantings].sort((a, b) => b.season - a.season);
  const cropSuggestions = matchSuggestions(crop, [...newestFirst.map(item => item.crop), ...fields.map(item => item.crop)]);
  const extraCropSuggestions = (input: string) => matchSuggestions(input, [
    ...newestFirst.flatMap(item => [item.crop, ...item.extraCrops.map(share => share.crop)]),
    ...fields.map(item => item.crop)]);
  const varietySuggestions = cropName ? matchSuggestions(variety, [
    ...newestFirst.filter(item => item.crop && sameName(item.crop, cropName)).map(item => item.variety),
    ...fields.filter(item => item.crop && sameName(item.crop, cropName)).map(item => item.variety),
  ]) : [];

  const pickDate = (key: DateKey) => {
    Keyboard.dismiss();
    setPicking(key);
  };

  const save = async () => {
    if (!canSave || !store) return;
    setSaving(true);
    const input: NewPlanting = {
      fieldId: field.id, season, crop: cropName, variety: variety.trim() || null, areaM2,
      workStartOn: dates.workStartOn, sownOn: dates.sownOn, harvestOn: dates.harvestOn,
      plannedYieldKgPerHa: yieldValue === null ? null : yieldValue * 100,
      note: note.trim() || null,
      extraCrops,
    };
    try {
      await store.putPlanting(input, original?.season);
      // The plot's current crop follows the season it is in today.
      const updated = [...others, {...input, id: original?.id ?? 'new'}];
      if (seasonOnField(new Date(), updated, field.crop) === season &&
        (field.crop !== input.crop || field.variety !== input.variety)) {
        await updateField(field.id, {...field, crop: input.crop, variety: input.variety});
      }
      navigation.goBack();
      showToast({text: original ? t("changesSaved") : t("addedValue", [`${season} · ${cropName}`])});
    } catch (error) {
      if (!(error instanceof PlantingSeasonTakenError)) logSupabaseError(t("couldNotSaveRotation"), error);
      Alert.alert(t("couldNotSaveRotation"), error instanceof PlantingSeasonTakenError
        ? t("seasonTaken", [season]) : t("couldNotSaveDataOnThePhonePleaseTryAgain"));
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!original || !store) return;
    const recordCount = data.records.filter(record => record.fieldId === field.id &&
      record.season === original.season).length;
    const wasCurrent = seasonOnField(new Date(), rotation, field.crop) === original.season;
    Alert.alert(t("confirmDeleteRotationTitle", [original.season]),
      recordCount > 0 ? t("rotationDeleteKeepsRecords", [recordCount]) : t("rotationDeleteNoRecords"), [
        {text: t("cancel"), style: 'cancel'},
        {text: t("delete"), style: 'destructive', onPress: () => {
          store.removePlanting(field.id, original.season)
            .then(() => (wasCurrent ? updateField(field.id, {...field, crop: null, variety: null}) : undefined))
            .then(() => {
              navigation.goBack();
              showToast({text: t("rotationDeleted")});
            })
            .catch(error => {
              logSupabaseError(t("couldNotDelete"), error);
              Alert.alert(t("couldNotDelete"), t("couldNotSaveChangesOnThePhone"));
            });
        }},
      ]);
  };

  return <>
    <Page title={original ? t("editCropTitle") : t("cropInRotation")} subtitle={field.name}
      onBack={() => navigation.goBack()}
      footer={<AppButton label={saving ? t("saving") : t("save")} disabled={!canSave} onPress={() => { save(); }} />}>
      <View style={styles.section}>
        <Text style={styles.label}>{t("harvestYear")}</Text>
        <YearStepper value={season} onChange={setSeason} />
        <Text style={styles.note}>{t("harvestYearHint")}</Text>
        {taken ? <>
          <Text style={styles.error}>{t("seasonTaken", [season])}</Text>
          <AppButton label={t("openSeasonEntry", [season])} variant="quiet"
            onPress={() => navigation.replace('PlantingForm', {fieldId: field.id, season})} />
        </> : <Text style={styles.note}>{previous?.crop
          ? t("predecessor", [season - 1, [previous.crop, previous.variety].filter(Boolean).join(' · ')])
          : t("noPredecessor", [season - 1])}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t("cropLabel")}</Text>
        <AutocompleteInput value={crop} onChangeText={setCrop} suggestions={cropSuggestions}
          placeholder={t("forExampleWinterWheat")} accessibilityLabel={t("cropLabel")} />
        {repeat ? <View style={styles.warning}>
          <AppIcon name="warning" color={theme.colors.warning} size={20} />
          <Text style={styles.warningText}>{t("sameCropAsYear", [repeat.season])}</Text>
        </View> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t("varietyHybridOptional")}</Text>
        <AutocompleteInput value={variety} onChangeText={setVariety} suggestions={varietySuggestions}
          placeholder={t("forExampleBohdana")} accessibilityLabel={t("variety")} />
      </View>

      <ExtraCrops drafts={extraDrafts} onChange={setExtraDrafts} suggestionsFor={extraCropSuggestions}
        mainCrop={cropName} plotAreaM2={plotAreaM2} keyboardBarId={NUMBER_KEYBOARD_BAR} />

      <View style={styles.section}>
        <Text style={styles.label}>{t("plannedYieldOptional")}</Text>
        <View style={styles.numberField}>
          <TextInput value={yieldInput} onChangeText={setYieldInput} keyboardType="decimal-pad"
            inputAccessoryViewID={NUMBER_KEYBOARD_BAR} placeholder={t("forExample45")}
            placeholderTextColor={theme.colors.textMuted} accessibilityLabel={t("plannedYield")}
            style={styles.numberInput} />
          <Text style={styles.suffix}>{yieldUnit(areaM2)}</Text>
        </View>
        {yieldInvalid ? <Text style={styles.error}>{t("enterAYieldSuchAs45")}</Text> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t("datesOptional")}</Text>
        <DateField label={t("workStartDate")} value={dates.workStartOn} hint={t("workStartHint", [season])}
          onPress={() => pickDate('workStartOn')} onClear={() => setDates(current => ({...current, workStartOn: null}))} />
        <DateField label={t("sowingDate")} value={dates.sownOn}
          onPress={() => pickDate('sownOn')} onClear={() => setDates(current => ({...current, sownOn: null}))} />
        {sowingTooEarly ? <Text style={styles.error}>{t("sowingBeforeWorkStart")}</Text> : null}
        <DateField label={t("harvestDate")} value={dates.harvestOn}
          onPress={() => pickDate('harvestOn')} onClear={() => setDates(current => ({...current, harvestOn: null}))} />
        {harvestTooEarly ? <Text style={styles.error}>{t("harvestBeforeSowing")}</Text> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t("noteOptional")}</Text>
        <TextInput value={note} onChangeText={setNote} multiline maxLength={500}
          placeholder={t("addDetails")} placeholderTextColor={theme.colors.textMuted}
          accessibilityLabel={t("note")} style={[styles.input, styles.noteInput]} />
      </View>

      {original ? <AppButton label={t("deleteFromRotation")} variant="danger" onPress={confirmDelete} /> : null}
    </Page>
    <CalendarDatePicker visible={picking !== null} allowFuture
      selectedDate={(picking ? dates[picking] : null) ?? toLocalIsoDate(new Date())}
      onClose={() => setPicking(null)} onSelect={date => {
        if (picking) setDates(current => ({...current, [picking]: date}));
        setPicking(null);
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
