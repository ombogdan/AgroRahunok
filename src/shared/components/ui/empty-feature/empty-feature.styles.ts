import {useThemedStyles} from '../../../theme';
import type {AppTheme, Scale} from '../../../theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  circle: {
    width: scale(88), height: scale(88), borderRadius: scale(44),
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center' as const, justifyContent: 'center' as const,
  },
  title: {color: theme.colors.text, fontSize: scale(28), lineHeight: scale(34), fontWeight: '700' as const},
  detail: {color: theme.colors.textMuted, fontSize: scale(17), lineHeight: scale(24)},
  content: {gap: scale(20), paddingVertical: scale(16)},
});

export const useStyles = () => useThemedStyles(createStyles);
