import {useThemedStyles} from '../../../../shared/theme';
import type {AppTheme, Scale} from '../../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  dock: {paddingHorizontal: scale(20), paddingVertical: scale(12), backgroundColor: theme.colors.background},
});

export const useStyles = () => useThemedStyles(createStyles);
