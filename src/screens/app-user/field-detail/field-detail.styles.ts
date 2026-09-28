import {useThemedStyles} from '../../../shared/theme';
import type {AppTheme, Scale} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  label: {color: theme.colors.textMuted, fontSize: scale(17), fontWeight: '600' as const},
  metric: {color: theme.colors.text, fontSize: scale(40), lineHeight: scale(48), fontWeight: '700' as const},
  row: {minHeight: scale(44), flexDirection: 'row' as const, alignItems: 'center' as const, flexWrap: 'wrap' as const,
    gap: scale(8), borderTopWidth: scale(1), borderTopColor: theme.colors.border, paddingTop: scale(10)},
  rowLabel: {flex: 1, color: theme.colors.textMuted, fontSize: scale(15)},
  rowValue: {color: theme.colors.text, fontSize: scale(17), fontWeight: '600' as const},
  badge: {borderRadius: scale(999), paddingHorizontal: scale(10), paddingVertical: scale(3), backgroundColor: theme.colors.primarySoft},
  badgeText: {color: theme.colors.primary, fontSize: scale(13), fontWeight: '700' as const},
  sectionTitle: {color: theme.colors.text, fontSize: scale(22), lineHeight: scale(28), fontWeight: '700' as const},
  hint: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(21)},
  note: {color: theme.colors.text, fontSize: scale(17), lineHeight: scale(24)},
});

export const useStyles = () => useThemedStyles(createStyles);
