import type {Field, NewField} from '../fields/model';
import type {Planting, PlantingInput} from '../fields/plantingsRepository';
import type {FarmRecord, NewRecord} from '../records/model';
import type {QuantityUnit} from '../records/quantityUnitsRepository';

export type FarmData = {
  fields: Field[];
  records: FarmRecord[];
  plantings: Planting[];
  units: QuantityUnit[];
};

export type Change =
  | {key: string; table: 'fields'; action: 'put'; value: Field}
  | {key: string; table: 'fields'; action: 'delete'; id: string}
  | {key: string; table: 'records'; action: 'put'; value: FarmRecord}
  | {key: string; table: 'records'; action: 'delete'; id: string}
  | {key: string; table: 'plantings'; action: 'put'; value: Planting}
  | {key: string; table: 'units'; action: 'put'; value: QuantityUnit};

export type FarmSnapshot = {version: 1; base: FarmData; pending: Change[]};
export type Storage = {getItem: (key: string) => Promise<string | null>; setItem: (key: string, value: string) => Promise<unknown>};
export type Remote = {push: (change: Change) => Promise<void>; pull: () => Promise<FarmData>};

const emptyData = (): FarmData => ({fields: [], records: [], plantings: [], units: []});
const emptySnapshot = (): FarmSnapshot => ({version: 1, base: emptyData(), pending: []});

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
    };
  }
  if (change.table === 'records') {
    if (change.action === 'put') return {...data, records: replaceById(data.records, change.value)};
    return {...data, records: data.records.filter(item => item.id !== change.id)};
  }
  if (change.table === 'plantings') {
    return {...data, plantings: replaceById(data.plantings, change.value)};
  }
  return {...data, units: replaceById(data.units, change.value)};
}

export function visibleData(snapshot: FarmSnapshot): FarmData {
  return snapshot.pending.reduce(applyChange, snapshot.base);
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
        const parsed = JSON.parse(saved) as FarmSnapshot;
        if (parsed.version !== 1 || !parsed.base || !Array.isArray(parsed.pending)) {
          throw new Error('Невідома версія локальних даних');
        }
        this.snapshot = parsed;
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

  async savePlanting(input: PlantingInput): Promise<void> {
    const old = this.data.plantings.find(item => item.fieldId === input.fieldId && item.season === input.season);
    const value: Planting = {
      id: old?.id ?? newId(), fieldId: input.fieldId, season: input.season,
      crop: input.crop, variety: input.variety, areaM2: input.areaM2,
    };
    await this.enqueue({key: newId(), table: 'plantings', action: 'put', value});
  }

  async addUnit(name: string, kilogramsPerUnit: number): Promise<QuantityUnit> {
    const value = {id: newId(), name, kilogramsPerUnit};
    await this.enqueue({key: newId(), table: 'units', action: 'put', value});
    return value;
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
