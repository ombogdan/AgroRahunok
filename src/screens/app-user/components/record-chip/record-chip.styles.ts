import {useThemedStyles} from '../../../../shared/theme';
import type {AppTheme, Scale} from '../../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  chip: {minHeight: scale(44), paddingHorizontal: scale(16), borderRadius: scale(999), borderWidth: scale(2),
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface, justifyContent: 'center' as const},
  selected: {borderColor: theme.colors.primary, backgroundColor: theme.colors.primary},
  text: {color: theme.colors.text, fontSize: scale(17), fontWeight: '600' as const},
  selectedText: {color: theme.colors.onPrimary},
});

export const useStyles = () => useThemedStyles(createStyles);
