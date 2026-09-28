import {useThemedStyles} from '../../../../../shared/theme';
import type {AppTheme, Scale} from '../../../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  title: {color: theme.colors.text, fontSize: scale(22), lineHeight: scale(28), fontWeight: '700' as const},
  row: {flexDirection: 'row' as const, alignItems: 'baseline' as const, justifyContent: 'space-between' as const,
    flexWrap: 'wrap' as const, gap: scale(8)},
  label: {color: theme.colors.textMuted, fontSize: scale(17)},
  value: {color: theme.colors.text, fontSize: scale(17), fontWeight: '600' as const},
  result: {color: theme.colors.text, fontSize: scale(22), fontWeight: '700' as const},
  profit: {color: theme.colors.success},
  loss: {color: theme.colors.danger},
  hint: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(20)},
  subtitle: {color: theme.colors.text, fontSize: scale(17), fontWeight: '700' as const, marginTop: scale(4)},
  link: {minHeight: scale(44), alignItems: 'center' as const, justifyContent: 'center' as const},
  linkText: {color: theme.colors.primary, fontSize: scale(17), fontWeight: '600' as const},
});

export const useStyles = () => useThemedStyles(createStyles);
