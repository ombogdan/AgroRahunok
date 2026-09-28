import {useThemedStyles} from '../../../theme';
import type {AppTheme, Scale} from '../../../theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  overlay: {flex: 1, justifyContent: 'flex-end' as const},
  backdrop: {position: 'absolute' as const, top: 0, right: 0, bottom: 0, left: 0,
    backgroundColor: theme.colors.scrim},
  sheet: {backgroundColor: theme.colors.surface, borderTopLeftRadius: scale(20), borderTopRightRadius: scale(20),
    paddingTop: scale(8), paddingHorizontal: scale(20), gap: scale(12)},
  handle: {alignSelf: 'center' as const, width: scale(40), height: scale(5), borderRadius: scale(3),
    backgroundColor: theme.colors.border},
  title: {color: theme.colors.text, fontSize: scale(22), lineHeight: scale(28), fontWeight: '700' as const,
    marginTop: scale(8)},
  // The native calendar reports its own fixed width, so the sheet would pin it to the left edge.
  picker: {alignSelf: 'center' as const},
  buttons: {flexDirection: 'row' as const, gap: scale(12)},
  button: {flex: 1},
});

export const useStyles = () => useThemedStyles(createStyles);
