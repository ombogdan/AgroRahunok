import React from 'react';
import {Text, TextInput, View} from 'react-native';
import {AppButton, InfoCard} from '../../../../../shared/components/ui';
import {useTheme} from '../../../../../shared/theme';
import {useStyles} from './row-variety-form.styles';

type Props = {
  rowCount: number;
  first: string;
  last: string;
  onFirstChange: (value: string) => void;
  onLastChange: (value: string) => void;
  variety: string;
  onVarietyChange: (value: string) => void;
  year: string;
  onYearChange: (value: string) => void;
  canSave: boolean;
  saving: boolean;
  onSave: () => void;
};

export function RowVarietyForm(props: Props) {
  const styles = useStyles();
  const {theme} = useTheme();
  return <InfoCard>
    <Text style={styles.title}>Який сорт у яких рядах?</Text>
    <Text style={styles.muted}>Рядів: {props.rowCount}. Почніть з одного сорту для всіх рядів або змініть номери для кожного сорту.</Text>
    <Text style={styles.muted}>Для одного ряду вкажіть лише перший номер. Другий номер потрібен тільки для діапазону.</Text>
    <View style={styles.range}>
      <TextInput value={props.first} onChangeText={props.onFirstChange} keyboardType="number-pad"
        placeholder="Від ряду №" accessibilityLabel="Від ряду №" style={[styles.input, styles.half]} />
      <TextInput value={props.last} onChangeText={props.onLastChange} keyboardType="number-pad"
        placeholder="До № · необов’язково" accessibilityLabel="До ряду №, необов’язково" style={[styles.input, styles.half]} />
    </View>
    <View style={styles.section}>
      <Text style={styles.label}>Сорт</Text>
      <TextInput value={props.variety} onChangeText={props.onVarietyChange} maxLength={60}
        placeholder="Наприклад, Полка" placeholderTextColor={theme.colors.textMuted}
        accessibilityLabel="Сорт" style={styles.input} />
    </View>
    <View style={styles.section}>
      <Text style={styles.label}>Рік посадки</Text>
      <TextInput value={props.year} onChangeText={props.onYearChange} keyboardType="number-pad"
        placeholder="Наприклад, 2026" accessibilityLabel="Рік посадки" style={styles.input} />
    </View>
    <Text style={styles.muted}>Якщо змінюєте вже записаний сорт, вкажіть рік нової посадки. Попередній сорт лишиться в історії.</Text>
    <AppButton label={props.saving ? 'Зберігаємо…' : 'Призначити сорт'}
      disabled={!props.canSave} onPress={props.onSave} />
  </InfoCard>;
}
