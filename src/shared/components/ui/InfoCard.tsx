import React from 'react';
import {View} from 'react-native';
import type {PropsWithChildren} from 'react';
import {useThemedStyles} from '../../theme';
import type {AppTheme} from '../../theme/theme';

const createStyles = (theme: AppTheme) => ({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
});

export function InfoCard({children}: PropsWithChildren) {
  const styles = useThemedStyles(createStyles);
  return <View style={styles.card}>{children}</View>;
}
