import {useThemedStyles} from '../../../shared/theme';
import type {AppTheme} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme) => ({
  mapPreview: {
    height: 196,
    overflow: 'hidden' as const,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.md,
  },
  plotRow: {flexDirection: 'row' as const, gap: theme.spacing.md},
  plot: {
    width: 105,
    height: 70,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary,
    borderWidth: 2,
    transform: [{rotate: '-7deg'}],
  },
  plotSmall: {
    width: 62,
    height: 75,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.accent,
    borderWidth: 2,
    transform: [{rotate: '8deg'}],
  },
  mapText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: '600' as const,
  },
});

export const useStyles = () => useThemedStyles(createStyles);
