import React from 'react';
import {Text, View} from 'react-native';
import {useThemedStyles} from '../../theme';
import type {AppTheme} from '../../theme/theme';

const createStyles = (theme: AppTheme) => ({
  badge: {
    alignSelf: 'flex-start' as const,
    backgroundColor: theme.colors.accentSoft,
    borderRadius: theme.radii.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  text: {
    color: theme.colors.text,
    fontSize: theme.typography.label,
    fontWeight: '700' as const,
  },
});

export function DemoBadge() {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>МАКЕТ · ПРИКЛАД ДАНИХ</Text>
    </View>
  );
}
