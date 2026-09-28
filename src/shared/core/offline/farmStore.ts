import type {Field, NewField} from '../fields/model';
import type {NewPlanting, Planting, PlantingInput} from '../fields/plantingsRepository';
import {withRotationDefaults} from '../fields/plantingsRepository';
import type {FarmRecord, NewRecord} from '../records/model';
import type {QuantityUnit} from '../records/quantityUnitsRepository';
import {currentRows} from '../rows/model';
import type {RowPlanting} from '../rows/model';

export type FarmData = {
  fields: Field[];
  records: FarmRecord[];
  plantings: Planting[];
  units: QuantityUnit[];
  rows: RowPlanting[];
};

export type Change =
  | {key: string; table: 'fields'; action: 'put'; value: Field}
  | {key: string; table: 'fields'; action: 'delete'; id: string}
  | {key: string; table: 'records'; action: 'put'; value: FarmRecord}
  | {key: string; table: 'records'; action: 'delete'; id: string}
  | {key: string; table: 'plantings'; action: 'put'; value: Planting}
  // Plantings are unique per plot and season, which is also how the server finds them.
  | {key: string; table: 'plantings'; action: 'delete'; fieldId: string; season: number}
  | {key: string; table: 'units'; action: 'put'; value: QuantityUnit}
  | {key: string; table: 'plot_rows'; action: 'put'; value: RowPlanting}
  | {key: string; table: 'plot_rows'; action: 'delete'; id: string};

export type FarmSnapshot = {version: 2; base: FarmData; pending: Change[]};
export type Storage = {getItem: (key: string) => Promise<string | null>; setItem: (key: string, value: string) => Promise<unknown>};
export type Remote = {push: (change: Change) => Promise<void>; pull: () => Promise<FarmData>};

const emptyData = (): FarmData => ({fields: [], records: [], plantings: [], units: [], rows: []});
const emptySnapshot = (): FarmSnapshot => ({version: 2, base: emptyData(), pending: []});

