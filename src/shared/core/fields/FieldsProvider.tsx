import {useFarmData} from '../offline/FarmDataProvider';
import type {NewField} from './model';

// Existing screens keep this domain hook; FarmDataProvider owns the durable snapshot.
export function useFields() {
  const {data, loadState, store, sync} = useFarmData();
  return {
    fields: data.fields,
    loadState,
    reload: sync,
    addField: (input: NewField) => {
      if (!store) throw new Error('Локальні дані ще завантажуються');
      return store.addField(input);
    },
    updateField: (id: string, input: NewField) => {
      if (!store) throw new Error('Локальні дані ще завантажуються');
      return store.updateField(id, input);
    },
    removeField: (id: string) => {
      if (!store) throw new Error('Локальні дані ще завантажуються');
      return store.removeField(id);
    },
  };
}
