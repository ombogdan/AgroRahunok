import React from 'react';
import {Text, TextInput, View} from 'react-native';
import {AppButton, InfoCard} from '../../../../../shared/components/ui';
import {useStyles} from './row-count-card.styles';

type Props = {
  count: number;
  value: string;
  onChange: (value: string) => void;
  canAdd: boolean;
  saving: boolean;
  onAdd: () => void;
  canRemoveLast?: boolean;
  onRemoveLast?: () => void;
};

export function RowCountCard({count, value, onChange, canAdd, saving, onAdd, canRemoveLast, onRemoveLast}: Props) {
  const styles = useStyles();
  return <InfoCard>
    <Text style={styles.title}>{count === 0 ? 'Скільки у вас рядів?' : 'Змінити кількість рядів'}</Text>
    <Text style={styles.muted}>{count === 0
      ? 'Ряди нумеруються від 1. Після створення призначте сорт одному рядові або відразу групі.'
      : `Зараз: ${count}. Можна додати ряди або прибрати останній, якщо він порожній.`}</Text>
    <View style={styles.section}>
      <Text style={styles.label}>{count === 0 ? 'Кількість рядів' : 'Нова загальна кількість'}</Text>
      <TextInput value={value} onChangeText={onChange} keyboardType="number-pad"
        placeholder={count === 0 ? 'Наприклад, 6' : 'Наприклад, 8'}
        accessibilityLabel={count === 0 ? 'Кількість рядів' : 'Нова загальна кількість рядів'}
        style={styles.input} />
      {value !== '' && !canAdd && <Text style={styles.error}>
        Вкажіть число більше за {count}, максимум 200.
      </Text>}
      <AppButton label={saving ? 'Зберігаємо…' : count === 0 ? 'Створити ряди' : 'Додати ряди'}
        disabled={!canAdd} onPress={onAdd} />
      {canRemoveLast && onRemoveLast && <AppButton label={`Прибрати порожній ряд №${count}`}
        variant="quiet" onPress={onRemoveLast} />}
    </View>
  </InfoCard>;
}
