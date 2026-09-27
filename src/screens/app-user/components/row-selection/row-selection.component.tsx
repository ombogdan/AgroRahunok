import React from 'react';
import {Text, View} from 'react-native';
import type {VarietyGroup} from '../../../../shared/core/rows/model';
import {rowNumbersLabel, varietyGroups} from '../../../../shared/core/rows/model';
import {Chip} from '../record-chip/record-chip.component';
import {useStyles} from './row-selection.styles';

type Props = {
  groups: VarietyGroup[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  mode: 'work' | 'quantity';
};

export function RowSelection({groups, selectedIds, onChange, mode}: Props) {
  const styles = useStyles();
  const selectedRows = groups.flatMap(group => group.rows).filter(row => selectedIds.includes(row.id));
  const selectedGroups = varietyGroups(selectedRows);
  const selectedVariety = selectedGroups.length === 1 ? selectedGroups[0].variety : null;

  return <View style={styles.section}>
    <Text style={styles.label}>{mode === 'work' ? 'Де саме працювали?' : 'Сорт і ряди'} · необов’язково</Text>
    {mode === 'quantity' && <Text style={styles.note}>
      Можна вказати весь сорт або конкретні ряди. Для змішаного збору залиште без уточнення.
    </Text>}
    <View style={styles.chips}>
      <Chip label={mode === 'work' ? 'Уся ділянка' : 'Без уточнення'} selected={selectedRows.length === 0}
        onPress={() => onChange([])} />
      {groups.map(group => <Chip key={group.variety}
        label={`${group.variety} · ряди ${rowNumbersLabel(group.rows)}`}
        selected={selectedRows.length === group.rows.length &&
          group.rows.every(row => selectedIds.includes(row.id))}
        onPress={() => onChange(group.rows.map(row => row.id))} />)}
    </View>
    {selectedVariety && <View style={styles.chips}>
      {groups.find(group => group.variety === selectedVariety)?.rows.map(row =>
        <Chip key={row.id} label={`Ряд ${row.rowNumber}`} selected={selectedIds.includes(row.id)}
          onPress={() => onChange(selectedIds.includes(row.id)
            ? selectedIds.filter(id => id !== row.id) : [...selectedIds, row.id])} />)}
    </View>}
    {mode === 'work' && selectedRows.length > 0 && <Text style={styles.note}>
      Для окремих рядів вартість вкажіть сумою: їхню площу ще не виміряно.
    </Text>}
  </View>;
}
