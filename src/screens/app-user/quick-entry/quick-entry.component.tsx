import React, {useState} from 'react';
import {Alert, Pressable, Text, TextInput, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {EntryKind, RootStackParamList} from '../../../navigation/types';
import {AppButton, DemoBadge, InfoCard, Page} from '../../../shared/components/ui';
import {useScreenStyles} from '../screen.styles';
import {useStyles} from './quick-entry.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'QuickEntry'>;

const labels: Record<EntryKind, string> = {
  work: 'Робота',
  harvest: 'Збір',
  sale: 'Продаж',
};

export function QuickEntryScreen({route}: Props) {
  const [kind, setKind] = useState<EntryKind>(route.params?.kind || 'work');
  const [amount, setAmount] = useState('');
  const styles = useStyles();
  const common = useScreenStyles();
  const amountLabel = kind === 'work' ? 'Вартість, грн' : kind === 'harvest' ? 'Кількість' : 'Сума продажу, грн';

  return (
    <Page title="Швидкий запис" subtitle="Приклад майбутнього вводу за кілька дотиків" withHeader>
      <DemoBadge />
      <Text style={common.sectionTitle}>Що записуємо?</Text>
      <View style={styles.choices}>
        {(['work', 'harvest', 'sale'] as const).map(option => (
          <Pressable
            key={option}
            accessibilityRole="button"
            onPress={() => {
              setKind(option);
              setAmount('');
            }}
            style={[styles.choice, kind === option && styles.choiceActive]}>
            <Text style={styles.choiceText}>{labels[option]}</Text>
          </Pressable>
        ))}
      </View>
      <InfoCard>
        <Text style={common.label}>Ділянка</Text>
        <Text style={common.body}>{kind === 'work' ? 'Пшеничне поле' : 'Малинник'}</Text>
        <Text style={common.label}>Дата</Text>
        <Text style={common.body}>Сьогодні</Text>
        <Text style={common.label}>{amountLabel}</Text>
        <TextInput
          accessibilityLabel={amountLabel}
          keyboardType="decimal-pad"
          placeholder={kind === 'harvest' ? 'Наприклад, 3 відра' : 'Введіть суму'}
          placeholderTextColor="#809187"
          value={amount}
          onChangeText={setAmount}
          style={styles.input}
        />
        <AppButton
          label="Попередній перегляд"
          onPress={() =>
            Alert.alert(
              'Макет запису',
              `${labels[kind]} · ${amount || 'кількість не вказана'}\nЗбереження зʼявиться після локальної бази.`,
            )
          }
        />
      </InfoCard>
      <Text style={common.muted}>
        Після тесту з реальними записами додамо підстановку останньої ділянки,
        дати й одиниці виміру.
      </Text>
    </Page>
  );
}
