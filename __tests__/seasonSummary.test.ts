import type {FarmRecord} from '../src/shared/core/records/model';
import {kilogramsFor, saleAmountKopecks} from '../src/shared/core/records/model';
import {summarizeSeason, yieldForArea} from '../src/shared/core/records/seasonSummary';

function record(values: Partial<FarmRecord>): FarmRecord {
  return {
    id: 'test-record', fieldId: 'raspberry', plantingId: null,
    kind: 'work', workType: 'sap', occurredOn: '2026-07-18', season: 2026,
    amountKopecks: null, quantityKg: null, note: null, details: {},
    createdAt: '2026-07-18T12:00:00Z', ...values,
  };
}

describe('harvest, sales and seasonal money', () => {
  it('converts buckets once and sums repeated harvests without mixing seasons', () => {
    const records = [
      record({kind: 'harvest', quantityKg: kilogramsFor(4, 5)}),
      record({kind: 'harvest', quantityKg: kilogramsFor(3, 5)}),
      record({kind: 'harvest', quantityKg: 100, season: 2025}),
    ];
    expect(summarizeSeason(records, 2026).harvestedKg).toBe(35);
    expect(yieldForArea(35, 2000)).toBe(1.75); // kg per sotka
    expect(yieldForArea(4000, 20000)).toBe(20); // centners per hectare
  });

  it('calculates sale, result and break-even price from recorded values', () => {
    const saleKopecks = saleAmountKopecks(12, 8000);
    const records = [
      record({kind: 'work', amountKopecks: -100000}),
      record({kind: 'harvest', quantityKg: 20}),
      record({kind: 'sale', amountKopecks: saleKopecks, quantityKg: 12}),
      record({kind: 'work', fieldId: 'wheat', amountKopecks: -30000}),
    ];
    expect(saleKopecks).toBe(96000);
    expect(summarizeSeason(records, 2026, 'raspberry')).toMatchObject({
      incomeKopecks: 96000,
      expenseKopecks: 100000,
      resultKopecks: -4000,
      harvestedKg: 20,
      soldKg: 12,
      costPerKgKopecks: 5000,
    });
    expect(summarizeSeason(records, 2026).expenseKopecks).toBe(130000);
  });

  it('marks costs as incomplete when a work has no amount', () => {
    const summary = summarizeSeason([
      record({kind: 'work'}),
      record({kind: 'work', amountKopecks: -5000}),
      record({kind: 'harvest', quantityKg: 10}),
    ], 2026);
    expect(summary.expensesWithoutAmount).toBe(1);
    expect(summary.costPerKgKopecks).toBeNull();
  });

  it('keeps whole-farm expenses separate from plot results', () => {
    const records = [
      record({kind: 'other', fieldId: null, amountKopecks: -20000}),
      record({kind: 'sale', fieldId: 'raspberry', amountKopecks: 96000, quantityKg: 12}),
    ];
    expect(summarizeSeason(records, 2026).resultKopecks).toBe(76000);
    expect(summarizeSeason(records, 2026, 'raspberry').resultKopecks).toBe(96000);
    expect(summarizeSeason(records, 2026, null).expenseKopecks).toBe(20000);
  });
});
