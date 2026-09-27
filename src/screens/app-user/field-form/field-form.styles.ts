import {useThemedStyles} from '../../../shared/theme';
import type {AppTheme, Scale} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  safe: {flex: 1, backgroundColor: theme.colors.background},
  header: {paddingHorizontal: scale(20), paddingBottom: scale(12), backgroundColor: theme.colors.background},
  content: {paddingHorizontal: scale(20), paddingTop: scale(8), paddingBottom: scale(28), gap: scale(18)},
  title: {color: theme.colors.text, fontSize: scale(34), fontWeight: '700' as const, lineHeight: scale(41)},
  section: {gap: scale(14), padding: scale(18), borderRadius: scale(20), borderWidth: scale(1),
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface},
  label: {color: theme.colors.text, fontSize: scale(17), fontWeight: '600' as const},
  input: {minHeight: scale(58), paddingHorizontal: scale(16), borderRadius: scale(12), borderWidth: scale(1),
    borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt,
    color: theme.colors.text, fontSize: scale(19)},
  dimensions: {flexDirection: 'row' as const, alignItems: 'center' as const, gap: scale(10)},
  dimensionInput: {flex: 1},
  times: {color: theme.colors.textMuted, fontSize: scale(22), fontWeight: '600' as const},
  chips: {flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: scale(8)},
  note: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(21)},
  calcLine: {borderRadius: scale(12), paddingVertical: scale(12), paddingHorizontal: scale(16), backgroundColor: theme.colors.accentSoft},
  calcText: {color: theme.colors.accentInk, fontSize: scale(17), fontWeight: '700' as const},
  radio: {padding: scale(16), borderRadius: scale(20), borderWidth: scale(2), borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface, gap: scale(4)},
  radioSelected: {borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft},
  radioTitle: {color: theme.colors.text, fontSize: scale(17), fontWeight: '600' as const},
  radioValue: {color: theme.colors.textMuted, fontSize: scale(15)},
  save: {marginTop: scale(2)},
  keyboardBar: {flexDirection: 'row' as const, justifyContent: 'flex-end' as const, paddingHorizontal: scale(12),
    backgroundColor: theme.colors.surface, borderTopWidth: scale(1), borderTopColor: theme.colors.border},
  keyboardDone: {minHeight: scale(44), paddingHorizontal: scale(8), justifyContent: 'center' as const},
  keyboardDoneText: {color: theme.colors.primary, fontSize: scale(17), fontWeight: '600' as const},
});

export const useStyles = () => useThemedStyles(createStyles);
