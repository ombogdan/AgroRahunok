import {draftFrom, newDraft, parseDraft} from '../src/screens/app-user/work-record/components/material-sheet/material-draft';
import {formatNpk, materialCostKopecks, materialsCostKopecks} from '../src/shared/core/records/model';
import type {MaterialUse} from '../src/shared/core/records/model';

test('an untouched material card is skipped, a filled one needs a name and valid numbers', () => {
  expect(parseDraft(newDraft('other'))).toEqual({material: null, valid: true});
  expect(parseDraft({...newDraft('other'), quantity: '10'}).valid).toBe(false);
  expect(parseDraft({...newDraft('other', 'Дизель'), quantity: '10,5', price: 'дорого'}).valid).toBe(false);
  expect(parseDraft({...newDraft('other', 'Дизель'), quantity: '10,5', price: '52'}).material).toEqual({
    kind: 'other', name: 'Дизель', quantity: 10.5, unit: 'l', pricePerUnitKopecks: 5200,
  });
});

test('only fertiliser keeps NPK, and its shares cannot pass 100 %', () => {
  const nitrate = parseDraft({...newDraft('fertilizer', 'Аміачна селітра'), quantity: '200', price: '22,50', n: '34,4'});
  expect(nitrate.material?.npk).toEqual({n: 34.4, p: 0, k: 0});
  expect(formatNpk({n: 34.4, p: 0, k: 0})).toBe('34,4-0-0');
  expect(parseDraft({...newDraft('fertilizer', 'Помилка'), n: '60', p: '30', k: '20'}).valid).toBe(false);
  expect(parseDraft({...newDraft('protection', 'Гербіцид'), n: '10'}).material?.npk).toBeUndefined();
});

test('materials cost their quantity times price, and unpriced ones add nothing', () => {
  const seed: MaterialUse = {kind: 'seed', name: 'Озима пшениця · Богдана', quantity: 250, unit: 'kg', pricePerUnitKopecks: 1800};
  const water: MaterialUse = {kind: 'other', name: 'Вода', quantity: 2000, unit: 'l', pricePerUnitKopecks: null};
  expect(materialCostKopecks(seed)).toBe(450000);
  expect(materialCostKopecks(water)).toBeNull();
  expect(materialsCostKopecks([seed, water])).toBe(450000);
  expect(materialsCostKopecks(undefined)).toBe(0);
});

test('a saved material opens for editing with the same values', () => {
  const fertiliser: MaterialUse = {
    kind: 'fertilizer', name: 'Нітроамофоска', quantity: 1.5, unit: 't', pricePerUnitKopecks: 2150000,
    npk: {n: 16, p: 16, k: 16},
  };
  expect(parseDraft(draftFrom(fertiliser)).material).toEqual(fertiliser);
});
