import {newExtraDraft, parseExtraDraft} from '../src/screens/app-user/planting-form/components/extra-crops/extra-crop-draft';
import {noticeableAreaError} from '../src/shared/core/fields/model';
import type {GeoPoint} from '../src/shared/core/fields/model';
import {withRotationDefaults} from '../src/shared/core/fields/planting';
import {FarmStore} from '../src/shared/core/offline/farmStore';
import type {FarmRecord} from '../src/shared/core/records/model';
import {actualYieldKgPerHa, plantingCrops, plantingLabel} from '../src/shared/core/rotation/model';

const NBSP = ' ';
const LAT = 49.5;
const LON = 31.2;
const metresToLat = 1 / 111320;
const metresToLon = 1 / (111320 * Math.cos((LAT * Math.PI) / 180));
const rectangle = (width: number, height: number): GeoPoint[] => [[0, 0], [width, 0], [width, height], [0, height]]
  .map(([x, y]) => ({latitude: LAT + y * metresToLat, longitude: LON + x * metresToLon}));

test('a 20-sotok contour shows its possible GPS error, a 2-ha one does not', () => {
  const small = noticeableAreaError(rectangle(40, 50), 2000);
  expect(small?.percent).toBeGreaterThan(8);
  expect(small?.percent).toBeLessThan(12);
  expect(noticeableAreaError(rectangle(100, 200), 20000)).toBeNull();
});

const harvest = (id: string, quantityKg: number, cropSnapshot?: string): FarmRecord => ({
  id, fieldId: 'garden', plantingId: null, kind: 'harvest', workType: null, occurredOn: '2027-08-01', season: 2027,
  amountKopecks: null, quantityKg, note: null, details: cropSnapshot ? {cropSnapshot} : {}, createdAt: id,
});

test('several crops share a plot, each with its own area and harvest', () => {
  const planting = withRotationDefaults({
    id: 'p', fieldId: 'garden', season: 2027, crop: 'Картопля', areaM2: 1000,
    extraCrops: [{crop: 'Цибуля', variety: null, areaM2: 200}],
  });
  expect(plantingCrops(planting, 1200).map(share => [share.crop, share.areaM2])).toEqual([['Картопля', 1000], ['Цибуля', 200]]);
  expect(plantingLabel(planting, 1200)).toBe(`Картопля 10${NBSP}соток, Цибуля 2${NBSP}сотки`);
  // Harvests without a crop count for the main one.
  const records = [harvest('a', 250, 'Картопля'), harvest('b', 30), harvest('c', 40, 'цибуля')];
  expect(actualYieldKgPerHa(records, 'garden', 2027, 1000, {name: 'Картопля', isMain: true})).toBe(2800);
  expect(actualYieldKgPerHa(records, 'garden', 2027, 200, {name: 'Цибуля', isMain: false})).toBe(2000);
});

test('an extra crop needs its name and area; an empty card is skipped', () => {
  expect(parseExtraDraft(newExtraDraft('sotka'))).toEqual({share: null, valid: true});
  expect(parseExtraDraft({...newExtraDraft('sotka'), crop: 'Цибуля'}).valid).toBe(false);
  expect(parseExtraDraft({...newExtraDraft('sotka'), crop: ' Цибуля ', area: '2'}).share)
    .toEqual({crop: 'Цибуля', variety: null, areaM2: 200});
});

test('plots and plantings saved by an older version get empty notes and no extra crops', async () => {
  const saved = JSON.stringify({version: 2, pending: [], base: {
    fields: [{id: 'f', name: 'Поле', type: 'field', crop: null, variety: null, documentAreaM2: 20000,
      measuredAreaM2: null, areaSource: 'document', polygon: [], createdAt: 'x'}],
    records: [], units: [], rows: [], plantings: [{id: 'p', fieldId: 'f', season: 2026, crop: 'Соняшник', variety: null, areaM2: 20000}],
  }});
  const store = new FarmStore('owner', {getItem: async () => saved, setItem: async () => undefined},
    {push: async () => undefined, pull: async () => { throw new Error('offline'); }});
  await store.load();
  expect(store.data.fields[0].note).toBeNull();
  expect(store.data.plantings[0].extraCrops).toEqual([]);
});
