import {useThemedStyles} from '../../../theme';
import type {AppTheme, Scale} from '../../../theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  input: {minHeight: scale(58), paddingHorizontal: scale(16), borderRadius: scale(12), borderWidth: scale(1),
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface,
    color: theme.colors.text, fontSize: scale(19)},
  inputOpen: {borderBottomLeftRadius: scale(0), borderBottomRightRadius: scale(0), borderColor: theme.colors.primary},
  // The list sits in the flow under the field instead of floating, so it works inside any ScrollView.
  list: {borderWidth: scale(1), borderTopWidth: scale(0), borderColor: theme.colors.primary, borderBottomLeftRadius: scale(12),
    borderBottomRightRadius: scale(12), backgroundColor: theme.colors.surface, overflow: 'hidden' as const},
  option: {minHeight: scale(48), paddingHorizontal: scale(16), justifyContent: 'center' as const},
  divider: {borderTopWidth: scale(1), borderTopColor: theme.colors.border},
  optionText: {color: theme.colors.text, fontSize: scale(17)},
});

export const useStyles = () => useThemedStyles(createStyles);
