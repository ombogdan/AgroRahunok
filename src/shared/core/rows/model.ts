export type RowPlanting = {
  id: string;
  fieldId: string;
  rowNumber: number;
  variety: string | null;
  plantedYear: number | null;
  endedYear: number | null;
  createdAt: string;
};

export function currentRows(rows: RowPlanting[], fieldId: string): RowPlanting[] {
  return rows.filter(row => row.fieldId === fieldId && row.endedYear === null)
    .sort((a, b) => a.rowNumber - b.rowNumber);
}

export function rowsForSeason(rows: RowPlanting[], fieldId: string, season: number): RowPlanting[] {
  return rows.filter(row => row.fieldId === fieldId && row.variety !== null &&
    row.plantedYear !== null && row.plantedYear <= season &&
    (row.endedYear === null || season <= row.endedYear))
    .sort((a, b) => a.rowNumber - b.rowNumber);
}

export type VarietyGroup = {variety: string; rows: RowPlanting[]};

export function varietyGroups(rows: RowPlanting[]): VarietyGroup[] {
  const groups = new Map<string, VarietyGroup>();
  for (const row of rows) {
    if (!row.variety) continue;
    const key = row.variety.trim().toLocaleLowerCase('uk');
    const group = groups.get(key);
    if (group) group.rows.push(row);
    else groups.set(key, {variety: row.variety, rows: [row]});
  }
  return [...groups.values()];
}

export function rowNumbersLabel(rows: RowPlanting[]): string {
  return [...rows].sort((a, b) => a.rowNumber - b.rowNumber).map(row => row.rowNumber).join(', ');
}
