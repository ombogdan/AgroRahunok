import {useThemedStyles} from '../../../../shared/theme';
import type {AppTheme, Scale} from '../../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  button: {minHeight: scale(62), paddingHorizontal: scale(20), paddingVertical: scale(8),
    borderRadius: scale(theme.radii.full), backgroundColor: theme.colors.primary, flexDirection: 'row' as const,
    alignItems: 'center' as const, justifyContent: 'center' as const, gap: scale(12)},
  // The design's lift under the dock button: 0 4px 14px rgba(38,115,77,.25), light theme only.
  shadow: {shadowColor: theme.colors.primary, shadowOpacity: 0.25, shadowRadius: scale(14),
    shadowOffset: {width: 0, height: scale(4)}, elevation: scale(4)},
  pressed: {backgroundColor: theme.colors.primaryPressed},
  plus: {width: scale(38), height: scale(38), borderRadius: scale(19), backgroundColor: theme.colors.onPrimary,
    alignItems: 'center' as const, justifyContent: 'center' as const},
  title: {flexShrink: 1, color: theme.colors.onPrimary, fontSize: scale(21), lineHeight: scale(26),
    fontWeight: '700' as const},
});

export const useStyles = () => useThemedStyles(createStyles);
