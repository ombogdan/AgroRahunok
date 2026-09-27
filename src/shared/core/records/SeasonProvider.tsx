import React, {createContext, useContext, useMemo, useState} from 'react';
import type {PropsWithChildren} from 'react';

type SeasonContextValue = {
  selectedSeason: number | null;
  setSelectedSeason: (season: number) => void;
};

const SeasonContext = createContext<SeasonContextValue | null>(null);

export function SeasonProvider({children}: PropsWithChildren) {
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const value = useMemo(() => ({selectedSeason, setSelectedSeason}), [selectedSeason]);
  return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>;
}

export function useSeason(): SeasonContextValue {
  const value = useContext(SeasonContext);
  if (!value) throw new Error('useSeason must be used inside SeasonProvider');
  return value;
}
