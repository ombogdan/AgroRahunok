import {useMemo} from 'react';
import {useFarmData} from '../offline/FarmDataProvider';
import type {NewRecord} from './model';

export function useRecords() {
  const {data, loadState, store, sync} = useFarmData();
  const records = useMemo(() => {
    const ids = new Set(data.fields.map(field => field.id));
    return data.records.filter(record => record.fieldId === null || ids.has(record.fieldId))
      .sort((a, b) => b.occurredOn.localeCompare(a.occurredOn) || b.createdAt.localeCompare(a.createdAt));
  }, [data]);
  return {
    records,
    loadState,
    reload: sync,
    addRecord: (input: NewRecord) => {
      if (!store) throw new Error('Локальні дані ще завантажуються');
      return store.addRecord(input);
    },
    updateRecord: (id: string, input: NewRecord) => {
      if (!store) throw new Error('Локальні дані ще завантажуються');
      return store.updateRecord(id, input);
    },
    removeRecord: (id: string) => {
      if (!store) throw new Error('Локальні дані ще завантажуються');
      return store.removeRecord(id);
    },
  };
}
