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
import {currentRows} from '../../../shared/core/rows/model';
import {logSupabaseError} from '../../../shared/core/supabase/errors';
import {useTheme, useThemedStyles} from '../../../shared/theme';
import type {AppTheme} from '../../../shared/theme/theme';
import {FieldFlowHeader} from './FieldFlowHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'FieldForm'>;
type ManualMethod = 'document' | 'dimensions';

const types: FieldType[] = ['field', 'garden', 'berries', 'orchard', 'greenhouse'];
// The iOS decimal pad has no return key, so number fields get a «Готово» bar above it.
const NUMBER_KEYBOARD_BAR = 'field-number-keyboard-bar';

const createStyles = (theme: AppTheme) => ({
  safe: {flex: 1, backgroundColor: theme.colors.background},
  header: {paddingHorizontal: 20, paddingBottom: 12, backgroundColor: theme.colors.background},
  content: {paddingHorizontal: 20, paddingTop: 4, paddingBottom: 28, gap: 24},
  title: {color: theme.colors.text, fontSize: 34, fontWeight: '700' as const, lineHeight: 41},
  section: {gap: 10},
  label: {color: theme.colors.text, fontSize: 17, fontWeight: '600' as const},
  input: {minHeight: 58, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1,
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface,
    color: theme.colors.text, fontSize: 19},
  dimensions: {flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10},
  dimensionInput: {flex: 1},
  times: {color: theme.colors.textMuted, fontSize: 22, fontWeight: '600' as const},
  chips: {flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8},
  chip: {minHeight: 44, paddingHorizontal: 15, borderRadius: 999, borderWidth: 2,
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface,
    justifyContent: 'center' as const},
  chipSelected: {borderColor: theme.colors.primary, backgroundColor: theme.colors.primary},
  chipText: {color: theme.colors.text, fontSize: 16, fontWeight: '600' as const},
  chipTextSelected: {color: theme.colors.onPrimary},
  note: {color: theme.colors.textMuted, fontSize: 15, lineHeight: 21},
  calcLine: {borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: theme.colors.accentSoft},
  calcText: {color: theme.colors.accentInk, fontSize: 17, fontWeight: '700' as const},
  radio: {padding: 16, borderRadius: 20, borderWidth: 2, borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface, gap: 4},
  radioSelected: {borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft},
  radioTitle: {color: theme.colors.text, fontSize: 17, fontWeight: '600' as const},
  radioValue: {color: theme.colors.textMuted, fontSize: 15},
  save: {marginTop: 2},
  keyboardBar: {flexDirection: 'row' as const, justifyContent: 'flex-end' as const, paddingHorizontal: 12,
    backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border},
  keyboardDone: {minHeight: 44, paddingHorizontal: 8, justifyContent: 'center' as const},
  keyboardDoneText: {color: theme.colors.primary, fontSize: 17, fontWeight: '600' as const},
});

function Chip({label, selected, onPress}: {label: string; selected?: boolean; onPress: () => void}) {
  const styles = useThemedStyles(createStyles);
  return <Pressable accessibilityRole="button" accessibilityState={{selected: !!selected}} onPress={onPress}
    style={[styles.chip, selected && styles.chipSelected]}>
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </Pressable>;
}

