import {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {useTheme} from './ThemeProvider';
import type {AppTheme} from './theme';

export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  createStyles: (theme: AppTheme) => T,
): T {
  const {theme} = useTheme();
  return useMemo(() => StyleSheet.create(createStyles(theme)), [createStyles, theme]);
}
