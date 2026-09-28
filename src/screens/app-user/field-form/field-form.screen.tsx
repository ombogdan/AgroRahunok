import {t} from '../../../shared/config/i18n';
import {useStyles} from './field-form.styles';
import React, {useState} from 'react';
import {Alert, InputAccessoryView, Keyboard, Platform, Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton, useToast} from '../../../shared/components/ui';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import type {AreaSource, AreaUnit, FieldType} from '../../../shared/core/fields/model';
import {
  areaInputValue,
  fieldTypeLabels,
  formatArea,
  formatHectares,
  formatSotky,
  noticeableAreaError,
  parseAreaInput,
  rectangleAreaM2,
  selectedAreaM2 as plotAreaM2,
} from '../../../shared/core/fields/model';
import {useFarmData} from '../../../shared/core/offline/FarmDataProvider';
import {currentRows, usesRows} from '../../../shared/core/rows/model';
import {logSupabaseError} from '../../../shared/core/supabase/errors';
import {useTheme} from '../../../shared/theme';
import {FieldFlowHeader} from '../../../shared/components/field-flow-header/field-flow-header.component';
import {Chip} from './components/choice-chip/choice-chip.component';
import {FieldBoundary} from './components/field-boundary/field-boundary.component';

type Props = NativeStackScreenProps<RootStackParamList, 'FieldForm'>;
type ManualMethod = 'document' | 'dimensions';

