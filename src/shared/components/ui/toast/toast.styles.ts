import {useThemedStyles} from '../../../theme';
import type {AppTheme, Scale} from '../../../theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  wrap: {position: 'absolute' as const, left: scale(16), right: scale(16)},
  // Inverted colours, as in the design: dark in the light theme and light in the dark one.
  toast: {minHeight: scale(60), borderRadius: scale(16), paddingHorizontal: scale(16), paddingVertical: scale(10),
    flexDirection: 'row' as const, alignItems: 'center' as const, gap: scale(10),
    backgroundColor: theme.colors.text},
  text: {flex: 1, color: theme.colors.background, fontSize: scale(17), lineHeight: scale(22)},
  action: {minHeight: scale(44), paddingHorizontal: scale(14), borderRadius: scale(999), borderWidth: scale(2),
    borderColor: theme.colors.background, justifyContent: 'center' as const},
  actionText: {color: theme.colors.background, fontSize: scale(17), fontWeight: '700' as const},
});

export const useStyles = () => useThemedStyles(createStyles);
