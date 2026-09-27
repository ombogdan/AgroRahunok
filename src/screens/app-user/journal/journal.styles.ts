import {useThemedStyles} from '../../../shared/theme';
import type {AppTheme, Scale} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  filters: {gap: scale(8), paddingRight: scale(20)},
  chip: {minHeight: scale(44), paddingHorizontal: scale(15), borderRadius: scale(999), borderWidth: scale(2),
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface, justifyContent: 'center' as const},
  chipSelected: {borderColor: theme.colors.primary, backgroundColor: theme.colors.primary},
  chipText: {color: theme.colors.text, fontSize: scale(17), fontWeight: '600' as const},
  chipTextSelected: {color: theme.colors.onPrimary},
  group: {gap: scale(8)},
  day: {color: theme.colors.textMuted, fontSize: scale(15), fontWeight: '600' as const},
  // Rows carry their own padding and dividers, so the card has no inner gap.
  card: {backgroundColor: theme.colors.surface, borderWidth: scale(1), borderColor: theme.colors.border,
    borderRadius: scale(20), paddingHorizontal: scale(16)},
  cardShadow: {shadowColor: '#193327', shadowOpacity: 0.06, shadowRadius: scale(10), shadowOffset: {width: scale(0), height: scale(4)}, elevation: scale(2)},
  errorTitle: {color: theme.colors.text, fontSize: scale(22), fontWeight: '700' as const},
  muted: {color: theme.colors.textMuted, fontSize: scale(17), lineHeight: scale(24)},
});

export const useStyles = () => useThemedStyles(createStyles);
