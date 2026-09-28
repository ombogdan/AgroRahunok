export type RowPlanting = {
  id: string;
  fieldId: string;
  rowNumber: number;
  // What grows in the row: berry plots and orchards keep their crops here, not on the plot.
  crop: string | null;
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

export type VarietyGroup = {crop: string | null; variety: string; rows: RowPlanting[]};

// Rows saved on the phone by an older version of the app have no crop yet.
export function withRowDefaults(row: Omit<RowPlanting, 'crop'> & Partial<Pick<RowPlanting, 'crop'>>): RowPlanting {
  return {...row, crop: row.crop ?? null};
}

// Plots whose crops are planted in rows for years: berry plots and orchards.
export function usesRows(field: {type: string}): boolean {
  return field.type === 'berries' || field.type === 'orchard';
}

// «Малина · Полка»: what grows in a group of rows.
export function varietyLabel(group: Pick<VarietyGroup, 'crop' | 'variety'>): string {
  return [group.crop, group.variety].filter(Boolean).join(' · ');
}

// «Малина · Полка, Глен Ампл; Смородина · Титанія»: the rows of a plot, crop by crop.
export function rowsSummary(groups: VarietyGroup[]): string {
  const byCrop = new Map<string, string[]>();
  for (const group of groups) byCrop.set(group.crop ?? '', [...(byCrop.get(group.crop ?? '') ?? []), group.variety]);
  return [...byCrop].map(([crop, varieties]) => [crop, varieties.join(', ')].filter(Boolean).join(' · ')).join('; ');
}

export function parseRowRange(firstInput: string, lastInput: string, rowCount: number):
  {first: number; last: number} | null {
  if (!/^\d+$/.test(firstInput) || (lastInput.trim() !== '' && !/^\d+$/.test(lastInput))) return null;
  const first = Number(firstInput);
  const last = lastInput.trim() === '' ? first : Number(lastInput);
  return first >= 1 && last >= first && last <= rowCount ? {first, last} : null;
}

export function varietyGroups(rows: RowPlanting[]): VarietyGroup[] {
  const groups = new Map<string, VarietyGroup>();
  for (const row of rows) {
    if (!row.variety) continue;
    const key = `${(row.crop ?? '').trim().toLocaleLowerCase('uk')}|${row.variety.trim().toLocaleLowerCase('uk')}`;
    const group = groups.get(key);
    if (group) group.rows.push(row);
    else groups.set(key, {crop: row.crop, variety: row.variety, rows: [row]});
  }
  return [...groups.values()];
}

export function rowNumbersLabel(rows: RowPlanting[]): string {
  return [...rows].sort((a, b) => a.rowNumber - b.rowNumber).map(row => row.rowNumber).join(', ');
}
