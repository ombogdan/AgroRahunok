import {useThemedStyles} from '../../theme';
import type {AppTheme, Scale} from '../../theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  row: {minHeight: scale(52), flexDirection: 'row' as const, alignItems: 'center' as const},
  // Equal side slots keep the title centred whatever the back label is.
  side: {flex: 1},
  right: {flex: 1, alignItems: 'flex-end' as const},
  rightButton: {minHeight: scale(44), justifyContent: 'center' as const, paddingLeft: scale(12)},
  rightText: {color: theme.colors.primary, fontSize: scale(17)},
  title: {flexShrink: 1, textAlign: 'center' as const, color: theme.colors.text, fontSize: scale(17), fontWeight: '600' as const},
});

export const useStyles = () => useThemedStyles(createStyles);
