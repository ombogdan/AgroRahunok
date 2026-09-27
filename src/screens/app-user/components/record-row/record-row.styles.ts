import {useThemedStyles} from '../../../../shared/theme';
import type {AppTheme, Scale} from '../../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  row: {minHeight: scale(72), flexDirection: 'row' as const, alignItems: 'center' as const, gap: scale(12), paddingVertical: scale(12)},
  divider: {borderTopWidth: scale(1), borderTopColor: theme.colors.border},
  circle: {width: scale(44), height: scale(44), borderRadius: scale(22), backgroundColor: theme.colors.primarySoft,
    alignItems: 'center' as const, justifyContent: 'center' as const},
  body: {flex: 1, gap: scale(2)},
  title: {color: theme.colors.text, fontSize: scale(17), fontWeight: '600' as const},
  detail: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(20)},
  expense: {color: theme.colors.text, fontSize: scale(17), fontWeight: '600' as const},
  income: {color: theme.colors.primary, fontSize: scale(17), fontWeight: '600' as const},
  quantity: {color: theme.colors.text, fontSize: scale(17), fontWeight: '600' as const},
});

export const useStyles = () => useThemedStyles(createStyles);