const allTypes: FieldType[] = ['field', 'garden', 'berries', 'orchard', 'greenhouse'];
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
  const hasContour = polygon.length >= 3;
  const measuredBy = params.mode === 'map' || params.mode === 'walk' ? params.mode : boundary?.source;
  const measuredLabel = measuredBy === 'walk' ? t("measuredByWalking")
    : measuredBy === 'map' ? t("measuredOnMap") : t("measuredArea");
  const backLabel = params.mode === 'map' ? t("map") : params.mode === 'walk' ? t("walkBoundary") : t("back");

  // Without a contour the typed area counts, so an edited plot starts from the area it uses now.
  const initialTypedM2 = editing ? (editing.polygon.length < 3 ? plotAreaM2(editing) || null : editing.documentAreaM2)
    : null;
  const initialUnit: AreaUnit = initialTypedM2 !== null && initialTypedM2 >= 5000 ? 'hectare' : 'sotka';
  const [name, setName] = useState(editing?.name ?? '');
  const [type, setType] = useState<FieldType>(editing?.type ?? 'field');
  // Gardens are no longer offered for new plots; an existing garden keeps its type.
  const types = allTypes.filter(value => value !== 'garden' || editing?.type === 'garden');
  const existingRowCount = editing ? currentRows(data.rows, editing.id).length : 0;
  const [rowCountInput, setRowCountInput] = useState(editing && usesRows(editing) && existingRowCount > 0
    ? String(existingRowCount) : '');
  const [unit, setUnit] = useState<AreaUnit>(initialUnit);
  const [areaInput, setAreaInput] = useState(initialTypedM2 === null ? '' : areaInputValue(initialTypedM2, initialUnit));
  const [manualMethod, setManualMethod] = useState<ManualMethod>('document');
  const [lengthInput, setLengthInput] = useState('');
  const [widthInput, setWidthInput] = useState('');
  const [note, setNote] = useState(editing?.note ?? '');
  const [saving, setSaving] = useState(false);

  // Crops are not asked here: fields and greenhouses get them in the crop rotation,
  // berry plots and orchards in their rows.
  const plotUsesRows = usesRows({type});
  const usesDimensions = isManual && manualMethod === 'dimensions';
  // The typed («за документами») area is only for a plot entered by hand, without a contour.
  const asksTypedArea = !hasContour && !usesDimensions;
  const typedAreaM2 = asksTypedArea ? parseAreaInput(areaInput, unit) : null;
  const dimensionsAreaM2 = rectangleAreaM2(lengthInput, widthInput);
  const measuredAreaM2 = usesDimensions ? dimensionsAreaM2 : presetMeasuredM2;
  // A contour or length × width measures the plot; the typed area of a plot that has a contour is kept as it was.
  const areaSource: AreaSource = usesDimensions || hasContour ? 'measured' : 'document';
  const documentAreaM2 = asksTypedArea ? typedAreaM2 : editing?.documentAreaM2 ?? null;
  const selectedAreaM2 = areaSource === 'measured' ? measuredAreaM2 : documentAreaM2;
  const areaError = hasContour && presetMeasuredM2 !== null ? noticeableAreaError(polygon, presetMeasuredM2) : null;
  const typedAreaValid = !asksTypedArea || areaInput.trim().length === 0 || typedAreaM2 !== null;
  const rowCount = Number(rowCountInput);
  const rowCountValid = !plotUsesRows || (/^\d+$/.test(rowCountInput) &&
    rowCount >= Math.max(1, existingRowCount) && rowCount <= 200);
  const canSave = name.trim().length > 0 && (selectedAreaM2 ?? 0) >= 1 && typedAreaValid && !saving &&
    rowCountValid && loadState === 'ready' && (params.mode !== 'edit' || editing !== null);

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    // The plot keeps the crop its crop rotation gave it.
    const input = {
      name: name.trim(), type, crop: editing?.crop ?? null, variety: editing?.variety ?? null,
      documentAreaM2, measuredAreaM2, areaSource, polygon, note: note.trim() || null,
    };
    const rememberRows = async (fieldId: string): Promise<boolean> => {
      if (!plotUsesRows) return true;
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
        const rowsSaved = await rememberRows(editing.id);
        if (plotUsesRows) navigation.replace('RowsSetup', {fieldId: editing.id});
        else navigation.goBack();
        showToast({text: rowsSaved ? t("changesSaved") : t("fieldSavedAddRowsOnTheNextScreen")});
        return;
      }
      const field = await addField(input);
      const rowsSaved = await rememberRows(field.id);
      navigation.reset({index: plotUsesRows ? 2 : 0, routes: plotUsesRows
        ? [{name: 'Tabs', params: {screen: 'Home'}}, {name: 'FieldDetail', params: {fieldId: field.id}},
          {name: 'RowsSetup', params: {fieldId: field.id}}]
        : [{name: 'Tabs', params: {screen: 'Home'}}]});
      if (plotUsesRows) {
        showToast({text: rowsSaved ? t("rowsCreatedNowAssignCrops") : t("fieldSavedAddRowsOnThisScreen")});
        return;
      }
      showToast({
        text: t("fieldSavedMessage", [field.name]),
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

  const typedAreaForm = <View style={styles.section}>
    <Text style={styles.label}>{isManual ? t("documentedAreaLabel") : t("plotAreaLabel")}</Text>
    <TextInput {...numberInputProps} value={areaInput} onChangeText={setAreaInput}
      placeholder={unit === 'sotka' ? t("forExample20") : t("forExample22")} style={styles.input} />
    {!typedAreaValid && <Text style={styles.note}>{t("enterAPositiveNumberSuchAs20Or05")}</Text>}
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
      {plotUsesRows && <View style={styles.section}>
        <Text style={styles.label}>{t("rowsAndVarieties")}</Text>
        <Text style={styles.note}>{t("rowCountDescription")}</Text>
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
      </View> : asksTypedArea && typedAreaForm}
      {editing && <FieldBoundary polygon={polygon}
        onDraw={() => navigation.navigate('FieldMap', {fieldId: editing.id, polygon})}
        onWalk={() => navigation.navigate('FieldWalk', {fieldId: editing.id})} />}
      {hasContour && presetMeasuredM2 !== null && <View style={styles.section}>
        <Text style={styles.label}>{measuredLabel}</Text>
        <Text style={styles.areaValue}>{formatArea(presetMeasuredM2)}</Text>
        {areaError && <Text style={styles.note}>
          {t("areaErrorHint", [formatArea(areaError.errorM2), Math.round(areaError.percent)])}. {t("areaErrorExplanation")}
        </Text>}
      </View>}
      <View style={styles.section}>
        <Text style={styles.label}>{t("noteOptional")}</Text>
        <TextInput value={note} onChangeText={setNote} multiline maxLength={500}
          placeholder={t("fieldNotePlaceholder")} placeholderTextColor={theme.colors.textMuted}
          accessibilityLabel={t("note")} style={[styles.input, styles.noteInput]} />
      </View>
      <View style={styles.save}>
        <AppButton label={saving ? t("saving") : plotUsesRows ? t("nextRows")
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
