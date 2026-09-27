import {FarmStore, applyChange} from '../src/shared/core/offline/farmStore';
import type {Change, FarmData, Remote, Storage} from '../src/shared/core/offline/farmStore';
import type {NewField} from '../src/shared/core/fields/model';

const fieldInput: NewField = {
  name: 'Малинник', type: 'berries', crop: 'Малина', variety: null,
  documentAreaM2: 2000, measuredAreaM2: null, areaSource: 'document', polygon: [],
};
const empty = (): FarmData => ({fields: [], records: [], plantings: [], units: [], rows: []});

function fixture() {
  const disk = new Map<string, string>();
  const storage: Storage = {
    getItem: async key => disk.get(key) ?? null,
    setItem: async (key, value) => { disk.set(key, value); },
  };
  let online = false;
  let server = empty();
  const sent: Change[] = [];
  const remote: Remote = {
    push: async change => {
      if (!online) throw new Error('offline');
      sent.push(change);
      server = applyChange(server, change);
    },
    pull: async () => {
      if (!online) throw new Error('offline');
      return server;
    },
  };
  return {storage, remote, sent, goOnline: () => { online = true; }, server: () => server};
}

test('offline changes survive restart and upload in dependency order', async () => {
  const setup = fixture();
  const first = new FarmStore('user-1', setup.storage, setup.remote);
  await first.load();
  const field = await first.addField(fieldInput);
  await first.savePlanting({fieldId: field.id, season: 2027, crop: 'Малина', variety: null, areaM2: 2000});
  const record = await first.addRecord({
    fieldId: field.id, kind: 'harvest', workType: null, occurredOn: '2027-06-10', season: 2027,
    amountKopecks: null, quantityKg: 20, note: null, details: {unitName: 'відро'},
  });
  await first.addUnit('відро', 5);
  expect(first.pendingCount).toBe(4);
  await expect(first.sync()).rejects.toThrow('offline');

  const restarted = new FarmStore('user-1', setup.storage, setup.remote);
  await restarted.load();
  expect(restarted.data.fields[0].id).toBe(field.id);
  expect(restarted.data.records[0].id).toBe(record.id);
  expect(restarted.pendingCount).toBe(4);

  setup.goOnline();
  await restarted.sync();
  expect(restarted.pendingCount).toBe(0);
  expect(setup.sent.map(change => change.table)).toEqual(['fields', 'plantings', 'records', 'units']);
  expect(setup.server().records[0].fieldId).toBe(field.id);
});

test('a failed local write never claims to save a change', async () => {
  const storage: Storage = {
    getItem: async () => null,
    setItem: async () => { throw new Error('disk full'); },
  };
  const remote: Remote = {push: async () => {}, pull: async () => empty()};
  const store = new FarmStore('user-1', storage, remote);
  await store.load();
  await expect(store.addField(fieldInput)).rejects.toThrow('disk full');
  expect(store.data.fields).toHaveLength(0);
  expect(store.pendingCount).toBe(0);
});

test('a failed upload keeps remaining changes and local edits win over a later pull', async () => {
  const setup = fixture();
  const store = new FarmStore('user-1', setup.storage, setup.remote);
  await store.load();
  const field = await store.addField(fieldInput);
  await store.updateField(field.id, {...fieldInput, name: 'Новий малинник'});
  await expect(store.sync()).rejects.toThrow('offline');
  expect(store.pendingCount).toBe(2);
  expect(store.data.fields[0].name).toBe('Новий малинник');
  setup.goOnline();
  await store.sync();
  expect(setup.server().fields[0].name).toBe('Новий малинник');
  await store.removeField(field.id);
  expect(store.data.fields).toHaveLength(0);
  await store.sync();
  expect(setup.server().fields).toHaveLength(0);
});

test('a partial upload resumes after restart without losing acknowledged or pending rows', async () => {
  const setup = fixture();
  let allowed = 1;
  const remote: Remote = {
    push: async change => {
      if (allowed-- <= 0) throw new Error('connection dropped');
      await setup.remote.push(change);
    },
    pull: setup.remote.pull,
  };
  setup.goOnline();
  const store = new FarmStore('user-1', setup.storage, remote);
  await store.load();
  const field = await store.addField(fieldInput);
  await store.addRecord({
    fieldId: field.id, kind: 'work', workType: 'sap', occurredOn: '2027-06-10', season: 2027,
    amountKopecks: -100000, quantityKg: null, note: null, details: {},
  });
  await expect(store.sync()).rejects.toThrow('connection dropped');
  expect(store.pendingCount).toBe(1);
  expect(store.data.records).toHaveLength(1);

  const restarted = new FarmStore('user-1', setup.storage, setup.remote);
  await restarted.load();
  await restarted.sync();
  expect(restarted.pendingCount).toBe(0);
  expect(setup.server().fields).toHaveLength(1);
  expect(setup.server().records).toHaveLength(1);
});

test('local snapshots are isolated by account', async () => {
  const setup = fixture();
  const first = new FarmStore('user-1', setup.storage, setup.remote);
  await first.load();
  await first.addField(fieldInput);
  const second = new FarmStore('user-2', setup.storage, setup.remote);
  await second.load();
  expect(second.data.fields).toHaveLength(0);
  expect(second.pendingCount).toBe(0);
});
