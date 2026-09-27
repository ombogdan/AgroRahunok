import {useThemedStyles} from '../../../shared/theme';
import type {AppTheme, Scale} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  chips: {flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: scale(8)},
  chip: {minHeight: scale(44), paddingHorizontal: scale(18), borderRadius: scale(999), borderWidth: scale(2),
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface, justifyContent: 'center' as const},
  chipSelected: {borderColor: theme.colors.primary, backgroundColor: theme.colors.primary},
  chipText: {color: theme.colors.text, fontSize: scale(17), fontWeight: '600' as const},
  chipTextSelected: {color: theme.colors.onPrimary},
  label: {color: theme.colors.textMuted, fontSize: scale(17), fontWeight: '600' as const},
  result: {color: theme.colors.text, fontSize: scale(40), lineHeight: scale(48), fontWeight: '700' as const},
  positive: {color: theme.colors.primary},
  negative: {color: theme.colors.danger},
  row: {flexDirection: 'row' as const, justifyContent: 'space-between' as const,
    alignItems: 'baseline' as const, gap: scale(8), flexWrap: 'wrap' as const},
  rowLabel: {color: theme.colors.textMuted, fontSize: scale(17)},
  rowValue: {color: theme.colors.text, fontSize: scale(19), fontWeight: '600' as const},
  sectionTitle: {color: theme.colors.text, fontSize: scale(22), fontWeight: '700' as const},
  note: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(21)},
  fieldName: {color: theme.colors.text, fontSize: scale(20), fontWeight: '700' as const},
});

export const useStyles = () => useThemedStyles(createStyles);
