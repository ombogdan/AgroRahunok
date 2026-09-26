import type {Field, NewField} from './model';
import {isSupabaseConfigured} from '../config/supabase';
import {syncUserProfile} from '../supabase/userProfileRepository';
import {applyPendingChanges, syncRemoteFields} from './remoteRepository';
import {
  loadFieldsSnapshot,
  saveFieldsSnapshot,
} from './repository';
import type {FieldsSnapshot} from './repository';

export type FieldsSyncState = 'unconfigured' | 'pending' | 'syncing' | 'synced' | 'error';

type StoreCallbacks = {
  onFields: (fields: Field[]) => void;
  onSyncState: (state: FieldsSyncState) => void;
};

export class FieldsStore {
  private snapshot: FieldsSnapshot | null = null;
  private queue: Promise<void> = Promise.resolve();
  private syncTask: Promise<void> | null = null;
  private syncRequested = false;
  private lastSyncFailed = false;
  private closed = false;

  constructor(private userId: string, private callbacks: StoreCallbacks) {}

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.queue.then(operation);
    this.queue = result.then(() => undefined, () => undefined);
    return result;
  }

  async load(): Promise<void> {
    const snapshot = await loadFieldsSnapshot(this.userId);
    if (this.closed) return;
    this.snapshot = snapshot;
    this.callbacks.onFields(snapshot.fields);
    this.callbacks.onSyncState(isSupabaseConfigured ? 'pending' : 'unconfigured');
    this.sync();
  }

  close(): void {
    this.closed = true;
  }

  hasPendingChanges(): boolean {
    return !!this.snapshot &&
      (this.lastSyncFailed || !this.snapshot.initialUploadComplete || this.snapshot.pending.length > 0);
  }

  addField(input: NewField): Promise<Field> {
    return this.enqueue(async () => {
      if (this.closed || !this.snapshot) throw new Error('Fields are not ready');
      const field: Field = {
        ...input,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        createdAt: new Date().toISOString(),
      };
      const next: FieldsSnapshot = {
        ...this.snapshot,
        fields: [...this.snapshot.fields, field],
        pending: [...this.snapshot.pending, {
          operationId: field.id,
          kind: 'upsert',
          field,
        }],
      };
      await saveFieldsSnapshot(this.userId, next);
      this.snapshot = next;
      this.callbacks.onFields(next.fields);
      this.callbacks.onSyncState(isSupabaseConfigured ? 'pending' : 'unconfigured');
      this.sync();
      return field;
    });
  }

  removeField(fieldId: string): Promise<void> {
    return this.enqueue(async () => {
      if (this.closed || !this.snapshot) throw new Error('Fields are not ready');
      if (!this.snapshot.fields.some(field => field.id === fieldId)) return;
      const next: FieldsSnapshot = {
        ...this.snapshot,
        fields: this.snapshot.fields.filter(field => field.id !== fieldId),
        pending: [...this.snapshot.pending, {
          operationId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          kind: 'delete',
          fieldId,
        }],
      };
      await saveFieldsSnapshot(this.userId, next);
      this.snapshot = next;
      this.callbacks.onFields(next.fields);
      this.callbacks.onSyncState(isSupabaseConfigured ? 'pending' : 'unconfigured');
      this.sync();
    });
  }

  sync(): Promise<void> {
    if (this.closed || !this.snapshot) return Promise.resolve();
    if (!isSupabaseConfigured) {
      this.callbacks.onSyncState('unconfigured');
      return Promise.resolve();
    }
    if (this.syncTask) {
      this.syncRequested = true;
      return this.syncTask;
    }

    const task = (async () => {
      this.callbacks.onSyncState('syncing');
      const before = await this.enqueue(async () => this.snapshot!);
      await syncUserProfile(this.userId);
      const remote = await syncRemoteFields(this.userId, before);
      await this.enqueue(async () => {
        if (this.closed || !this.snapshot) return;
        const uploaded = new Set(before.pending.map(change => change.operationId));
        const pending = this.snapshot.pending.filter(change => !uploaded.has(change.operationId));
        const next: FieldsSnapshot = {
          version: 2,
          fields: applyPendingChanges(remote, pending),
          pending,
          initialUploadComplete: true,
        };
        await saveFieldsSnapshot(this.userId, next);
        this.snapshot = next;
        this.lastSyncFailed = false;
        this.callbacks.onFields(next.fields);
        this.callbacks.onSyncState(pending.length > 0 ? 'pending' : 'synced');
      });
    })().catch(error => {
      if (this.closed) return;
      this.lastSyncFailed = true;
      console.warn('Не вдалося синхронізувати ділянки із Supabase', error);
      this.callbacks.onSyncState('error');
    }).finally(() => {
      this.syncTask = null;
      if (this.syncRequested && !this.closed) {
        this.syncRequested = false;
        this.sync();
      }
    });
    this.syncTask = task;
    return task;
  }
}
