import {useThemedStyles} from '../../../shared/theme';
import type {AppTheme, Scale} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  label: {color: theme.colors.textMuted, fontSize: scale(theme.typography.small)},
  title: {color: theme.colors.text, fontSize: scale(theme.typography.heading), fontWeight: '700' as const},
  description: {color: theme.colors.textMuted, fontSize: scale(theme.typography.body), lineHeight: scale(23)},
});

export const useStyles = () => useThemedStyles(createStyles);
