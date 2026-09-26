import React, {createContext, useContext, useMemo} from 'react';
import {useColorScheme} from 'react-native';
import {darkTheme, lightTheme} from './theme';
import type {AppTheme} from './theme';

type ThemeContextValue = {
  theme: AppTheme;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  isDark: false,
});

export function ThemeProvider({children}: {children: React.ReactNode}) {
  const isDark = useColorScheme() === 'dark';
  const value = useMemo(
    () => ({theme: isDark ? darkTheme : lightTheme, isDark}),
    [isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
