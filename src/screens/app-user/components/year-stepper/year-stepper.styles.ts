import {useThemedStyles} from '../../../../shared/theme';
import type {AppTheme, Scale} from '../../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  row: {flexDirection: 'row' as const, alignItems: 'center' as const, gap: scale(12)},
  step: {width: scale(56), height: scale(56), borderRadius: scale(28), backgroundColor: theme.colors.primarySoft,
    alignItems: 'center' as const, justifyContent: 'center' as const},
  pressed: {opacity: 0.7},
  value: {flex: 1, alignItems: 'center' as const},
  year: {color: theme.colors.text, fontSize: scale(34), lineHeight: scale(41), fontWeight: '700' as const},
  relative: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(20)},
});

export const useStyles = () => useThemedStyles(createStyles);
