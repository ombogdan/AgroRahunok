import {t} from '../../../shared/config/i18n';
import {useStyles} from './field-form.styles';
import React, {useState} from 'react';
import {Alert, InputAccessoryView, Keyboard, Platform, Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton, AutocompleteInput, useToast} from '../../../shared/components/ui';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import type {AreaSource, AreaUnit, FieldType} from '../../../shared/core/fields/model';
import {
  areaInputValue,
  fieldTypeLabels,
  formatArea,
  formatHectares,
  formatSotky,
  matchSuggestions,
  parseAreaInput,
  rectangleAreaM2,
} from '../../../shared/core/fields/model';
import {useFarmData} from '../../../shared/core/offline/FarmDataProvider';
import {seasonFor} from '../../../shared/core/records/model';
import {rotatesCrops} from '../../../shared/core/rotation/model';
import {currentRows} from '../../../shared/core/rows/model';
import {logSupabaseError} from '../../../shared/core/supabase/errors';
import {useTheme} from '../../../shared/theme';
import {FieldFlowHeader} from '../../../shared/components/field-flow-header/field-flow-header.component';
import {Chip} from './components/choice-chip/choice-chip.component';
import {FieldBoundary} from './components/field-boundary/field-boundary.component';

type Props = NativeStackScreenProps<RootStackParamList, 'FieldForm'>;
type ManualMethod = 'document' | 'dimensions';

const types: FieldType[] = ['field', 'garden', 'berries', 'orchard', 'greenhouse'];
// The iOS decimal pad has no return key, so number fields get a «Готово» bar above it.
const NUMBER_KEYBOARD_BAR = 'field-number-keyboard-bar';


