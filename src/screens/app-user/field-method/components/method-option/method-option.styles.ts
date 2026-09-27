import {useThemedStyles} from '../../../../../shared/theme';
import type {AppTheme, Scale} from '../../../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  tile: {minHeight: scale(112), padding: scale(16), flexDirection: 'row' as const, alignItems: 'center' as const,
    gap: scale(16), backgroundColor: theme.colors.surface, borderColor: theme.colors.border,
    borderWidth: scale(1), borderRadius: scale(20)},
  icon: {width: scale(56), height: scale(56), borderRadius: scale(28), backgroundColor: theme.colors.primarySoft,
    alignItems: 'center' as const, justifyContent: 'center' as const},
  body: {flex: 1, gap: scale(3)},
  title: {color: theme.colors.text, fontSize: scale(21), fontWeight: '600' as const},
  detail: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(21)},
});

export const useStyles = () => useThemedStyles(createStyles);
