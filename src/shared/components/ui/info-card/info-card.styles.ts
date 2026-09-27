import {useThemedStyles} from '../../../theme';
import type {AppTheme, Scale} from '../../../theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: scale(1),
    borderRadius: scale(theme.radii.lg),
    padding: scale(theme.spacing.lg),
    gap: scale(theme.spacing.md),
    shadowColor: '#193327',
    shadowOpacity: theme.colors.surface === '#FFFFFF' ? 0.06 : 0,
    shadowRadius: scale(10),
    shadowOffset: {width: scale(0), height: scale(4)},
    elevation: theme.colors.surface === '#FFFFFF' ? scale(2) : scale(0),
  },
});

export const useStyles = () => useThemedStyles(createStyles);
