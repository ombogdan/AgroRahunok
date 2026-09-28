import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {Region} from 'react-native-maps';

const STORAGE_KEY = 'agrorahunok:last-map-region';
// Only a zoomed-in view is a place worth returning to; the country-wide overview is not.
const MAX_REMEMBERED_DELTA = 0.5;

// The whole of Ukraine, for a map that has never been moved anywhere.
export const DEFAULT_MAP_REGION: Region = {latitude: 49, longitude: 31.5, latitudeDelta: 6, longitudeDelta: 6};

// Read once per app run, then kept in memory so the next map opens without waiting.
let remembered: Region | null | undefined;

function isPlace(value: unknown): value is Region {
  if (!value || typeof value !== 'object') return false;
  const {latitude, longitude, latitudeDelta, longitudeDelta} = value as Record<string, unknown>;
  if (![latitude, longitude, latitudeDelta, longitudeDelta].every(item => typeof item === 'number' &&
    Number.isFinite(item))) return false;
  const region = value as Region;
  return Math.abs(region.latitude) <= 90 && Math.abs(region.longitude) <= 180 && region.longitudeDelta > 0 &&
    region.latitudeDelta > 0 && region.latitudeDelta <= MAX_REMEMBERED_DELTA;
}

// Where the map was last left: null if never, undefined while it is still being read.
export function useLastMapRegion(): Region | null | undefined {
  const [region, setRegion] = useState(remembered);
  useEffect(() => {
    if (remembered !== undefined) return;
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then(saved => {
        const parsed: unknown = saved ? JSON.parse(saved) : null;
        return isPlace(parsed) ? parsed : null;
      })
      .catch(() => null)
      .then(saved => {
        if (remembered === undefined) remembered = saved;
        if (active) setRegion(remembered);
      });
    return () => { active = false; };
  }, []);
  return region;
}

let pendingWrite: ReturnType<typeof setTimeout> | null = null;

// Pass as a map's onRegionChangeComplete: every place the user pans or zooms to is kept for next time.
// A walk moves the map every second, so only the place where it comes to rest is written to the phone.
export function rememberMapRegion(region: Region): void {
  if (!isPlace(region)) return;
  remembered = region;
  if (pendingWrite) clearTimeout(pendingWrite);
  pendingWrite = setTimeout(() => {
    pendingWrite = null;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(region)).catch(() => undefined);
  }, 1000);
}
