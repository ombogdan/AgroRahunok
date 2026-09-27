import {useThemedStyles} from '../../../theme';
import type {AppTheme, Scale} from '../../../theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  // The chevron has empty space on its left, so pull it to the screen edge like the iOS back button.
  button: {minHeight: scale(44), flexDirection: 'row' as const, alignItems: 'center' as const,
    alignSelf: 'flex-start' as const, gap: scale(2), marginLeft: scale(-8), paddingRight: scale(12)},
  pressed: {opacity: 0.6},
  label: {color: theme.colors.primary, fontSize: scale(17), lineHeight: scale(22)},
});

export const useStyles = () => useThemedStyles(createStyles);
