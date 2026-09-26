import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {AppState} from 'react-native';
import {useAuth} from '../providers/auth/AuthProvider';
import type {Field, NewField} from './model';
import {FieldsStore} from './FieldsStore';
import type {FieldsSyncState} from './FieldsStore';

type LoadState = 'loading' | 'ready' | 'error';
type FieldsContextValue = {
  fields: Field[];
  loadState: LoadState;
  syncState: FieldsSyncState;
  reload: () => void;
  retrySync: () => void;
  addField: (input: NewField) => Promise<Field>;
  removeField: (id: string) => Promise<void>;
};

const FieldsContext = createContext<FieldsContextValue | null>(null);

export function FieldsProvider({children}: PropsWithChildren) {
  const {session} = useAuth();
  const userId = session?.kind === 'authenticated' ? session.userId : null;
  const [fields, setFields] = useState<Field[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [syncState, setSyncState] = useState<FieldsSyncState>('pending');
  const [reloadToken, setReloadToken] = useState(0);
  const storeRef = useRef<FieldsStore | null>(null);

  useEffect(() => {
    let active = true;
    setFields([]);
    setLoadState('loading');
    setSyncState('pending');
    if (!userId) {
      storeRef.current = null;
      setLoadState('ready');
      return;
    }

    const store = new FieldsStore(userId, {onFields: setFields, onSyncState: setSyncState});
    storeRef.current = store;
    store.load()
      .then(() => { if (active) setLoadState('ready'); })
      .catch(() => { if (active) setLoadState('error'); });

    const appState = AppState.addEventListener('change', state => {
      if (state === 'active') store.sync();
    });
    const retryTimer = setInterval(() => {
      if (store.hasPendingChanges()) store.sync();
    }, 60_000);

    return () => {
      active = false;
      store.close();
      appState.remove();
      clearInterval(retryTimer);
      if (storeRef.current === store) storeRef.current = null;
    };
  }, [userId, reloadToken]);

  const addField = useCallback((input: NewField) => {
    if (!storeRef.current || loadState !== 'ready') {
      return Promise.reject(new Error('Fields are not ready'));
    }
    return storeRef.current.addField(input);
  }, [loadState]);

  const removeField = useCallback((id: string) => {
    if (!storeRef.current || loadState !== 'ready') {
      return Promise.reject(new Error('Fields are not ready'));
    }
    return storeRef.current.removeField(id);
  }, [loadState]);

  const value = useMemo<FieldsContextValue>(() => ({
    fields,
    loadState,
    syncState,
    reload: () => setReloadToken(current => current + 1),
    retrySync: () => { storeRef.current?.sync(); },
    addField,
    removeField,
  }), [fields, loadState, syncState, addField, removeField]);
  return <FieldsContext.Provider value={value}>{children}</FieldsContext.Provider>;
}

export function useFields(): FieldsContextValue {
  const value = useContext(FieldsContext);
  if (!value) throw new Error('useFields must be used inside FieldsProvider');
  return value;
}
