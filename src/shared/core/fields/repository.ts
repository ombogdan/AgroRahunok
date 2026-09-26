import {createAsyncStorage} from '@react-native-async-storage/async-storage';
import type {Field} from './model';

const VERSION = 1;
const storage = createAsyncStorage('agrorahunok');
const storageKey = (userId: string) => `@agrorahunok/fields/v${VERSION}/${userId}`;

type StoredFields = {version: number; fields: Field[]};

export async function loadFields(userId: string): Promise<Field[]> {
  const raw = await storage.getItem(storageKey(userId));
  if (raw === null) return [];
  const stored: StoredFields = JSON.parse(raw);
  if (stored.version !== VERSION || !Array.isArray(stored.fields)) {
    throw new Error('Unsupported fields storage version');
  }
  return stored.fields;
}

export async function saveFields(userId: string, fields: Field[]): Promise<void> {
  await storage.setItem(storageKey(userId), JSON.stringify({version: VERSION, fields}));
}
