import {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {useTheme} from './ThemeProvider';
import type {AppTheme, Scale} from './theme';
import {useScale} from './useScale';

export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  createStyles: (theme: AppTheme, scale: Scale) => T,
): T {
  const {theme} = useTheme();
  const scale = useScale();
  return useMemo(() => StyleSheet.create(createStyles(theme, scale)), [createStyles, theme, scale]);
}
