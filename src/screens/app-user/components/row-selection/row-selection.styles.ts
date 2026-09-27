import {useThemedStyles} from '../../../../shared/theme';
import type {AppTheme, Scale} from '../../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  section: {gap: scale(10)},
  label: {color: theme.colors.text, fontSize: scale(17), fontWeight: '600' as const},
  chips: {flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: scale(8)},
  note: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(20)},
});

export const useStyles = () => useThemedStyles(createStyles);