export function FieldFormScreen({route, navigation}: Props) {
  const styles = useThemedStyles(createStyles);
  const {theme} = useTheme();
  const {showToast} = useToast();
  const {fields, addField, updateField, removeField, loadState} = useFields();
  const {data, store} = useFarmData();
  const {params} = route;
  const editing = params.mode === 'edit' ? fields.find(item => item.id === params.fieldId) ?? null : null;
  // Area measured before the form opened: on the map, by walking, or stored with the edited plot.
  const presetMeasuredM2 = params.mode === 'map' || params.mode === 'walk'
    ? params.measuredAreaM2 : editing?.measuredAreaM2 ?? null;
  const polygon = params.mode === 'map' || params.mode === 'walk' ? params.polygon : editing?.polygon ?? [];
  const isManual = params.mode === 'manual';
  const canChooseSource = !isManual && presetMeasuredM2 !== null;
  const measuredLabel = params.mode === 'walk' ? 'Виміряна обходом' : params.mode === 'map' ? 'Виміряна на карті' : 'Виміряна';
  const backLabel = params.mode === 'map' ? 'Карта' : params.mode === 'walk' ? 'Обхід' : 'Назад';

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
    const cropName = crop.trim() || null;
    const input = {
      name: name.trim(), type, crop: cropName,
      variety: cropName ? type === 'berries'
        ? (editing?.type === 'berries' ? editing.variety : null) : variety.trim() || null : null,
      documentAreaM2, measuredAreaM2, areaSource: effectiveSource, polygon,
    };
    // Finish saving the planting before returning home, so its season is available there immediately.
    const rememberPlanting = async (fieldId: string): Promise<boolean> => {
      if (!cropName) return true;
      try {
        if (!store) throw new Error('Локальні дані ще завантажуються');
        await store.savePlanting({fieldId, season, crop: cropName, variety: input.variety, areaM2: selectedAreaM2 ?? 0});
        return true;
      } catch (error) {
        logSupabaseError('Не вдалося зберегти культуру сезону', error);
        return false;
      }
    };
    const rememberRows = async (fieldId: string): Promise<boolean> => {
      if (type !== 'berries') return true;
      try {
        if (!store) throw new Error('Локальні дані ще завантажуються');
        await store.ensureRowCount(fieldId, rowCount);
        return true;
      } catch (error) {
        logSupabaseError('Не вдалося зберегти ряди ділянки', error);
        return false;
      }
    };
    try {
      if (editing) {
        await updateField(editing.id, input);
        const plantingSaved = await rememberPlanting(editing.id);
        const rowsSaved = await rememberRows(editing.id);
        if (type === 'berries') navigation.replace('BerryRows', {fieldId: editing.id});
        else navigation.goBack();
        showToast({text: !rowsSaved ? 'Ділянку збережено. Додайте ряди на наступному екрані.'
          : plantingSaved ? 'Зміни збережено' : 'Ділянку збережено, але культуру сезону — ні'});
        return;
      }
      const field = await addField(input);
      const plantingSaved = await rememberPlanting(field.id);
      const rowsSaved = await rememberRows(field.id);
      navigation.reset({index: type === 'berries' ? 2 : 0, routes: type === 'berries'
        ? [{name: 'Tabs', params: {screen: 'Home'}}, {name: 'FieldDetail', params: {fieldId: field.id}},
          {name: 'BerryRows', params: {fieldId: field.id}}]
        : [{name: 'Tabs', params: {screen: 'Home'}}]});
      if (type === 'berries') {
        showToast({text: !rowsSaved ? 'Ділянку збережено. Додайте ряди на цьому екрані.'
          : plantingSaved ? 'Ряди створено. Тепер призначте їм сорти.'
            : 'Ряди створено, але культуру сезону не збережено.'});
        return;
      }
      showToast({
        text: plantingSaved ? `Ділянку «${field.name}» збережено` : 'Ділянку збережено, але культуру сезону — ні',
        actionLabel: 'Скасувати',
        onAction: () => {
          removeField(field.id).catch(error => {
            logSupabaseError('Не вдалося скасувати додавання ділянки', error);
            Alert.alert('Не вдалося скасувати', 'Ділянку можна видалити в її картці.');
          });
        },
      });
    } catch (error) {
      logSupabaseError('Не вдалося зберегти ділянку', error);
      Alert.alert('Не вдалося зберегти ділянку', 'Не вдалося записати дані на телефон. Спробуйте ще раз.');
      setSaving(false);
    }
  };

  const numberInputProps = {
    keyboardType: 'decimal-pad' as const,
    inputAccessoryViewID: NUMBER_KEYBOARD_BAR,
    placeholderTextColor: theme.colors.textMuted,
  };

  return <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
    <View style={styles.header}>
      <FieldFlowHeader backLabel={backLabel} onBack={() => navigation.goBack()} />
      <Text style={styles.title} accessibilityRole="header">{editing ? 'Змінити ділянку' : 'Про ділянку'}</Text>
    </View>
    <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.label}>Назва</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Наприклад, Малинник"
          placeholderTextColor={theme.colors.textMuted} style={styles.input} maxLength={60} returnKeyType="done" />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Тип</Text>
        <View style={styles.chips}>
          {types.map(value => <Chip key={value} label={fieldTypeLabels[value]} selected={type === value}
            onPress={() => setType(value)} />)}
        </View>
      </View>
      {type === 'berries' && <View style={styles.section}>
        <Text style={styles.label}>Ряди та сорти</Text>
        <Text style={styles.note}>Скільки рядів у ягіднику? Після збереження відразу вкажете сорт і рік посадки для кожного ряду або групи рядів.</Text>
        <TextInput value={rowCountInput} onChangeText={setRowCountInput} keyboardType="number-pad"
          inputAccessoryViewID={NUMBER_KEYBOARD_BAR} placeholder="Наприклад, 6"
          placeholderTextColor={theme.colors.textMuted} accessibilityLabel="Кількість рядів"
          style={styles.input} />
        {rowCountInput !== '' && !rowCountValid && <Text style={styles.note}>
          {existingRowCount > 0 ? `Вкажіть не менше ${existingRowCount} і не більше 200 рядів.`
            : 'Вкажіть від 1 до 200 рядів.'}
        </Text>}
        {existingRowCount > 0 && <Text style={styles.note}>
          Зараз є {existingRowCount} рядів. Змінити їхні сорти можна на наступному екрані.
        </Text>}
      </View>}
      <View style={styles.section}>
        <Text style={styles.label}>Культура сезону {season} · необов’язково</Text>
        <AutocompleteInput value={crop} onChangeText={setCrop} suggestions={cropSuggestions}
          placeholder="Наприклад, Пшениця озима" accessibilityLabel={`Культура сезону ${season}`} />
        {crop.trim() !== '' && <>
          {type !== 'berries' && <>
            <Text style={styles.label}>Сорт · необов’язково</Text>
            <AutocompleteInput value={variety} onChangeText={setVariety} suggestions={varietySuggestions}
              placeholder="Наприклад, Богдана" accessibilityLabel="Сорт" />
          </>}
          <Text style={styles.label}>Рік урожаю</Text>
          <View style={styles.chips}>
            {[now.getFullYear(), now.getFullYear() + 1].map(year => <Chip key={year} label={String(year)}
              selected={season === year} onPress={() => setSeasonOverride(year)} />)}
          </View>
          <Text style={styles.note}>Осінній посів озимих — це врожай наступного року.</Text>
        </>}
      </View>
      {isManual && <View style={styles.section}>
        <Text style={styles.label}>Як знаєте площу?</Text>
        <View style={styles.chips}>
          <Chip label="З документів" selected={manualMethod === 'document'} onPress={() => setManualMethod('document')} />
          <Chip label="Довжина × ширина" selected={manualMethod === 'dimensions'}
            onPress={() => setManualMethod('dimensions')} />
        </View>
      </View>}
      {usesDimensions ? <View style={styles.section}>
        <Text style={styles.label}>Довжина і ширина, метри</Text>
        <View style={styles.dimensions}>
          <TextInput {...numberInputProps} value={lengthInput} onChangeText={setLengthInput}
            placeholder="Довжина" accessibilityLabel="Довжина в метрах" style={[styles.input, styles.dimensionInput]} />
          <Text style={styles.times}>×</Text>
          <TextInput {...numberInputProps} value={widthInput} onChangeText={setWidthInput}
            placeholder="Ширина" accessibilityLabel="Ширина в метрах" style={[styles.input, styles.dimensionInput]} />
        </View>
        {dimensionsAreaM2 !== null && <View style={styles.calcLine}>
          <Text style={styles.calcText}>
            {`${lengthInput.trim()} м × ${widthInput.trim()} м = ${formatSotky(dimensionsAreaM2)} · ${formatHectares(dimensionsAreaM2, {exact: true})}`}
          </Text>
        </View>}
        <Text style={styles.note}>Для прямокутної ділянки. Якщо форма складніша, обведіть її на карті або обійдіть з телефоном.</Text>
      </View> : <View style={styles.section}>
        <Text style={styles.label}>{isManual ? 'Площа за документами' : 'Площа за документами · необов’язково'}</Text>
        <TextInput {...numberInputProps} value={areaInput} onChangeText={value => {
          setAreaInput(value);
          if (canChooseSource && areaSource === 'document' && parseAreaInput(value, unit) === null) {
            setAreaSource('measured');
          }
        }} placeholder={unit === 'sotka' ? 'Наприклад, 20' : 'Наприклад, 2,2'} style={styles.input} />
        {!documentInputValid && <Text style={styles.note}>Введіть додатне число, наприклад 20 або 0,5.</Text>}
        <View style={styles.chips}>
          <Chip label="Сотки" selected={unit === 'sotka'} onPress={() => setUnit('sotka')} />
          <Chip label="Гектари" selected={unit === 'hectare'} onPress={() => setUnit('hectare')} />
        </View>
      </View>}
      {canChooseSource && <View style={styles.section}>
        <Text style={styles.label}>Яку площу брати в розрахунки?</Text>
        <Pressable accessibilityRole="radio" accessibilityState={{checked: areaSource === 'measured'}}
          onPress={() => setAreaSource('measured')}
          style={[styles.radio, areaSource === 'measured' && styles.radioSelected]}>
          <Text style={styles.radioTitle}>{areaSource === 'measured' ? '◉' : '◯'} {measuredLabel}</Text>
          <Text style={styles.radioValue}>{formatArea(presetMeasuredM2 ?? 0)}</Text>
        </Pressable>
        {documentAreaM2 !== null && <Pressable accessibilityRole="radio"
          accessibilityState={{checked: areaSource === 'document'}} onPress={() => setAreaSource('document')}
          style={[styles.radio, areaSource === 'document' && styles.radioSelected]}>
          <Text style={styles.radioTitle}>{areaSource === 'document' ? '◉' : '◯'} За документами</Text>
          <Text style={styles.radioValue}>{formatArea(documentAreaM2)}</Text>
        </Pressable>}
        <Text style={styles.note}>Збережемо обидві площі.</Text>
      </View>}
      <View style={styles.save}>
        <AppButton label={saving ? 'Зберігаємо…' : type === 'berries' ? 'Далі: сорти рядів'
          : editing ? 'Зберегти зміни' : 'Зберегти ділянку'}
          disabled={!canSave} onPress={() => { save(); }} />
      </View>
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
