import {useThemedStyles} from '../../../shared/theme';
import type {AppTheme, Scale} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  section: {gap: scale(14), padding: scale(18), borderRadius: scale(20), borderWidth: scale(1),
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface},
  // Plain heading over the optional fields; the negative margin keeps it next to the card it names.
  detailsHeading: {color: theme.colors.textMuted, fontSize: scale(17), lineHeight: scale(22),
    fontWeight: '600' as const, marginTop: scale(8), marginBottom: -scale(8), paddingHorizontal: scale(4)},
  label: {color: theme.colors.text, fontSize: scale(17), fontWeight: '600' as const},
  chips: {flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: scale(8)},
  input: {minHeight: scale(58), paddingHorizontal: scale(16), borderRadius: scale(12), borderWidth: scale(1),
    borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt,
    color: theme.colors.text, fontSize: scale(19)},
  amount: {fontSize: scale(28), fontWeight: '700' as const},
  note: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(21)},
  error: {color: theme.colors.danger, fontSize: scale(15)},
  keyboardBar: {flexDirection: 'row' as const, justifyContent: 'flex-end' as const,
    paddingHorizontal: scale(12), backgroundColor: theme.colors.surface,
    borderTopWidth: scale(1), borderTopColor: theme.colors.border},
  keyboardDone: {minHeight: scale(44), paddingHorizontal: scale(8), justifyContent: 'center' as const},
  keyboardDoneText: {color: theme.colors.primary, fontSize: scale(17), fontWeight: '600' as const},
});

export const useStyles = () => useThemedStyles(createStyles);
