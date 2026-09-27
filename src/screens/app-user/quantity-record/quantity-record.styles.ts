import {useThemedStyles} from '../../../shared/theme';
import type {AppTheme, Scale} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  safe: {flex: 1, backgroundColor: theme.colors.background},
  header: {paddingHorizontal: scale(20), paddingBottom: scale(12), backgroundColor: theme.colors.background},
  title: {color: theme.colors.text, fontSize: scale(28), lineHeight: scale(34), fontWeight: '700' as const},
  content: {paddingHorizontal: scale(20), paddingTop: scale(8), paddingBottom: scale(32), gap: scale(24)},
  section: {gap: scale(10)},
  label: {color: theme.colors.text, fontSize: scale(17), fontWeight: '600' as const},
  chips: {flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: scale(8)},
  input: {minHeight: scale(58), paddingHorizontal: scale(16), borderRadius: scale(12), borderWidth: scale(1),
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface,
    color: theme.colors.text, fontSize: scale(19)},
  inputLarge: {fontSize: scale(28), fontWeight: '700' as const},
  result: {borderRadius: scale(12), padding: scale(14), backgroundColor: theme.colors.accentSoft},
  resultText: {color: theme.colors.accentInk, fontSize: scale(17), fontWeight: '700' as const},
  note: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(21)},
  error: {color: theme.colors.danger, fontSize: scale(15), lineHeight: scale(20)},
  custom: {gap: scale(12), padding: scale(16), backgroundColor: theme.colors.surface, borderRadius: scale(20),
    borderWidth: scale(1), borderColor: theme.colors.border},
  keyboardBar: {flexDirection: 'row' as const, justifyContent: 'flex-end' as const,
    paddingHorizontal: scale(12), backgroundColor: theme.colors.surface,
    borderTopWidth: scale(1), borderTopColor: theme.colors.border},
  keyboardDone: {minHeight: scale(44), paddingHorizontal: scale(8), justifyContent: 'center' as const},
  keyboardDoneText: {color: theme.colors.primary, fontSize: scale(17), fontWeight: '600' as const},
});

export const useStyles = () => useThemedStyles(createStyles);
