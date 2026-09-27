import {useThemedStyles} from '../../../shared/theme';
import type {AppTheme, Scale} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  safe: {flex: 1, backgroundColor: theme.colors.background},
  header: {paddingHorizontal: scale(20), paddingBottom: scale(12), backgroundColor: theme.colors.background},
  content: {paddingHorizontal: scale(20), paddingTop: scale(6), paddingBottom: scale(40), gap: scale(18)},
  heading: {marginTop: scale(14), marginBottom: scale(6)},
  title: {color: theme.colors.text, fontSize: scale(34), lineHeight: scale(41), fontWeight: '700' as const},
  subtitle: {color: theme.colors.textMuted, fontSize: scale(17), lineHeight: scale(24), marginTop: scale(4)},
});

export const useStyles = () => useThemedStyles(createStyles);
