import type {FarmRecord} from './model';

export type SeasonSummary = {
  incomeKopecks: number;
  expenseKopecks: number;
  resultKopecks: number;
  harvestedKg: number;
  soldKg: number;
  expensesWithoutAmount: number;
  costPerKgKopecks: number | null;
};

export function summarizeSeason(records: FarmRecord[], season: number, fieldId?: string | null): SeasonSummary {
  let incomeKopecks = 0;
  let expenseKopecks = 0;
  let harvestedKg = 0;
  let soldKg = 0;
  let expensesWithoutAmount = 0;

  for (const record of records) {
    if (record.season !== season || (fieldId !== undefined && record.fieldId !== fieldId)) continue;
    const amount = record.amountKopecks;
    if (amount !== null && amount > 0) incomeKopecks += amount;
    if (amount !== null && amount < 0) expenseKopecks -= amount;
    if (record.kind === 'work' && amount === null) expensesWithoutAmount++;
    if (record.kind === 'harvest') harvestedKg += record.quantityKg ?? 0;
    if (record.kind === 'sale') soldKg += record.quantityKg ?? 0;
  }

  harvestedKg = Math.round(harvestedKg * 1000) / 1000;
  soldKg = Math.round(soldKg * 1000) / 1000;
  return {
    incomeKopecks,
    expenseKopecks,
    resultKopecks: incomeKopecks - expenseKopecks,
    harvestedKg,
    soldKg,
    expensesWithoutAmount,
    costPerKgKopecks: harvestedKg > 0 && expenseKopecks > 0 && expensesWithoutAmount === 0
      ? Math.ceil(expenseKopecks / harvestedKg) : null,
  };
}

// A centner per hectare and a kilogram per sotka have the same numeric ratio.
export function yieldForArea(harvestedKg: number, areaM2: number): number | null {
  return areaM2 > 0 ? harvestedKg * 100 / areaM2 : null;
}
