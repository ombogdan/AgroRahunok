import {parsePositiveNumber} from '../../../../../shared/core/fields/model';
import type {MaterialKind, MaterialUnit, MaterialUse} from '../../../../../shared/core/records/model';
import {parseMoneyInput} from '../../../../../shared/core/records/model';

// A material as it is being typed: every number stays text until the record is saved.
export type MaterialDraft = {
  key: string;
  kind: MaterialKind;
  name: string;
  quantity: string;
  unit: MaterialUnit;
  price: string;
  n: string;
  p: string;
  k: string;
};

const defaultUnits: Record<MaterialKind, MaterialUnit> = {seed: 'kg', fertilizer: 'kg', protection: 'l', other: 'l'};
let lastKey = 0;
const nextKey = () => `material-${++lastKey}`;
const decimalText = (value: number) => String(Number(value.toFixed(3))).replace('.', ',');

export function newDraft(kind: MaterialKind, name = ''): MaterialDraft {
  return {key: nextKey(), kind, name, quantity: '', unit: defaultUnits[kind], price: '', n: '', p: '', k: ''};
}

export function draftFrom(material: MaterialUse): MaterialDraft {
  return {
    key: nextKey(), kind: material.kind, name: material.name, unit: material.unit,
    quantity: material.quantity === null ? '' : decimalText(material.quantity),
    price: material.pricePerUnitKopecks === null ? '' : decimalText(material.pricePerUnitKopecks / 100),
    n: material.npk ? decimalText(material.npk.n) : '',
    p: material.npk ? decimalText(material.npk.p) : '',
    k: material.npk ? decimalText(material.npk.k) : '',
  };
}

// «34,4» or «0» per cent; null for anything else.
function parsePercent(value: string): number | null {
  const normalized = value.replace(/\s/g, '').replace(',', '.');
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;
  const numeric = Number(normalized);
  return numeric <= 100 ? numeric : null;
}

// The saved material, or null for a card left empty; `valid` is false while a number or the name is wrong.
export function parseDraft(draft: MaterialDraft): {material: MaterialUse | null; valid: boolean} {
  const name = draft.name.trim();
  const npkInputs = draft.kind === 'fertilizer' ? [draft.n, draft.p, draft.k].map(value => value.trim()) : [];
  const hasNpk = npkInputs.some(Boolean);
  if (!name && !draft.quantity.trim() && !draft.price.trim() && !hasNpk) return {material: null, valid: true};
  const quantity = draft.quantity.trim() ? parsePositiveNumber(draft.quantity) : null;
  const price = draft.price.trim() ? parseMoneyInput(draft.price) : null;
  // A blank nutrient is zero once any of the three is filled in.
  const npk = hasNpk ? npkInputs.map(value => (value ? parsePercent(value) : 0)) : [];
  const valid = name.length > 0 && (!draft.quantity.trim() || quantity !== null) &&
    (!draft.price.trim() || price !== null) && npk.every(value => value !== null) &&
    npk.reduce<number>((sum, value) => sum + (value ?? 0), 0) <= 100;
  if (!valid) return {material: null, valid: false};
  return {
    valid: true,
    material: {
      kind: draft.kind, name, quantity, unit: draft.unit, pricePerUnitKopecks: price,
      ...(hasNpk ? {npk: {n: npk[0] as number, p: npk[1] as number, k: npk[2] as number}} : {}),
    },
  };
}
