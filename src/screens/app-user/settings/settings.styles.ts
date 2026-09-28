import {useThemedStyles} from '../../../shared/theme';
import type {AppTheme, Scale} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  label: {color: theme.colors.textMuted, fontSize: scale(theme.typography.small)},
  title: {color: theme.colors.text, fontSize: scale(theme.typography.heading), fontWeight: '700' as const},
  description: {color: theme.colors.textMuted, fontSize: scale(theme.typography.body), lineHeight: scale(23)},
  languageList: {flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: scale(8), marginTop: scale(12)},
  languageOption: {paddingHorizontal: scale(14), paddingVertical: scale(10), borderRadius: scale(18),
    borderWidth: scale(1), borderColor: theme.colors.border, backgroundColor: theme.colors.surface},
  languageSelected: {borderColor: theme.colors.primary, backgroundColor: theme.colors.primary},
  languageText: {color: theme.colors.text, fontSize: scale(theme.typography.body)},
  languageTextSelected: {color: theme.colors.onPrimary},
});

export const useStyles = () => useThemedStyles(createStyles);
