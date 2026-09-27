import {useThemedStyles} from '../../../../../shared/theme';
import type {AppTheme, Scale} from '../../../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  title: {color: theme.colors.text, fontSize: scale(22), lineHeight: scale(28), fontWeight: '700' as const},
  muted: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(21)},
  label: {color: theme.colors.text, fontSize: scale(17), fontWeight: '600' as const},
  input: {minHeight: scale(56), paddingHorizontal: scale(16), borderRadius: scale(12), borderWidth: scale(1),
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface,
    color: theme.colors.text, fontSize: scale(19)},
  section: {gap: scale(10)},
  error: {color: theme.colors.danger, fontSize: scale(15)},
});

export const useStyles = () => useThemedStyles(createStyles);
