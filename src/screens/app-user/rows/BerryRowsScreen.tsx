import React, {useEffect, useState} from 'react';
import {Alert, Pressable, Text, TextInput, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton, InfoCard, Page} from '../../../shared/components/ui';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import {useFarmData} from '../../../shared/core/offline/FarmDataProvider';
import {currentRows} from '../../../shared/core/rows/model';
import {useTheme, useThemedStyles} from '../../../shared/theme';
import type {AppTheme} from '../../../shared/theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BerryRows'>;

const createStyles = (theme: AppTheme) => ({
  title: {color: theme.colors.text, fontSize: 22, lineHeight: 28, fontWeight: '700' as const},
  muted: {color: theme.colors.textMuted, fontSize: 15, lineHeight: 21},
  label: {color: theme.colors.text, fontSize: 17, fontWeight: '600' as const},
  input: {minHeight: 56, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1,
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface,
    color: theme.colors.text, fontSize: 19},
  range: {flexDirection: 'row' as const, gap: 10},
  half: {flex: 1},
  section: {gap: 10},
  row: {minHeight: 64, borderTopWidth: 1, borderTopColor: theme.colors.border,
    flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12},
  number: {width: 54, color: theme.colors.primary, fontSize: 20, fontWeight: '700' as const},
  rowBody: {flex: 1, gap: 2},
  variety: {color: theme.colors.text, fontSize: 17, fontWeight: '600' as const},
  error: {color: theme.colors.danger, fontSize: 15},
});

function numberInput(value: string, onChangeText: (value: string) => void, label: string, style: object) {
  return <TextInput value={value} onChangeText={onChangeText} keyboardType="number-pad"
    placeholder={label} accessibilityLabel={label} style={style} />;
}

