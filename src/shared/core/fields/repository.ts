import {createAsyncStorage} from '@react-native-async-storage/async-storage';
import type {Field} from './model';

const storage = createAsyncStorage('agrorahunok');
const storageKey = (userId: string) => `@agrorahunok/fields/v2/${userId}`;
const legacyKey = (userId: string) => `@agrorahunok/fields/v1/${userId}`;

export type PendingFieldChange =
  | {operationId: string; kind: 'upsert'; field: Field}
  | {operationId: string; kind: 'delete'; fieldId: string};

export type FieldsSnapshot = {
  version: 2;
  fields: Field[];
  pending: PendingFieldChange[];
  initialUploadComplete: boolean;
};

export async function loadFieldsSnapshot(userId: string): Promise<FieldsSnapshot> {
  const raw = await storage.getItem(storageKey(userId));
  if (raw !== null) {
    const stored: FieldsSnapshot = JSON.parse(raw);
    if (stored.version !== 2 || !Array.isArray(stored.fields) ||
        !Array.isArray(stored.pending) || typeof stored.initialUploadComplete !== 'boolean') {
      throw new Error('Unsupported fields storage version');
    }
    return stored;
  }

  // Existing installations stored their fields in v1. Upload them once on first sync.
  const legacyRaw = await storage.getItem(legacyKey(userId));
  if (legacyRaw !== null) {
    const legacy: {version: number; fields: Field[]} = JSON.parse(legacyRaw);
    if (legacy.version !== 1 || !Array.isArray(legacy.fields)) {
      throw new Error('Unsupported legacy fields storage version');
    }
    return {version: 2, fields: legacy.fields, pending: [], initialUploadComplete: false};
  }
  return {version: 2, fields: [], pending: [], initialUploadComplete: false};
}

export async function saveFieldsSnapshot(userId: string, snapshot: FieldsSnapshot): Promise<void> {
  // Fields and their upload queue are one write, so an offline edit cannot lose its pending change.
  await storage.setItem(storageKey(userId), JSON.stringify(snapshot));
}
