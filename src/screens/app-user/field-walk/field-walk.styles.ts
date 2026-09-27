import {useThemedStyles} from '../../../shared/theme';
import type {AppTheme, Scale} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  safe: {flex: 1, backgroundColor: theme.colors.surface},
  top: {paddingHorizontal: scale(20), paddingBottom: scale(14), backgroundColor: theme.colors.surface},
  area: {color: theme.colors.text, fontSize: scale(32), fontWeight: '700' as const, marginTop: scale(2)},
  hint: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(20)},
  warning: {color: theme.colors.danger, fontSize: scale(15), lineHeight: scale(20), fontWeight: '600' as const},
  success: {color: theme.colors.primary, fontSize: scale(15), lineHeight: scale(20), fontWeight: '600' as const},
  map: {flex: 1},
  bottom: {padding: scale(20), gap: scale(12), backgroundColor: theme.colors.surface},
  row: {flexDirection: 'row' as const, gap: scale(12)},
  button: {flex: 1},
});

export const useStyles = () => useThemedStyles(createStyles);
