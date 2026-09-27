import {
  dateLabel, formatMoney, parseDateInput, parseMoneyInput, saleAmountKopecks, seasonFor, toLocalIsoDate,
  workCostKopecks,
} from '../src/shared/core/records/model';
import {insertRecord} from '../src/shared/core/records/recordsRepository';

describe('seasonFor', () => {
  it('puts autumn work under winter crops into the next harvest year', () => {
    expect(seasonFor(new Date(2026, 8, 26), 'Пшениця озима')).toBe(2027);
    expect(seasonFor(new Date(2026, 7, 1), 'Ячмінь озимий')).toBe(2027);
  });

  it('keeps everything else in the calendar year', () => {
    expect(seasonFor(new Date(2026, 6, 15), 'Пшениця озима')).toBe(2026);
    expect(seasonFor(new Date(2026, 8, 26), 'Малина')).toBe(2026);
    expect(seasonFor(new Date(2026, 8, 26), null)).toBe(2026);
  });
});

describe('money', () => {
  it('reads hryvnias typed on the phone into kopecks', () => {
    expect(parseMoneyInput('3000')).toBe(300000);
    expect(parseMoneyInput('3 000')).toBe(300000);
    expect(parseMoneyInput('2,50')).toBe(250);
    expect(parseMoneyInput('2,555')).toBeNull();
    expect(parseMoneyInput('0')).toBe(0);
    expect(parseMoneyInput('0,00')).toBe(0);
    expect(parseMoneyInput('')).toBeNull();
  });

  it('formats kopecks as hryvnias', () => {
    expect(formatMoney(300000)).toMatch(/^3\s000\sгрн$/);
    expect(formatMoney(-250)).toMatch(/^2,50\sгрн$/);
  });

  it('multiplies a per-hectare rate by the plot area', () => {
    expect(workCostKopecks('perHa', 150000, 20000)).toBe(300000);
    expect(workCostKopecks('perHa', 150000, 2000)).toBe(30000);
    expect(workCostKopecks('sum', 300000, 20000)).toBe(300000);
    expect(workCostKopecks('sum', null, 20000)).toBeNull();
    expect(workCostKopecks('sum', 0, 20000)).toBe(0);
    expect(saleAmountKopecks(12, 0)).toBe(0);
  });
});

describe('dates', () => {
  const today = new Date(2026, 8, 26);

  it('labels recent days in words', () => {
    expect(dateLabel('2026-09-26', today)).toBe('Сьогодні');
    expect(dateLabel('2026-09-25', today)).toBe('Вчора');
    expect(dateLabel('2026-09-12', today)).toBe('12 вересня');
    expect(dateLabel('2025-07-03', today)).toBe('3 липня 2025');
  });

  it('reads typed dates and rejects impossible ones', () => {
    expect(parseDateInput('26.09.2026')).toBe('2026-09-26');
    expect(parseDateInput('1.9.2026')).toBe('2026-09-01');
    expect(parseDateInput('31.02.2026')).toBeNull();
    expect(parseDateInput('2026-09-26')).toBeNull();
    expect(toLocalIsoDate(today)).toBe('2026-09-26');
  });
});

const mockInserted: {values?: Record<string, unknown>} = {};
jest.mock('../src/shared/core/supabase/client', () => ({
  getSupabaseClient: () => ({
    from: () => ({
      insert: (values: Record<string, unknown>) => {
        mockInserted.values = values;
        return {select: () => ({single: async () => ({
          data: {...values, id: 'record-1', planting_id: 'planting-1', created_at: '2026-09-26T10:00:00Z'},
          error: null,
        })})};
      },
    }),
  }),
}));

it('stores a work record with the cost as a negative amount in kopecks', async () => {
  const record = await insertRecord({
    fieldId: 'field-1', kind: 'work', workType: 'oranka', occurredOn: '2026-09-26', season: 2027,
    amountKopecks: -300000, quantityKg: null, note: null, details: {costMode: 'perHa', ratePerHaKopecks: 150000},
  });
  expect(mockInserted.values).toEqual({
    field_id: 'field-1', kind: 'work', work_type: 'oranka', occurred_on: '2026-09-26', season: 2027,
    amount_kopecks: -300000, quantity_kg: null, note: null, details: {costMode: 'perHa', ratePerHaKopecks: 150000},
  });
  expect(record).toMatchObject({id: 'record-1', plantingId: 'planting-1', amountKopecks: -300000, season: 2027});
});
