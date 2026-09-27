import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {useAuth} from '../providers/auth/AuthProvider';
import {useFields} from '../fields/FieldsProvider';
import {logSupabaseError} from '../supabase/errors';
import type {FarmRecord, NewRecord} from './model';
import {deleteRecord, fetchRecords, insertRecord, updateRecord as saveRecordChanges} from './recordsRepository';

type LoadState = 'loading' | 'ready' | 'error';
type RecordsContextValue = {
  records: FarmRecord[];
  loadState: LoadState;
  reload: () => void;
  addRecord: (input: NewRecord) => Promise<FarmRecord>;
  updateRecord: (id: string, input: NewRecord) => Promise<FarmRecord>;
  removeRecord: (id: string) => Promise<void>;
};

const RecordsContext = createContext<RecordsContextValue | null>(null);

// Newest day first; within a day, the latest entry first.
function byNewest(a: FarmRecord, b: FarmRecord): number {
  return b.occurredOn.localeCompare(a.occurredOn) || b.createdAt.localeCompare(a.createdAt);
}

export function RecordsProvider({children}: PropsWithChildren) {
  const {session} = useAuth();
  const {fields} = useFields();
  const userId = session?.kind === 'authenticated' ? session.userId : null;
  const [records, setRecords] = useState<FarmRecord[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  // As in FieldsProvider: report "loading" until the state belongs to the current user.
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    setOwnerId(userId);
    setRecords([]);
    if (!userId) {
      setLoadState('ready');
      return;
    }
    setLoadState('loading');
    fetchRecords()
      .then(list => {
        if (!active) return;
        setRecords(list);
        setLoadState('ready');
      })
      .catch(error => {
        logSupabaseError('Не вдалося завантажити записи', error);
        if (active) setLoadState('error');
      });
    return () => { active = false; };
  }, [userId, reloadToken]);

  // Deleting a plot deletes its records in the database; hide them here straight away.
  const visibleRecords = useMemo(() => {
    if (ownerId !== userId) return [];
    const fieldIds = new Set(fields.map(field => field.id));
    return records.filter(record => fieldIds.has(record.fieldId));
  }, [records, fields, ownerId, userId]);
  const visibleLoadState: LoadState = ownerId === userId ? loadState : 'loading';

  const addRecord = useCallback(async (input: NewRecord) => {
    const record = await insertRecord(input);
    setRecords(current => [...current, record].sort(byNewest));
    return record;
  }, []);

  const updateRecord = useCallback(async (id: string, input: NewRecord) => {
    const record = await saveRecordChanges(id, input);
    setRecords(current => current.map(item => (item.id === id ? record : item)).sort(byNewest));
    return record;
  }, []);

  const removeRecord = useCallback(async (id: string) => {
    await deleteRecord(id);
    setRecords(current => current.filter(record => record.id !== id));
  }, []);

  const value = useMemo<RecordsContextValue>(() => ({
    records: visibleRecords,
    loadState: visibleLoadState,
    reload: () => setReloadToken(current => current + 1),
    addRecord,
    updateRecord,
    removeRecord,
  }), [visibleRecords, visibleLoadState, addRecord, updateRecord, removeRecord]);
  return <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>;
}

export function useRecords(): RecordsContextValue {
  const value = useContext(RecordsContext);
  if (!value) throw new Error('useRecords must be used inside RecordsProvider');
  return value;
}
