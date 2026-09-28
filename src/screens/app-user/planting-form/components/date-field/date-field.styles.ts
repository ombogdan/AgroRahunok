import {useThemedStyles} from '../../../../../shared/theme';
import type {AppTheme, Scale} from '../../../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  field: {gap: scale(8)},
  label: {color: theme.colors.textMuted, fontSize: scale(15), fontWeight: '600' as const},
  row: {flexDirection: 'row' as const, alignItems: 'center' as const, gap: scale(8)},
  input: {flex: 1, minHeight: scale(56), paddingHorizontal: scale(16), borderRadius: scale(12), borderWidth: scale(1),
    borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt, flexDirection: 'row' as const,
    alignItems: 'center' as const, justifyContent: 'space-between' as const, gap: scale(12)},
  pressed: {opacity: 0.8},
  value: {flex: 1, color: theme.colors.text, fontSize: scale(19)},
  placeholder: {flex: 1, color: theme.colors.textMuted, fontSize: scale(19)},
  clear: {width: scale(44), height: scale(44), alignItems: 'center' as const, justifyContent: 'center' as const},
  hint: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(20)},
});

export const useStyles = () => useThemedStyles(createStyles);