// UUIDs are assigned before the network request, so dependent offline records keep their field IDs.
export function newId(): string {
  const random = () => Math.floor(Math.random() * 0x100000000).toString(16).padStart(8, '0');
  const hex = `${random()}${random()}${random()}${random()}`;
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20)}`;
}

function replaceById<T extends {id: string}>(items: T[], value: T): T[] {
  const index = items.findIndex(item => item.id === value.id);
  if (index < 0) return [...items, value];
  return items.map(item => item.id === value.id ? value : item);
}

export function applyChange(data: FarmData, change: Change): FarmData {
  if (change.table === 'fields') {
    if (change.action === 'put') return {...data, fields: replaceById(data.fields, change.value)};
    return {
      ...data,
      fields: data.fields.filter(item => item.id !== change.id),
      records: data.records.filter(item => item.fieldId !== change.id),
      plantings: data.plantings.filter(item => item.fieldId !== change.id),
      rows: data.rows.filter(item => item.fieldId !== change.id),
    };
  }
  if (change.table === 'records') {
    if (change.action === 'put') return {...data, records: replaceById(data.records, change.value)};
    return {...data, records: data.records.filter(item => item.id !== change.id)};
  }
  if (change.table === 'plantings') {
    if (change.action === 'delete') {
      return {...data, plantings: data.plantings.filter(item =>
        item.fieldId !== change.fieldId || item.season !== change.season)};
    }
    const value = change.value;
    // The server may know this season's planting under another id (a record created it first).
    return {...data, plantings: [...data.plantings.filter(item => item.id !== value.id &&
      (item.fieldId !== value.fieldId || item.season !== value.season)), value]};
  }
  if (change.table === 'units') return {...data, units: replaceById(data.units, change.value)};
  if (change.action === 'put') return {...data, rows: replaceById(data.rows, change.value)};
  return {...data, rows: data.rows.filter(item => item.id !== change.id)};
}

export function visibleData(snapshot: FarmSnapshot): FarmData {
  return snapshot.pending.reduce(applyChange, snapshot.base);
}

function withPlantingDefaults(snapshot: FarmSnapshot): FarmSnapshot {
  return {
    ...snapshot,
    base: {...snapshot.base, plantings: snapshot.base.plantings.map(withRotationDefaults)},
    pending: snapshot.pending.map(change => (change.table === 'plantings' && change.action === 'put'
      ? {...change, value: withRotationDefaults(change.value)} : change)),
  };
}

export class PlantingSeasonTakenError extends Error {
  constructor(readonly season: number) {
    super(`Planting for ${season} already exists`);
  }
}

// All writes, including sync acknowledgements, serialize through one local transaction queue.
// A failed disk write leaves the old in-memory state and pending queue intact.
export class FarmStore {
  private snapshot: FarmSnapshot = emptySnapshot();
  private listeners = new Set<() => void>();
  private transaction: Promise<unknown> = Promise.resolve();
  private syncing: Promise<void> | null = null;
  private loading: Promise<void> | null = null;
  private loaded = false;
  private disposed = false;

  constructor(private readonly ownerId: string, private readonly storage: Storage, private readonly remote: Remote) {}

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private announce() { this.listeners.forEach(listener => listener()); }

  get ready() { return this.loaded; }
  get pendingCount() { return this.snapshot.pending.length; }
  get data() { return visibleData(this.snapshot); }
  activate() { this.disposed = false; }
  dispose() { this.disposed = true; this.listeners.clear(); }

  private async commit(change: (current: FarmSnapshot) => FarmSnapshot): Promise<void> {
    const task = this.transaction.then(async () => {
      const next = change(this.snapshot);
      await this.storage.setItem(`farm-v1:${this.ownerId}`, JSON.stringify(next));
      this.snapshot = next;
      this.announce();
    });
    this.transaction = task.catch(() => undefined);
    await task;
  }

  load(): Promise<void> {
    if (this.loaded) return Promise.resolve();
    if (this.loading) return this.loading;
    this.loading = (async () => {
      const saved = await this.storage.getItem(`farm-v1:${this.ownerId}`);
      if (saved) {
        const parsed = JSON.parse(saved) as FarmSnapshot | {version: 1; base: Omit<FarmData, 'rows'>; pending: Change[]};
        if ((parsed.version !== 1 && parsed.version !== 2) || !parsed.base || !Array.isArray(parsed.pending)) {
          throw new Error('Невідома версія локальних даних');
        }
        const snapshot: FarmSnapshot = parsed.version === 1
          ? {version: 2, base: {...parsed.base, rows: []}, pending: parsed.pending}
          : parsed;
        this.snapshot = withPlantingDefaults(snapshot);
      }
      this.loaded = true;
      this.announce();
    })().finally(() => { this.loading = null; });
    return this.loading;
  }

  private async enqueue(change: Change): Promise<void> {
    if (!this.loaded || this.disposed) throw new Error('Локальні дані ще завантажуються');
    await this.commit(current => ({...current, pending: [...current.pending, change]}));
  }

  async addField(input: NewField): Promise<Field> {
    const value = {...input, id: newId(), createdAt: new Date().toISOString()};
    await this.enqueue({key: newId(), table: 'fields', action: 'put', value});
    return value;
  }

  async updateField(id: string, input: NewField): Promise<Field> {
    const old = this.data.fields.find(item => item.id === id);
    if (!old) throw new Error('Ділянку не знайдено');
    const value = {...old, ...input};
    await this.enqueue({key: newId(), table: 'fields', action: 'put', value});
    return value;
  }

  async removeField(id: string): Promise<void> {
    await this.enqueue({key: newId(), table: 'fields', action: 'delete', id});
  }

  async addRecord(input: NewRecord): Promise<FarmRecord> {
    const value = {...input, id: newId(), plantingId: null, createdAt: new Date().toISOString()};
    await this.enqueue({key: newId(), table: 'records', action: 'put', value});
    return value;
  }

  async updateRecord(id: string, input: NewRecord): Promise<FarmRecord> {
    const old = this.data.records.find(item => item.id === id);
    if (!old) throw new Error('Запис не знайдено');
    const value = {...old, ...input};
    await this.enqueue({key: newId(), table: 'records', action: 'put', value});
    return value;
  }

  async removeRecord(id: string): Promise<void> {
    await this.enqueue({key: newId(), table: 'records', action: 'delete', id});
  }

  // The field form sets only the crop of a season; dates and plans from the rotation stay.
  async savePlanting(input: PlantingInput): Promise<void> {
    const old = this.data.plantings.find(item => item.fieldId === input.fieldId && item.season === input.season);
    const value = withRotationDefaults({...old, id: old?.id ?? newId(), fieldId: input.fieldId,
      season: input.season, crop: input.crop, variety: input.variety, areaM2: input.areaM2});
    await this.enqueue({key: newId(), table: 'plantings', action: 'put', value});
  }

  // Saves a crop rotation line. `previousSeason` is the year it had before editing: moving it to another
  // year removes the old one, and a year that already has a planting on this plot is refused.
  async putPlanting(input: NewPlanting, previousSeason?: number): Promise<void> {
    await this.commit(current => {
      const plantings = visibleData(current).plantings;
      const sameSeason = plantings.find(item => item.fieldId === input.fieldId && item.season === input.season);
      if (sameSeason && previousSeason !== input.season) throw new PlantingSeasonTakenError(input.season);
      const changes: Change[] = [];
      if (previousSeason !== undefined && previousSeason !== input.season) {
        changes.push({key: newId(), table: 'plantings', action: 'delete', fieldId: input.fieldId, season: previousSeason});
      }
      changes.push({key: newId(), table: 'plantings', action: 'put', value: {...input, id: sameSeason?.id ?? newId()}});
      return {...current, pending: [...current.pending, ...changes]};
    });
  }

  async removePlanting(fieldId: string, season: number): Promise<void> {
    await this.enqueue({key: newId(), table: 'plantings', action: 'delete', fieldId, season});
  }

  async addUnit(name: string, kilogramsPerUnit: number): Promise<QuantityUnit> {
    const value = {id: newId(), name, kilogramsPerUnit};
    await this.enqueue({key: newId(), table: 'units', action: 'put', value});
    return value;
  }

  async ensureRowCount(fieldId: string, count: number): Promise<void> {
    if (!Number.isInteger(count) || count < 1 || count > 200) throw new Error('Вкажіть від 1 до 200 рядів');
    await this.commit(current => {
      const visible = visibleData(current);
      const field = visible.fields.find(item => item.id === fieldId);
      if (!field) throw new Error('Ділянку не знайдено');
      const existing = currentRows(visible.rows, fieldId);
      const max = Math.max(0, ...existing.map(row => row.rowNumber));
      if (count < max) throw new Error('Кількість рядів можна лише збільшити');
      const changes: Change[] = [];
      for (let number = max + 1; number <= count; number++) {
        changes.push({key: newId(), table: 'plot_rows', action: 'put', value: {
          id: newId(), fieldId, rowNumber: number, variety: null,
          plantedYear: null, endedYear: null, createdAt: new Date().toISOString(),
        }});
      }
      return {...current, pending: [...current.pending, ...changes]};
    });
  }

  async assignRowVariety(fieldId: string, first: number, last: number, variety: string, year: number): Promise<void> {
    const name = variety.trim();
    if (!name || name.length > 60) throw new Error('Вкажіть сорт до 60 символів');
    if (!Number.isInteger(year) || year < 2000 || year > new Date().getFullYear() + 1) {
      throw new Error('Вкажіть дійсний рік посадки');
    }
    await this.commit(current => {
      const visible = visibleData(current);
      const active = currentRows(visible.rows, fieldId);
      if (!Number.isInteger(first) || !Number.isInteger(last) || first < 1 || last < first || last > active.length) {
        throw new Error('Виберіть наявні ряди');
      }
      const changes: Change[] = [];
      for (let number = first; number <= last; number++) {
        const previous = active.find(row => row.rowNumber === number);
        if (!previous) throw new Error(`Ряд ${number} не знайдено`);
        if (previous.plantedYear === year &&
          previous.variety?.trim().toLocaleLowerCase('uk') === name.toLocaleLowerCase('uk')) continue;
        if (previous.plantedYear !== null && year < previous.plantedYear) {
          throw new Error(`Ряд ${number}: рік не може бути ранішим за попередню посадку`);
        }
        const hasLinkedRecord = visible.records.some(record =>
          record.details.rowPlantingIds?.includes(previous.id));
        if (previous.plantedYear === null || (year === previous.plantedYear && !hasLinkedRecord)) {
          changes.push({key: newId(), table: 'plot_rows', action: 'put', value: {
            ...previous, variety: name, plantedYear: year,
          }});
        } else {
          if (year === previous.plantedYear) {
            throw new Error(`Ряд ${number}: після записів змініть сорт із наступного року`);
          }
          changes.push({key: newId(), table: 'plot_rows', action: 'put', value: {
            ...previous, endedYear: year - 1,
          }});
          changes.push({key: newId(), table: 'plot_rows', action: 'put', value: {
            id: newId(), fieldId, rowNumber: number, variety: name,
            plantedYear: year, endedYear: null, createdAt: new Date().toISOString(),
          }});
        }
      }
      return {...current, pending: [...current.pending, ...changes]};
    });
  }

  async removeLastEmptyRow(fieldId: string): Promise<void> {
    await this.commit(current => {
      const visible = visibleData(current);
      const active = currentRows(visible.rows, fieldId);
      const last = active[active.length - 1];
      if (!last || last.variety !== null || visible.rows.some(row =>
        row.fieldId === fieldId && row.rowNumber === last.rowNumber && row.id !== last.id)) {
        throw new Error('Можна прибрати лише останній порожній ряд');
      }
      const change: Change = {key: newId(), table: 'plot_rows', action: 'delete', id: last.id};
      return {...current, pending: [...current.pending, change]};
    });
  }

  sync(): Promise<void> {
    if (this.syncing) return this.syncing;
    this.syncing = this.runSync().finally(() => { this.syncing = null; });
    return this.syncing;
  }

  private async runSync(): Promise<void> {
    if (!this.loaded || this.disposed) return;
    while (!this.disposed && this.snapshot.pending.length) {
      const change = this.snapshot.pending[0];
      await this.remote.push(change);
      if (this.disposed) return;
      await this.commit(current => ({
        ...current,
        base: applyChange(current.base, change),
        pending: current.pending.filter(item => item.key !== change.key),
      }));
    }
    if (this.disposed) return;
    const remote = await this.remote.pull();
    if (this.disposed) return;
    await this.commit(current => ({...current, base: remote}));
  }
}
