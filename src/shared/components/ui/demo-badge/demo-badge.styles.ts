import {useThemedStyles} from '../../../theme';
import type {AppTheme, Scale} from '../../../theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  badge: {
    alignSelf: 'flex-start' as const,
    backgroundColor: theme.colors.accentSoft,
    borderRadius: scale(theme.radii.full),
    paddingHorizontal: scale(theme.spacing.md),
    paddingVertical: scale(theme.spacing.sm),
  },
  text: {
    color: theme.colors.text,
    fontSize: scale(theme.typography.label),
    fontWeight: '700' as const,
  },
});

export const useStyles = () => useThemedStyles(createStyles);
