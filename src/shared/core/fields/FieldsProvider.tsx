import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {useAuth} from '../providers/auth/AuthProvider';
import {logSupabaseError} from '../supabase/errors';
import type {Field, NewField} from './model';
import {deleteField, fetchFields, insertField} from './fieldsRepository';

type LoadState = 'loading' | 'ready' | 'error';
type FieldsContextValue = {
  fields: Field[];
  loadState: LoadState;
  reload: () => void;
  addField: (input: NewField) => Promise<Field>;
  removeField: (id: string) => Promise<void>;
};

const FieldsContext = createContext<FieldsContextValue | null>(null);
const NO_FIELDS: Field[] = [];

export function FieldsProvider({children}: PropsWithChildren) {
  const {session} = useAuth();
  const userId = session?.kind === 'authenticated' ? session.userId : null;
  const [fields, setFields] = useState<Field[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  // The user the state above belongs to. Until the effect catches up with a new session,
  // report "loading" instead of flashing the previous user's list or the empty state.
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    setOwnerId(userId);
    setFields([]);
    if (!userId) {
      setLoadState('ready');
      return;
    }
    setLoadState('loading');
    fetchFields()
      .then(list => {
        if (!active) return;
        setFields(list);
        setLoadState('ready');
      })
      .catch(error => {
        logSupabaseError('Не вдалося завантажити ділянки', error);
        if (active) setLoadState('error');
      });
    return () => { active = false; };
  }, [userId, reloadToken]);

  const isCurrent = ownerId === userId;
  const visibleLoadState: LoadState = isCurrent ? loadState : 'loading';
  const visibleFields = isCurrent ? fields : NO_FIELDS;

  const addField = useCallback(async (input: NewField) => {
    const field = await insertField(input);
    setFields(current => [...current, field]);
    return field;
  }, []);

  const removeField = useCallback(async (id: string) => {
    await deleteField(id);
    setFields(current => current.filter(field => field.id !== id));
  }, []);

  const value = useMemo<FieldsContextValue>(() => ({
    fields: visibleFields,
    loadState: visibleLoadState,
    reload: () => setReloadToken(current => current + 1),
    addField,
    removeField,
  }), [visibleFields, visibleLoadState, addField, removeField]);
  return <FieldsContext.Provider value={value}>{children}</FieldsContext.Provider>;
}

export function useFields(): FieldsContextValue {
  const value = useContext(FieldsContext);
  if (!value) throw new Error('useFields must be used inside FieldsProvider');
  return value;
}
