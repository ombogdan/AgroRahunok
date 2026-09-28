import {t} from '../../../../shared/config/i18n';
import React from 'react';
import {Text, View} from 'react-native';
import type {VarietyGroup} from '../../../../shared/core/rows/model';
import {rowNumbersLabel, varietyGroups, varietyLabel} from '../../../../shared/core/rows/model';
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
  const selectedLabel = selectedGroups.length === 1 ? varietyLabel(selectedGroups[0]) : null;

  return <View style={styles.section}>
    <Text style={styles.label}>{mode === 'work' ? t("whereExactlyDidYouWork") : t("varietyAndRows")}{t("optional", [], "before")}</Text>
    {mode === 'quantity' && <Text style={styles.note}>{t("harvestRowSelectionHint", [], "both")}</Text>}
    <View style={styles.chips}>
      <Chip label={mode === 'work' ? t("wholeField") : t("notSpecified")} selected={selectedRows.length === 0}
        onPress={() => onChange([])} />
      {groups.map(group => <Chip key={varietyLabel(group)}
        label={t("varietyRowsSummary", [varietyLabel(group), rowNumbersLabel(group.rows)])}
        selected={selectedRows.length === group.rows.length &&
          group.rows.every(row => selectedIds.includes(row.id))}
        onPress={() => onChange(group.rows.map(row => row.id))} />)}
    </View>
    {selectedLabel && <View style={styles.chips}>
      {groups.find(group => varietyLabel(group) === selectedLabel)?.rows.map(row =>
        <Chip key={row.id} label={t("rowNumber", [row.rowNumber])} selected={selectedIds.includes(row.id)}
          onPress={() => onChange(selectedIds.includes(row.id)
            ? selectedIds.filter(id => id !== row.id) : [...selectedIds, row.id])} />)}
    </View>}
    {mode === 'work' && selectedRows.length > 0 && <Text style={styles.note}>{t("selectedRowsTotalCostHint", [], "both")}</Text>}
  </View>;
}
