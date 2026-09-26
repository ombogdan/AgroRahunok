import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {useAuth} from '../providers/auth/AuthProvider';
import type {Field, NewField} from './model';
import {loadFields, saveFields} from './repository';

type LoadState = 'loading' | 'ready' | 'error';
type FieldsContextValue = {
  fields: Field[];
  loadState: LoadState;
  reload: () => void;
  addField: (input: NewField) => Promise<Field>;
  removeField: (id: string) => Promise<void>;
};

const FieldsContext = createContext<FieldsContextValue | null>(null);

export function FieldsProvider({children}: PropsWithChildren) {
  const {session} = useAuth();
  const userId = session?.kind === 'authenticated' ? session.userId : null;
  const [fields, setFields] = useState<Field[]>([]);
  const fieldsRef = useRef<Field[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    fieldsRef.current = [];
    setFields([]);
    setLoadState('loading');
    if (!userId) {
      setLoadState('ready');
      return () => {active = false;};
    }
    loadFields(userId).then(loaded => {
      if (!active) return;
      fieldsRef.current = loaded;
      setFields(loaded);
      setLoadState('ready');
    }).catch(() => {
      if (active) setLoadState('error');
    });
    return () => {active = false;};
  }, [userId, reloadToken]);

  const addField = useCallback(async (input: NewField) => {
    if (!userId || loadState !== 'ready') throw new Error('Fields are not ready');
    const field: Field = {
      ...input, id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    const next = [...fieldsRef.current, field];
    await saveFields(userId, next);
    fieldsRef.current = next;
    setFields(next);
    return field;
  }, [userId, loadState]);

  const removeField = useCallback(async (id: string) => {
    if (!userId || loadState !== 'ready') throw new Error('Fields are not ready');
    const next = fieldsRef.current.filter(item => item.id !== id);
    await saveFields(userId, next);
    fieldsRef.current = next;
    setFields(next);
  }, [userId, loadState]);

  const value = useMemo<FieldsContextValue>(() => ({
    fields, loadState, reload: () => setReloadToken(current => current + 1), addField, removeField,
  }), [fields, loadState, addField, removeField]);
  return <FieldsContext.Provider value={value}>{children}</FieldsContext.Provider>;
}

export function useFields(): FieldsContextValue {
  const value = useContext(FieldsContext);
  if (!value) throw new Error('useFields must be used inside FieldsProvider');
  return value;
}
