import {useThemedStyles} from '../../../../shared/theme';
import type {AppTheme, Scale} from '../../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  scrim: {flex: 1, backgroundColor: theme.colors.scrim, justifyContent: 'flex-end' as const},
  sheet: {backgroundColor: theme.colors.surface, borderTopLeftRadius: scale(20), borderTopRightRadius: scale(20),
    paddingTop: scale(8), paddingHorizontal: scale(20), gap: scale(12)},
  handle: {alignSelf: 'center' as const, width: scale(40), height: scale(5), borderRadius: scale(3), backgroundColor: theme.colors.border},
  title: {color: theme.colors.text, fontSize: scale(22), lineHeight: scale(28), fontWeight: '700' as const, marginTop: scale(8)},
  option: {minHeight: scale(76), borderRadius: scale(20), paddingHorizontal: scale(14), flexDirection: 'row' as const,
    alignItems: 'center' as const, gap: scale(14), backgroundColor: theme.colors.background},
  disabled: {opacity: 0.45},
  repeat: {borderWidth: scale(2), borderColor: theme.colors.primarySoft},
  circle: {width: scale(52), height: scale(52), borderRadius: scale(26), backgroundColor: theme.colors.primarySoft,
    alignItems: 'center' as const, justifyContent: 'center' as const},
  body: {flex: 1, gap: scale(2)},
  optionTitle: {color: theme.colors.text, fontSize: scale(19), fontWeight: '600' as const},
  optionDetail: {color: theme.colors.textMuted, fontSize: scale(15)},
});

export const useStyles = () => useThemedStyles(createStyles);
