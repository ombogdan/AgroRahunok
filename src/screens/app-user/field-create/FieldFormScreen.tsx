import React, {useState} from 'react';
import {Alert, Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton} from '../../../shared/components/ui';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import type {AreaSource, FieldType} from '../../../shared/core/fields/model';
import {fieldTypeLabels, formatArea, parseAreaInput} from '../../../shared/core/fields/model';
import {useTheme, useThemedStyles} from '../../../shared/theme';
import type {AppTheme} from '../../../shared/theme/theme';
import {FieldFlowHeader} from './FieldFlowHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'FieldForm'>;
const nameSuggestions: {name: string; type: FieldType}[] = [
  {name: 'Поле', type: 'field'}, {name: 'Город', type: 'garden'},
  {name: 'Малинник', type: 'berries'}, {name: 'Сад', type: 'orchard'},
];
const types: FieldType[] = ['field', 'garden', 'berries', 'orchard', 'greenhouse'];
const crops = ['Пшениця озима', 'Соняшник', 'Кукурудза', 'Картопля', 'Малина'];

const createStyles = (theme: AppTheme) => ({
  safe: {flex: 1, backgroundColor: theme.colors.background},
  content: {paddingHorizontal: 20, paddingBottom: 28, gap: 24},
  title: {color: theme.colors.text, fontSize: 34, fontWeight: '700' as const, lineHeight: 41},
  section: {gap: 10},
  label: {color: theme.colors.text, fontSize: 17, fontWeight: '600' as const},
  input: {minHeight: 58, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1,
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface,
    color: theme.colors.text, fontSize: 19},
  chips: {flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8},
  chip: {minHeight: 44, paddingHorizontal: 15, borderRadius: 999, borderWidth: 2,
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface,
    justifyContent: 'center' as const},
  chipSelected: {borderColor: theme.colors.primary, backgroundColor: theme.colors.primary},
  chipText: {color: theme.colors.text, fontSize: 16, fontWeight: '600' as const},
  chipTextSelected: {color: theme.colors.onPrimary},
  note: {color: theme.colors.textMuted, fontSize: 15, lineHeight: 21},
  radio: {padding: 16, borderRadius: 20, borderWidth: 2, borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface, gap: 4},
  radioSelected: {borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft},
  radioTitle: {color: theme.colors.text, fontSize: 17, fontWeight: '600' as const},
  radioValue: {color: theme.colors.textMuted, fontSize: 15},
  save: {marginTop: 2},
});