export function BerryRowsScreen({route, navigation}: Props) {
  const styles = useThemedStyles(createStyles);
  const {theme} = useTheme();
  const {fields} = useFields();
  const {data, store} = useFarmData();
  const field = fields.find(item => item.id === route.params.fieldId);
  const active = currentRows(data.rows, route.params.fieldId);
  const [countInput, setCountInput] = useState('');
  const [firstInput, setFirstInput] = useState('1');
  const [lastInput, setLastInput] = useState('');
  const [variety, setVariety] = useState(field?.variety ?? '');
  const [yearInput, setYearInput] = useState(String(new Date().getFullYear()));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (active.length > 0) setLastInput(previous => previous || String(active.length));
  }, [active.length]);

  if (!field) {
    return <Page title="Ділянку не знайдено" onBack={() => navigation.goBack()} />;
  }

  const requestedCount = Number(countInput);
  const canAdd = /^\d+$/.test(countInput) && requestedCount > active.length && requestedCount <= 200 && !saving;
  const first = Number(firstInput);
  const last = Number(lastInput);
  const year = Number(yearInput);
  const canAssign = !!store && /^\d+$/.test(firstInput) && /^\d+$/.test(lastInput) &&
    /^\d{4}$/.test(yearInput) && first >= 1 && last >= first && last <= active.length &&
    year >= 2000 && year <= new Date().getFullYear() + 1 && variety.trim().length > 0 && !saving;
  const lastRow = active[active.length - 1];
  const canRemoveLast = !!lastRow && lastRow.variety === null &&
    !data.rows.some(item => item.fieldId === field.id && item.rowNumber === lastRow.rowNumber && item.id !== lastRow.id);

  const addRows = async () => {
    if (!store || !canAdd) return;
    setSaving(true);
    try {
      await store.ensureRowCount(field.id, requestedCount);
      setCountInput('');
    } catch (error) {
      Alert.alert('Не вдалося додати ряди', error instanceof Error ? error.message : 'Спробуйте ще раз.');
    } finally { setSaving(false); }
  };

  const saveVariety = async () => {
    if (!store || !canAssign) return;
    setSaving(true);
    try {
      await store.assignRowVariety(field.id, first, last, variety, year);
      setFirstInput('');
      setLastInput('');
      setVariety('');
    } catch (error) {
      Alert.alert('Не вдалося призначити сорт', error instanceof Error ? error.message : 'Спробуйте ще раз.');
    } finally { setSaving(false); }
  };

  const removeLast = () => {
    if (!store || !canRemoveLast || saving) return;
    Alert.alert(`Прибрати ряд №${lastRow.rowNumber}?`, 'Можна прибрати лише порожній останній ряд.', [
      {text: 'Скасувати', style: 'cancel'},
      {text: 'Прибрати', style: 'destructive', onPress: () => {
        store.removeLastEmptyRow(field.id).catch(error => {
          Alert.alert('Не вдалося прибрати ряд', error instanceof Error ? error.message : 'Спробуйте ще раз.');
        });
      }},
    ]);
  };

  return <Page title="Ряди та сорти" subtitle={field.name} onBack={() => navigation.goBack()}>
    {active.length === 0 && <InfoCard>
      <Text style={styles.title}>Скільки у вас рядів?</Text>
      <Text style={styles.muted}>Ряди нумеруються від 1. Після створення призначте сорт одному рядові або відразу групі.</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Кількість рядів</Text>
        {numberInput(countInput, setCountInput, 'Наприклад, 6', styles.input)}
        {countInput !== '' && !canAdd && <Text style={styles.error}>
          Вкажіть число більше за {active.length}, максимум 200.
        </Text>}
        <AppButton label={saving ? 'Зберігаємо…' : 'Створити ряди'}
          disabled={!canAdd || !store} onPress={addRows} />
      </View>
    </InfoCard>}

    {active.length > 0 && <InfoCard>
      <Text style={styles.title}>Який сорт у яких рядах?</Text>
      <Text style={styles.muted}>Рядів: {active.length}. Почніть з одного сорту для всіх рядів або змініть номери для кожного сорту.</Text>
      <Text style={styles.muted}>Торкніться рядка нижче, щоб заповнити його номер. Для кількох сусідніх рядів вкажіть діапазон.</Text>
      <View style={styles.range}>
        {numberInput(firstInput, setFirstInput, 'Від ряду №', [styles.input, styles.half])}
        {numberInput(lastInput, setLastInput, 'До ряду №', [styles.input, styles.half])}
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Сорт</Text>
        <TextInput value={variety} onChangeText={setVariety} maxLength={60}
          placeholder="Наприклад, Полка" placeholderTextColor={theme.colors.textMuted}
          accessibilityLabel="Сорт" style={styles.input} />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Рік посадки</Text>
        {numberInput(yearInput, setYearInput, 'Наприклад, 2026', styles.input)}
      </View>
      <Text style={styles.muted}>Якщо змінюєте вже записаний сорт, вкажіть рік нової посадки. Попередній сорт лишиться в історії.</Text>
      <AppButton label={saving ? 'Зберігаємо…' : 'Призначити сорт'} disabled={!canAssign} onPress={saveVariety} />
    </InfoCard>}

    {active.length > 0 && <InfoCard>
      <Text style={styles.title}>Схема рядів</Text>
      {active.map(row => {
        const history = data.rows.filter(item => item.fieldId === field.id &&
          item.rowNumber === row.rowNumber && item.endedYear !== null)
          .sort((a, b) => (b.endedYear ?? 0) - (a.endedYear ?? 0));
        return <Pressable key={row.id} accessibilityRole="button" onPress={() => {
          setFirstInput(String(row.rowNumber));
          setLastInput(String(row.rowNumber));
          setVariety(row.variety ?? '');
          setYearInput(String(row.plantedYear ?? new Date().getFullYear()));
        }} style={styles.row}>
          <Text style={styles.number}>№{row.rowNumber}</Text>
          <View style={styles.rowBody}>
            <Text style={styles.variety}>{row.variety ?? 'Сорт ще не вказано'}</Text>
            {row.plantedYear !== null && <Text style={styles.muted}>
              {row.plantedYear > new Date().getFullYear() ? 'Заплановано на' : 'Посаджено'}: {row.plantedYear}
            </Text>}
            {history.map(old => <Text key={old.id} style={styles.muted}>
              Було: {old.variety} · {old.plantedYear}–{old.endedYear}
            </Text>)}
          </View>
        </Pressable>;
      })}
    </InfoCard>}
    {active.length > 0 && <InfoCard>
      <Text style={styles.title}>Змінити кількість рядів</Text>
      <Text style={styles.muted}>Зараз: {active.length}. Можна додати ряди або прибрати останній, якщо він порожній.</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Нова загальна кількість</Text>
        {numberInput(countInput, setCountInput, 'Наприклад, 8', styles.input)}
        {countInput !== '' && !canAdd && <Text style={styles.error}>
          Вкажіть число більше за {active.length}, максимум 200.
        </Text>}
        <AppButton label={saving ? 'Зберігаємо…' : 'Додати ряди'} disabled={!canAdd || !store} onPress={addRows} />
        {canRemoveLast && <AppButton label={`Прибрати порожній ряд №${lastRow.rowNumber}`}
          variant="quiet" onPress={removeLast} />}
      </View>
    </InfoCard>}
    {active.length > 0 && <AppButton label="Готово" variant="secondary" onPress={() => navigation.goBack()} />}
  </Page>;
}
