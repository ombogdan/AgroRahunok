import {useThemedStyles} from '../../../shared/theme';
import type {AppTheme, Scale} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  mapPreview: {
    height: scale(196),
    overflow: 'hidden' as const,
    borderRadius: scale(theme.radii.lg),
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: scale(1),
    borderColor: theme.colors.border,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    gap: scale(theme.spacing.md),
  },
  plotRow: {flexDirection: 'row' as const, gap: scale(theme.spacing.md)},
  plot: {
    width: scale(105),
    height: scale(70),
    borderRadius: scale(theme.radii.sm),
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary,
    borderWidth: scale(2),
    transform: [{rotate: '-7deg'}],
  },
  plotSmall: {
    width: scale(62),
    height: scale(75),
    borderRadius: scale(theme.radii.sm),
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.accent,
    borderWidth: scale(2),
    transform: [{rotate: '8deg'}],
  },
  mapText: {
    color: theme.colors.textMuted,
    fontSize: scale(theme.typography.small),
    fontWeight: '600' as const,
  },
});

export const useStyles = () => useThemedStyles(createStyles);
