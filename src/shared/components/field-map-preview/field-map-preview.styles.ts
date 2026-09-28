import {useThemedStyles} from '../../theme';
import type {AppTheme, Scale} from '../../theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  map: {height: scale(190), borderRadius: scale(20), overflow: 'hidden' as const,
    borderWidth: scale(1), borderColor: theme.colors.border},
  fill: {flex: 1},
});

export const useStyles = () => useThemedStyles(createStyles);
