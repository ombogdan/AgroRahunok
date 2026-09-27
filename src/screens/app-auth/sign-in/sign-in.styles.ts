import {useThemedStyles} from '../../../shared/theme';
import type {AppTheme, Scale} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  safe: {flex: 1, backgroundColor: theme.colors.background},
  content: {flexGrow: 1, padding: scale(20), justifyContent: 'center' as const, gap: scale(32)},
  brand: {gap: scale(16)},
  iconCircle: {
    width: scale(88), height: scale(88), borderRadius: scale(44),
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center' as const, justifyContent: 'center' as const,
  },
  title: {color: theme.colors.text, fontSize: scale(34), lineHeight: scale(41), fontWeight: '700' as const},
  subtitle: {color: theme.colors.textMuted, fontSize: scale(17), lineHeight: scale(24)},
  cardTitle: {color: theme.colors.text, fontSize: scale(22), lineHeight: scale(28), fontWeight: '700' as const},
  fine: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(20)},
  error: {color: theme.colors.danger, fontSize: scale(15), lineHeight: scale(20)},
});

export const useStyles = () => useThemedStyles(createStyles);
