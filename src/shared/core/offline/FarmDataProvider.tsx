import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {PropsWithChildren} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppState} from 'react-native';
import {useAuth} from '../providers/auth/AuthProvider';
import {logSupabaseError} from '../supabase/errors';
import {FarmStore} from './farmStore';
import type {FarmData} from './farmStore';
import {remoteFarm} from './remoteFarm';

type SyncState = 'ready' | 'syncing' | 'waiting';
type FarmContextValue = {
  data: FarmData;
  loadState: 'loading' | 'ready' | 'error';
  pendingCount: number;
  syncState: SyncState;
  store: FarmStore | null;
  sync: () => void;
};

const FarmContext = createContext<FarmContextValue | null>(null);
const empty: FarmData = {fields: [], records: [], plantings: [], units: [], rows: []};

export function FarmDataProvider({children}: PropsWithChildren) {
  const {session} = useAuth();
  const userId = session?.kind === 'authenticated' ? session.userId : null;
  const store = useMemo(() => userId ? new FarmStore(userId, AsyncStorage, remoteFarm) : null, [userId]);
  const currentStore = useRef(store);
  currentStore.current = store;
  const [revision, setRevision] = useState(0);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [syncState, setSyncState] = useState<SyncState>('ready');

  const sync = useCallback(() => {
    if (!store?.ready) return;
    setSyncState('syncing');
    store.sync().then(() => {
      if (currentStore.current === store) setSyncState('ready');
    }).catch(error => {
      if (currentStore.current !== store) return;
      // Keep the local queue and retry automatically. Network loss is expected, so no alert.
      if (__DEV__ && !/network request failed|failed to fetch/i.test(String(error))) {
        logSupabaseError('Синхронізацію відкладено', error);
      }
      setSyncState('waiting');
    });
  }, [store]);

  useEffect(() => {
    let active = true;
    setOwnerId(userId);
    setLoadState(userId ? 'loading' : 'ready');
    setSyncState('ready');
    if (!store) return () => { active = false; };
    store.activate();
    const unsubscribe = store.subscribe(() => { if (active) setRevision(value => value + 1); });
    store.load().then(() => {
      if (!active) return;
      setLoadState('ready');
      sync();
    }).catch(error => {
      logSupabaseError('Не вдалося відкрити локальні дані', error);
      if (active) setLoadState('error');
    });
    const appState = AppState.addEventListener('change', state => {
      if (state === 'active') sync();
    });
    // Also catches reconnection while the application remains in the foreground.
    const retry = setInterval(() => {
      if (AppState.currentState === 'active') sync();
    }, 15000);
    return () => { active = false; unsubscribe(); store.dispose(); appState.remove(); clearInterval(retry); };
  }, [store, userId, sync]);

  useEffect(() => {
    if (store?.ready && store.pendingCount > 0) sync();
  }, [store, revision, sync]);

  const value = useMemo<FarmContextValue>(() => ({
    data: ownerId === userId && store?.ready ? store.data : empty,
    loadState: ownerId === userId ? loadState : 'loading',
    pendingCount: ownerId === userId ? store?.pendingCount ?? 0 : 0,
    syncState,
    store: ownerId === userId && store?.ready ? store : null,
    sync,
  // revision tells React to read a new local snapshot after each durable transaction.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [store, ownerId, userId, loadState, syncState, sync, revision]);

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarmData(): FarmContextValue {
  const context = useContext(FarmContext);
  if (!context) throw new Error('useFarmData requires FarmDataProvider');
  return context;
}
