import {useThemedStyles} from '../../../../../shared/theme';
import type {AppTheme, Scale} from '../../../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  section: {gap: scale(14), padding: scale(18), borderRadius: scale(20), borderWidth: scale(1),
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface},
  label: {color: theme.colors.text, fontSize: scale(17), fontWeight: '600' as const},
  hint: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(20)},
  chips: {flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: scale(8)},
  totals: {gap: scale(4), borderRadius: scale(12), paddingVertical: scale(12), paddingHorizontal: scale(16),
    backgroundColor: theme.colors.accentSoft},
  total: {color: theme.colors.accentInk, fontSize: scale(17), fontWeight: '700' as const},
});

export const useStyles = () => useThemedStyles(createStyles);
