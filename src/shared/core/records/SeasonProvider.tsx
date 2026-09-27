import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {PropsWithChildren} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SeasonContextValue = {
  selectedSeason: number | null;
  setSelectedSeason: (season: number) => void;
};

const SeasonContext = createContext<SeasonContextValue | null>(null);

export function SeasonProvider({children, userId}: PropsWithChildren<{userId: string | null}>) {
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  useEffect(() => {
    if (!userId) return;
    let active = true;
    AsyncStorage.getItem(`season-v1:${userId}`).then(saved => {
      const season = saved ? Number(saved) : null;
      if (active && season && season >= 2000 && season <= 2100) setSelectedSeason(season);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [userId]);
  const chooseSeason = useCallback((season: number) => {
    setSelectedSeason(season);
    if (userId) AsyncStorage.setItem(`season-v1:${userId}`, String(season)).catch(() => undefined);
  }, [userId]);
  const value = useMemo(() => ({selectedSeason, setSelectedSeason: chooseSeason}), [selectedSeason, chooseSeason]);
  return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>;
}

export function useSeason(): SeasonContextValue {
  const value = useContext(SeasonContext);
  if (!value) throw new Error('useSeason must be used inside SeasonProvider');
  return value;
}
