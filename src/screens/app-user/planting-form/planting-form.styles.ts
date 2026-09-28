import {useThemedStyles} from '../../../shared/theme';
import type {AppTheme, Scale} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  section: {gap: scale(14), padding: scale(18), borderRadius: scale(20), borderWidth: scale(1),
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface},
  label: {color: theme.colors.text, fontSize: scale(17), fontWeight: '600' as const},
  note: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(21)},
  error: {color: theme.colors.danger, fontSize: scale(15), lineHeight: scale(20)},
  warning: {flexDirection: 'row' as const, alignItems: 'flex-start' as const, gap: scale(8), padding: scale(12),
    borderRadius: scale(12), backgroundColor: theme.colors.accentSoft},
  warningText: {flex: 1, color: theme.colors.accentInk, fontSize: scale(15), lineHeight: scale(20), fontWeight: '600' as const},
  numberField: {minHeight: scale(64), borderRadius: scale(12), borderWidth: scale(1), borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt, flexDirection: 'row' as const, alignItems: 'center' as const,
    paddingHorizontal: scale(16), gap: scale(8)},
  numberInput: {flex: 1, color: theme.colors.text, fontSize: scale(28), fontWeight: '700' as const, paddingVertical: scale(8)},
  suffix: {color: theme.colors.textMuted, fontSize: scale(20), fontWeight: '600' as const},
  input: {minHeight: scale(58), paddingHorizontal: scale(16), borderRadius: scale(12), borderWidth: scale(1),
    borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt, color: theme.colors.text,
    fontSize: scale(19)},
  noteInput: {minHeight: scale(88), paddingTop: scale(14), textAlignVertical: 'top' as const},
  keyboardBar: {flexDirection: 'row' as const, justifyContent: 'flex-end' as const, paddingHorizontal: scale(12),
    backgroundColor: theme.colors.surface, borderTopWidth: scale(1), borderTopColor: theme.colors.border},
  keyboardDone: {minHeight: scale(44), paddingHorizontal: scale(8), justifyContent: 'center' as const},
  keyboardDoneText: {color: theme.colors.primary, fontSize: scale(17), fontWeight: '600' as const},
});

export const useStyles = () => useThemedStyles(createStyles);
