import {FarmStore, applyChange} from '../src/shared/core/offline/farmStore';
import type {FarmData, Remote, Storage} from '../src/shared/core/offline/farmStore';
import {currentRows, parseRowRange, rowsForSeason, varietyGroups} from '../src/shared/core/rows/model';

test('a blank ending row means one row', () => {
  expect(parseRowRange('2', '', 5)).toEqual({first: 2, last: 2});
  expect(parseRowRange('2', '4', 5)).toEqual({first: 2, last: 4});
  expect(parseRowRange('2', '1', 5)).toBeNull();
  expect(parseRowRange('6', '', 5)).toBeNull();
});

const disk = new Map<string, string>();
const storage: Storage = {
  getItem: async key => disk.get(key) ?? null,
  setItem: async (key, value) => { disk.set(key, value); },
};

beforeEach(() => disk.clear());

const fieldInput = {
  name: 'Малинник', type: 'berries' as const, crop: 'Малина', variety: null,
  documentAreaM2: 2000, measuredAreaM2: null, areaSource: 'document' as const, polygon: [],
};

test('rows keep their numbers and previous varieties after replanting', async () => {
  let server: FarmData = {fields: [], records: [], plantings: [], units: [], rows: []};
  const sent: string[] = [];
  const remote: Remote = {
    push: async change => {
      sent.push(`${change.table}:${change.action}`);
      server = applyChange(server, change);
    },
    pull: async () => server,
  };
  const store = new FarmStore('mother', storage, remote);
  await store.load();
  const field = await store.addField(fieldInput);
  await store.ensureRowCount(field.id, 4);
  await store.assignRowVariety(field.id, 1, 2, 'Малина', 'Полка', 2025);
  await store.assignRowVariety(field.id, 3, 4, 'Малина', 'Глен Ампл', 2026);
  expect(varietyGroups(currentRows(store.data.rows, field.id)).map(group =>
    [group.crop, group.variety, group.rows.map(row => row.rowNumber)])).toEqual([
    ['Малина', 'Полка', [1, 2]], ['Малина', 'Глен Ампл', [3, 4]],
  ]);

  const oldRow = currentRows(store.data.rows, field.id)[0];
  await store.addRecord({
    fieldId: field.id, kind: 'harvest', workType: null, occurredOn: '2026-06-10', season: 2026,
    amountKopecks: null, quantityKg: 12, note: null,
    details: {rowPlantingIds: [oldRow.id], varietySnapshot: 'Полка', rowNumbersSnapshot: [1]},
  });
  await store.assignRowVariety(field.id, 1, 1, 'Малина', 'Туламін', 2027);
  expect(rowsForSeason(store.data.rows, field.id, 2026).find(row => row.rowNumber === 1)?.variety).toBe('Полка');
  expect(rowsForSeason(store.data.rows, field.id, 2027).find(row => row.rowNumber === 1)?.variety).toBe('Туламін');
  expect(store.data.records[0].details.rowPlantingIds).toEqual([oldRow.id]);
  await store.sync();
  expect(sent[0]).toBe('fields:put');
  expect(sent.slice(-2)).toEqual(['plot_rows:put', 'plot_rows:put']);

  const restarted = new FarmStore('mother', storage, remote);
  await restarted.load();
  expect(currentRows(restarted.data.rows, field.id).map(row => row.rowNumber)).toEqual([1, 2, 3, 4]);
  expect(restarted.data.rows.find(row => row.id === oldRow.id)?.endedYear).toBe(2026);
});

test('a same-year correction is allowed before linked entries, but not after', async () => {
  const remote: Remote = {push: async () => {}, pull: async () => ({fields: [], records: [], plantings: [], units: [], rows: []})};
  const store = new FarmStore('mother', storage, remote);
  await store.load();
  const field = await store.addField(fieldInput);
  await store.ensureRowCount(field.id, 1);
  await store.assignRowVariety(field.id, 1, 1, null, 'Полка', 2025);
  await store.assignRowVariety(field.id, 1, 1, null, 'Полка виправлено', 2025);
  const row = currentRows(store.data.rows, field.id)[0];
  expect(row.variety).toBe('Полка виправлено');
  await store.addRecord({
    fieldId: field.id, kind: 'harvest', workType: null, occurredOn: '2026-06-10', season: 2026,
    amountKopecks: null, quantityKg: 12, note: null, details: {rowPlantingIds: [row.id]},
  });
  await expect(store.assignRowVariety(field.id, 1, 1, null, 'Інший сорт', 2025)).rejects.toThrow();
  expect(currentRows(store.data.rows, field.id)[0].variety).toBe('Полка виправлено');
  // Adding the crop to the same planting is not a replanting, so linked entries do not block it.
  await store.assignRowVariety(field.id, 1, 1, 'Малина', 'Полка виправлено', 2025);
  expect(currentRows(store.data.rows, field.id)).toMatchObject([{id: row.id, crop: 'Малина', variety: 'Полка виправлено'}]);
});

test('existing offline snapshot upgrades without losing fields or pending changes', async () => {
  disk.set('farm-v1:mother', JSON.stringify({version: 1, base: {
    fields: [], records: [], plantings: [], units: [],
  }, pending: []}));
  const remote: Remote = {push: async () => {}, pull: async () => ({fields: [], records: [], plantings: [], units: [], rows: []})};
  const store = new FarmStore('mother', storage, remote);
  await store.load();
  expect(store.data.rows).toEqual([]);
  const field = await store.addField(fieldInput);
  const restarted = new FarmStore('mother', storage, remote);
  await restarted.load();
  expect(restarted.data.fields[0].id).toBe(field.id);
  expect(restarted.data.rows).toEqual([]);
});
