import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {InfoCard} from '../../../../../shared/components/ui';
import type {RowPlanting} from '../../../../../shared/core/rows/model';
import {useStyles} from './row-scheme.styles';

type Props = {
  fieldId: string;
  rows: RowPlanting[];
  history: RowPlanting[];
  onSelect: (row: RowPlanting) => void;
};

export function RowScheme({fieldId, rows, history, onSelect}: Props) {
  const styles = useStyles();
  const currentYear = new Date().getFullYear();
  return <InfoCard>
    <Text style={styles.title}>Схема рядів</Text>
    {rows.map(row => {
      const previous = history.filter(item => item.fieldId === fieldId &&
        item.rowNumber === row.rowNumber && item.endedYear !== null)
        .sort((a, b) => (b.endedYear ?? 0) - (a.endedYear ?? 0));
      return <Pressable key={row.id} accessibilityRole="button" onPress={() => onSelect(row)} style={styles.row}>
        <Text style={styles.number}>№{row.rowNumber}</Text>
        <View style={styles.body}>
          <Text style={styles.variety}>{row.variety ?? 'Сорт ще не вказано'}</Text>
          {row.plantedYear !== null && <Text style={styles.muted}>
            {row.plantedYear > currentYear ? 'Заплановано на' : 'Посаджено'}: {row.plantedYear}
          </Text>}
          {previous.map(old => <Text key={old.id} style={styles.muted}>
            Було: {old.variety} · {old.plantedYear}–{old.endedYear}
          </Text>)}
        </View>
      </Pressable>;
    })}
  </InfoCard>;
}