export function FieldFormScreen({route, navigation}: Props) {
  const styles = useThemedStyles(createStyles);
  const {theme} = useTheme();
  const {addField, loadState} = useFields();
  const isMap = route.params.mode === 'map';
  const measuredAreaM2 = isMap ? route.params.measuredAreaM2 : null;
  const polygon = isMap ? route.params.polygon : [];
  const [name, setName] = useState('');
  const [type, setType] = useState<FieldType>('field');
  const [crop, setCrop] = useState('');
  const [areaInput, setAreaInput] = useState('');
  const [unit, setUnit] = useState<'sotka' | 'hectare'>('sotka');
  const [areaSource, setAreaSource] = useState<AreaSource>(isMap ? 'measured' : 'document');
  const [saving, setSaving] = useState(false);
  const documentAreaM2 = parseAreaInput(areaInput, unit);
  const validArea = areaSource === 'measured' ? (measuredAreaM2 ?? 0) >= 1 : (documentAreaM2 ?? 0) >= 1;
  const documentInputValid = areaInput.trim().length === 0 || documentAreaM2 !== null;
  const canSave = name.trim().length > 0 && validArea && documentInputValid && !saving && loadState === 'ready';

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await addField({
        name: name.trim(), type, crop: crop.trim() || null,
        documentAreaM2, measuredAreaM2, areaSource, polygon,
      });
      navigation.reset({index: 0, routes: [{name: 'Tabs', params: {screen: 'Home'}}]});
    } catch {
      Alert.alert('Не вдалося зберегти ділянку', 'Перевірте вільне місце на телефоні та спробуйте ще раз.');
      setSaving(false);
    }
  };

  return <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
      <FieldFlowHeader backLabel={isMap ? 'Карта' : 'Назад'} onBack={() => navigation.goBack()} />
      <Text style={styles.title}>Про ділянку</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Назва</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Наприклад, Малинник"
          placeholderTextColor={theme.colors.textMuted} style={styles.input} maxLength={60} />
        <View style={styles.chips}>
          {nameSuggestions.map(suggestion => <Pressable key={suggestion.name} onPress={() => {setName(suggestion.name); setType(suggestion.type);}} style={styles.chip}>
            <Text style={styles.chipText}>{suggestion.name}</Text>
          </Pressable>)}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Тип</Text>
        <View style={styles.chips}>
          {types.map(value => <Pressable key={value} onPress={() => setType(value)}
            style={[styles.chip, type === value && styles.chipSelected]}>
            <Text style={[styles.chipText, type === value && styles.chipTextSelected]}>{fieldTypeLabels[value]}</Text>
          </Pressable>)}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Культура цього сезону · необов’язково</Text>
        <TextInput value={crop} onChangeText={setCrop} placeholder="Вкажіть культуру"
          placeholderTextColor={theme.colors.textMuted} style={styles.input} maxLength={60} />
        <View style={styles.chips}>
          {crops.map(value => <Pressable key={value} onPress={() => setCrop(value)} style={styles.chip}>
            <Text style={styles.chipText}>{value}</Text>
          </Pressable>)}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>{isMap ? 'Площа за документами · необов’язково' : 'Площа за документами'}</Text>
        <TextInput value={areaInput} onChangeText={value => {
          setAreaInput(value);
          if (isMap && areaSource === 'document' && parseAreaInput(value, unit) === null) {
            setAreaSource('measured');
          }
        }} keyboardType="decimal-pad"
          placeholder={unit === 'sotka' ? 'Наприклад, 20' : 'Наприклад, 2,2'}
          placeholderTextColor={theme.colors.textMuted} style={styles.input} />
        {!documentInputValid && <Text style={styles.note}>Введіть додатне число, наприклад 20 або 0,5.</Text>}
        <View style={styles.chips}>
          {(['sotka', 'hectare'] as const).map(value => <Pressable key={value} onPress={() => setUnit(value)}
            style={[styles.chip, unit === value && styles.chipSelected]}>
            <Text style={[styles.chipText, unit === value && styles.chipTextSelected]}>
              {value === 'sotka' ? 'Сотки' : 'Гектари'}
            </Text>
          </Pressable>)}
        </View>
      </View>
      {isMap && <View style={styles.section}>
        <Text style={styles.label}>Яку площу брати в розрахунки?</Text>
        <Pressable onPress={() => setAreaSource('measured')}
          style={[styles.radio, areaSource === 'measured' && styles.radioSelected]}>
          <Text style={styles.radioTitle}>{areaSource === 'measured' ? '◉' : '◯'} Виміряна на карті</Text>
          <Text style={styles.radioValue}>{formatArea(measuredAreaM2 ?? 0)}</Text>
        </Pressable>
        {documentAreaM2 !== null && <Pressable onPress={() => setAreaSource('document')}
          style={[styles.radio, areaSource === 'document' && styles.radioSelected]}>
          <Text style={styles.radioTitle}>{areaSource === 'document' ? '◉' : '◯'} За документами</Text>
          <Text style={styles.radioValue}>{formatArea(documentAreaM2)}</Text>
        </Pressable>}
        <Text style={styles.note}>Збережемо обидві площі.</Text>
      </View>}
      <View style={styles.save}>
        <AppButton label={saving ? 'Зберігаємо…' : 'Зберегти ділянку'} disabled={!canSave} onPress={() => { save(); }} />
      </View>
    </ScrollView>
  </SafeAreaView>;
}
