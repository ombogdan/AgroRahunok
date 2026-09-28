import {useThemedStyles} from '../../../../../shared/theme';
import type {AppTheme, Scale} from '../../../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  row: {minHeight: scale(56), flexDirection: 'row' as const, alignItems: 'center' as const, gap: scale(12),
    paddingVertical: scale(10)},
  divider: {borderTopWidth: scale(1), borderTopColor: theme.colors.border},
  pressed: {opacity: 0.7},
  body: {flex: 1, gap: scale(2)},
  kind: {color: theme.colors.textMuted, fontSize: scale(13), fontWeight: '700' as const},
  name: {color: theme.colors.text, fontSize: scale(17), lineHeight: scale(22), fontWeight: '600' as const},
  detail: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(20)},
  cost: {color: theme.colors.text, fontSize: scale(17), fontWeight: '600' as const},
});

export const useStyles = () => useThemedStyles(createStyles);
