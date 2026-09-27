import {useThemedStyles} from '../../../shared/theme';
import type {AppTheme, Scale} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  track: {
    height: scale(14),
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: scale(theme.radii.full),
    overflow: 'hidden' as const,
  },
  bar: {
    height: scale(14),
    width: '68%' as const,
    backgroundColor: theme.colors.primary,
    borderRadius: scale(theme.radii.full),
  },
});

export const useStyles = () => useThemedStyles(createStyles);