export function FieldFormScreen({route, navigation}: Props) {
  const styles = useStyles();
  const {theme} = useTheme();
  const {showToast} = useToast();
  const {fields, addField, updateField, removeField, loadState} = useFields();
  const {data, store} = useFarmData();
  const {params} = route;
  const editing = params.mode === 'edit' ? fields.find(item => item.id === params.fieldId) ?? null : null;
  // A contour just redrawn or walked again for the edited plot; it is saved together with the form.
  const boundary = params.mode === 'edit' ? params.boundary ?? null : null;
  // Area measured before the form opened: on the map, by walking, or stored with the edited plot.
  const presetMeasuredM2 = params.mode === 'map' || params.mode === 'walk'
    ? params.measuredAreaM2 : boundary?.measuredAreaM2 ?? editing?.measuredAreaM2 ?? null;
  const polygon = params.mode === 'map' || params.mode === 'walk' ? params.polygon
    : boundary?.polygon ?? editing?.polygon ?? [];
  const isManual = params.mode === 'manual';
  const canChooseSource = !isManual && presetMeasuredM2 !== null;
  const measuredBy = params.mode === 'map' || params.mode === 'walk' ? params.mode : boundary?.source;
  const measuredLabel = measuredBy === 'walk' ? t("measuredByWalking")
    : measuredBy === 'map' ? t("measuredOnMap") : t("measuredArea");
  const backLabel = params.mode === 'map' ? t("map") : params.mode === 'walk' ? t("walkBoundary") : t("back");

  const initialDocM2 = editing?.documentAreaM2 ?? null;
  const initialUnit: AreaUnit = initialDocM2 !== null && initialDocM2 >= 5000 ? 'hectare' : 'sotka';
  const [name, setName] = useState(editing?.name ?? '');
  const [type, setType] = useState<FieldType>(editing?.type ?? 'field');
  const existingRowCount = editing ? currentRows(data.rows, editing.id).length : 0;
  const [rowCountInput, setRowCountInput] = useState(editing?.type === 'berries' && existingRowCount > 0
    ? String(existingRowCount) : '');
  const [crop, setCrop] = useState(editing?.crop ?? '');
  const [variety, setVariety] = useState(editing?.variety ?? '');
  // The crop belongs to a harvest year; autumn-sown winter crops default to the next one.
  const [seasonOverride, setSeasonOverride] = useState<number | null>(null);
  const [unit, setUnit] = useState<AreaUnit>(initialUnit);
  const [areaInput, setAreaInput] = useState(initialDocM2 === null ? '' : areaInputValue(initialDocM2, initialUnit));
  const [manualMethod, setManualMethod] = useState<ManualMethod>('document');
  const [lengthInput, setLengthInput] = useState('');
  const [widthInput, setWidthInput] = useState('');
  const [areaSource, setAreaSource] = useState<AreaSource>(
    editing?.areaSource ?? (presetMeasuredM2 !== null ? 'measured' : 'document'));
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const season = seasonOverride ?? seasonFor(now, crop.trim() || null);
  // Suggestions come from what was typed on other plots, newest first.
  const newestFirst = [...fields].reverse();
  const cropSuggestions = matchSuggestions(crop, newestFirst.map(item => item.crop));
  const varietySuggestions = crop.trim() ? matchSuggestions(variety, newestFirst
    .filter(item => item.crop?.trim().toLocaleLowerCase('uk') === crop.trim().toLocaleLowerCase('uk'))
    .map(item => item.variety)) : [];
  const usesDimensions = isManual && manualMethod === 'dimensions';
  const showDocumentArea = isManual || presetMeasuredM2 === null;
  // A field, garden or greenhouse gets its crops year by year in the crop rotation, not here.
  const asksCrop = !rotatesCrops({type});
  const documentAreaM2 = usesDimensions ? null : parseAreaInput(areaInput, unit);
  const dimensionsAreaM2 = rectangleAreaM2(lengthInput, widthInput);
  const measuredAreaM2 = usesDimensions ? dimensionsAreaM2 : presetMeasuredM2;
  const effectiveSource: AreaSource = usesDimensions ? 'measured' : canChooseSource ? areaSource : 'document';
  const selectedAreaM2 = effectiveSource === 'measured' ? measuredAreaM2 : documentAreaM2;
  const documentInputValid = usesDimensions || areaInput.trim().length === 0 || documentAreaM2 !== null;
  const rowCount = Number(rowCountInput);
  const rowCountValid = type !== 'berries' || (/^\d+$/.test(rowCountInput) &&
    rowCount >= Math.max(1, existingRowCount) && rowCount <= 200);
  const canSave = name.trim().length > 0 && (selectedAreaM2 ?? 0) >= 1 && documentInputValid && !saving &&
    rowCountValid && loadState === 'ready' && (params.mode !== 'edit' || editing !== null);

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    // Without the crop question the plot keeps the crop its rotation gave it.
    const cropName = asksCrop ? crop.trim() || null : editing?.crop ?? null;
    const varietyName = !asksCrop ? editing?.variety ?? null
      : !cropName ? null
        : type === 'berries' ? (editing?.type === 'berries' ? editing.variety : null)
          : variety.trim() || null;
    const input = {
      name: name.trim(), type, crop: cropName, variety: varietyName,
      documentAreaM2, measuredAreaM2, areaSource: effectiveSource, polygon,
    };
    // Finish saving the planting before returning home, so its season is available there immediately.
    const rememberPlanting = async (fieldId: string): Promise<boolean> => {
      if (!asksCrop || !cropName) return true;
      try {
        if (!store) throw new Error(t("localDataIsStillLoading"));
        await store.savePlanting({fieldId, season, crop: cropName, variety: input.variety, areaM2: selectedAreaM2 ?? 0});
        return true;
      } catch (error) {
        logSupabaseError(t("couldNotSaveSeasonCrop"), error);
        return false;
      }
    };
    const rememberRows = async (fieldId: string): Promise<boolean> => {
      if (type !== 'berries') return true;
      try {
        if (!store) throw new Error(t("localDataIsStillLoading"));
        await store.ensureRowCount(fieldId, rowCount);
        return true;
      } catch (error) {
        logSupabaseError(t("couldNotSaveFieldRows"), error);
        return false;
      }
    };
    try {
      if (editing) {
        await updateField(editing.id, input);
        const plantingSaved = await rememberPlanting(editing.id);
        const rowsSaved = await rememberRows(editing.id);
        if (type === 'berries') navigation.replace('RowsSetup', {fieldId: editing.id});
        else navigation.goBack();
        showToast({text: !rowsSaved ? t("fieldSavedAddRowsOnTheNextScreen")
          : plantingSaved ? t("changesSaved") : t("fieldSavedButTheSeasonCropWasNotSaved")});
        return;
      }
      const field = await addField(input);
      const plantingSaved = await rememberPlanting(field.id);
      const rowsSaved = await rememberRows(field.id);
      navigation.reset({index: type === 'berries' ? 2 : 0, routes: type === 'berries'
        ? [{name: 'Tabs', params: {screen: 'Home'}}, {name: 'FieldDetail', params: {fieldId: field.id}},
          {name: 'RowsSetup', params: {fieldId: field.id}}]
        : [{name: 'Tabs', params: {screen: 'Home'}}]});
      if (type === 'berries') {
        showToast({text: !rowsSaved ? t("fieldSavedAddRowsOnThisScreen")
          : plantingSaved ? t("rowsCreatedNowAssignVarieties")
            : t("rowsCreatedButTheSeasonCropWasNotSaved")});
        return;
      }
      showToast({
        text: plantingSaved ? t("fieldSavedMessage", [field.name]) : t("fieldSavedButTheSeasonCropWasNotSaved"),
        actionLabel: t("cancel"),
        onAction: () => {
          removeField(field.id).catch(error => {
            logSupabaseError(t("couldNotUndoAddingTheField"), error);
            Alert.alert(t("couldNotUndo"), t("youCanDeleteTheFieldFromItsDetails"));
          });
        },
      });
    } catch (error) {
      logSupabaseError(t("couldNotSaveField"), error);
      Alert.alert(t("couldNotSaveField"), t("couldNotSaveDataOnThePhonePleaseTryAgain"));
      setSaving(false);
    }
  };

  const numberInputProps = {
    keyboardType: 'decimal-pad' as const,
    inputAccessoryViewID: NUMBER_KEYBOARD_BAR,
    placeholderTextColor: theme.colors.textMuted,
  };

  const documentAreaForm = <View style={styles.section}>
    <Text style={styles.label}>{showDocumentArea ? t("documentedAreaLabel") : t("documentedAreaOptional")}</Text>
    <TextInput {...numberInputProps} value={areaInput} onChangeText={value => {
      setAreaInput(value);
      if (canChooseSource && areaSource === 'document' && parseAreaInput(value, unit) === null) {
        setAreaSource('measured');
      }
    }} placeholder={unit === 'sotka' ? t("forExample20") : t("forExample22")} style={styles.input} />
    {!documentInputValid && <Text style={styles.note}>{t("enterAPositiveNumberSuchAs20Or05")}</Text>}
    <View style={styles.chips}>
      <Chip label={t("ares")} selected={unit === 'sotka'} onPress={() => setUnit('sotka')} />
      <Chip label={t("hectares")} selected={unit === 'hectare'} onPress={() => setUnit('hectare')} />
    </View>
  </View>;

  return <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
    <View style={styles.header}>
      <FieldFlowHeader backLabel={backLabel} onBack={() => navigation.goBack()} />
      <Text style={styles.title} accessibilityRole="header">{editing ? t("editField") : t("aboutTheField")}</Text>
    </View>
    <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.label}>{t("name")}</Text>
        <TextInput value={name} onChangeText={setName} placeholder={t("forExampleRaspberryPlot")}
          placeholderTextColor={theme.colors.textMuted} style={styles.input} maxLength={60} returnKeyType="done" />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>{t("type")}</Text>
        <View style={styles.chips}>
          {types.map(value => <Chip key={value} label={t(fieldTypeLabels[value])} selected={type === value}
            onPress={() => setType(value)} />)}
        </View>
      </View>
      {type === 'berries' && <View style={styles.section}>
        <Text style={styles.label}>{t("rowsAndVarieties")}</Text>
        <Text style={styles.note}>{t("berryRowCountDescription")}</Text>
        <TextInput value={rowCountInput} onChangeText={setRowCountInput} keyboardType="number-pad"
          inputAccessoryViewID={NUMBER_KEYBOARD_BAR} placeholder={t("forExample6")}
          placeholderTextColor={theme.colors.textMuted} accessibilityLabel={t("numberOfRows")}
          style={styles.input} />
        {rowCountInput !== '' && !rowCountValid && <Text style={styles.note}>
          {existingRowCount > 0 ? t("rowCountRangeError", [existingRowCount])
            : t("enterBetween1And200Rows")}
        </Text>}
        {existingRowCount > 0 && <Text style={styles.note}>{t("currentlyThereAre", [], "both")}{existingRowCount}{t("rowsYouCanChangeTheirVarietiesOnTheNextScreen", [], "both")}</Text>}
      </View>}
      {isManual && <View style={styles.section}>
        <Text style={styles.label}>{t("howDoYouKnowTheArea")}</Text>
        <View style={styles.chips}>
          <Chip label={t("fromDocuments")} selected={manualMethod === 'document'} onPress={() => setManualMethod('document')} />
          <Chip label={t("lengthWidth")} selected={manualMethod === 'dimensions'}
            onPress={() => setManualMethod('dimensions')} />
        </View>
      </View>}
      {usesDimensions ? <View style={styles.section}>
        <Text style={styles.label}>{t("lengthAndWidthMetres")}</Text>
        <View style={styles.dimensions}>
          <TextInput {...numberInputProps} value={lengthInput} onChangeText={setLengthInput}
            placeholder={t("length")} accessibilityLabel={t("lengthInMetres")} style={[styles.input, styles.dimensionInput]} />
          <Text style={styles.times}>×</Text>
          <TextInput {...numberInputProps} value={widthInput} onChangeText={setWidthInput}
            placeholder={t("width")} accessibilityLabel={t("widthInMetres")} style={[styles.input, styles.dimensionInput]} />
        </View>
        {dimensionsAreaM2 !== null && <View style={styles.calcLine}>
          <Text style={styles.calcText}>
            {t("rectangleAreaFormula", [lengthInput.trim(), widthInput.trim(), formatSotky(dimensionsAreaM2), formatHectares(dimensionsAreaM2, {exact: true})])}
          </Text>
        </View>}
        <Text style={styles.note}>{t("rectangleAreaHint")}</Text>
      </View> : showDocumentArea && documentAreaForm}
      {editing && <FieldBoundary polygon={polygon}
        onDraw={() => navigation.navigate('FieldMap', {fieldId: editing.id, polygon})}
        onWalk={() => navigation.navigate('FieldWalk', {fieldId: editing.id})} />}
      {presetMeasuredM2 !== null && <View style={styles.section}>
        <Text style={styles.label}>{measuredLabel}</Text>
        <Text style={styles.areaValue}>{formatArea(presetMeasuredM2)}</Text>
      </View>}
      {/* Always open: optional fields hidden behind a toggle were never filled in. */}
      {(asksCrop || !showDocumentArea) && <Text style={styles.detailsHeading} accessibilityRole="header">
        {asksCrop ? t("cropAndOtherDetailsOptional") : t("detailsOptional")}
      </Text>}
      {asksCrop && <View style={styles.section}>
        <Text style={styles.label}>{t("seasonCrop", [], "after")}{season}{t("optional", [], "before")}</Text>
        <AutocompleteInput value={crop} onChangeText={setCrop} suggestions={cropSuggestions}
          placeholder={t("forExampleWinterWheat")} accessibilityLabel={t("cropForSeasonYear", [season])} />
        {crop.trim() !== '' && <>
          {type !== 'berries' && <>
            <Text style={styles.label}>{t("varietyOptional")}</Text>
            <AutocompleteInput value={variety} onChangeText={setVariety} suggestions={varietySuggestions}
              placeholder={t("forExampleBohdana")} accessibilityLabel={t("variety")} />
          </>}
          <Text style={styles.label}>{t("harvestYear")}</Text>
          <View style={styles.chips}>
            {[now.getFullYear(), now.getFullYear() + 1].map(year => <Chip key={year} label={String(year)}
              selected={season === year} onPress={() => setSeasonOverride(year)} />)}
          </View>
          <Text style={styles.note}>{t("autumnSownWinterCropsBelongToNextYearSHarvest")}</Text>
        </>}
      </View>}
      {!showDocumentArea && documentAreaForm}
      {canChooseSource && documentAreaM2 !== null && <View style={styles.section}>
        <Text style={styles.label}>{t("whichAreaShouldBeUsedInCalculations")}</Text>
        <Pressable accessibilityRole="radio" accessibilityState={{checked: areaSource === 'measured'}}
          onPress={() => setAreaSource('measured')}
          style={[styles.radio, areaSource === 'measured' && styles.radioSelected]}>
          <Text style={styles.radioTitle}>{areaSource === 'measured' ? '◉' : '◯'} {measuredLabel}</Text>
          <Text style={styles.radioValue}>{formatArea(presetMeasuredM2 ?? 0)}</Text>
        </Pressable>
        {documentAreaM2 !== null && <Pressable accessibilityRole="radio"
          accessibilityState={{checked: areaSource === 'document'}} onPress={() => setAreaSource('document')}
          style={[styles.radio, areaSource === 'document' && styles.radioSelected]}>
          <Text style={styles.radioTitle}>{areaSource === 'document' ? '◉' : '◯'}{t("documentedAreaOption", [], "before")}</Text>
          <Text style={styles.radioValue}>{formatArea(documentAreaM2)}</Text>
        </Pressable>}
        <Text style={styles.note}>{t("bothAreaValuesWillBeSaved")}</Text>
      </View>}
      <View style={styles.save}>
        <AppButton label={saving ? t("saving") : type === 'berries' ? t("nextRowVarieties")
          : editing ? t("saveChanges") : t("saveField")}
          disabled={!canSave} onPress={() => { save(); }} />
      </View>
    </ScrollView>
    {Platform.OS === 'ios' && <InputAccessoryView nativeID={NUMBER_KEYBOARD_BAR}>
      <View style={styles.keyboardBar}>
        <Pressable accessibilityRole="button" onPress={Keyboard.dismiss} style={styles.keyboardDone}>
          <Text style={styles.keyboardDoneText}>{t("done")}</Text>
        </Pressable>
      </View>
    </InputAccessoryView>}
  </SafeAreaView>;
}
