import {useThemedStyles} from '../../../../../shared/theme';
import type {AppTheme, Scale} from '../../../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  title: {color: theme.colors.text, fontSize: scale(22), lineHeight: scale(28), fontWeight: '700' as const},
  muted: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(21)},
  row: {minHeight: scale(64), borderTopWidth: scale(1), borderTopColor: theme.colors.border,
    flexDirection: 'row' as const, alignItems: 'center' as const, gap: scale(12)},
  number: {width: scale(54), color: theme.colors.primary, fontSize: scale(20), fontWeight: '700' as const},
  body: {flex: 1, gap: scale(2)},
  variety: {color: theme.colors.text, fontSize: scale(17), fontWeight: '600' as const},
});

export const useStyles = () => useThemedStyles(createStyles);
