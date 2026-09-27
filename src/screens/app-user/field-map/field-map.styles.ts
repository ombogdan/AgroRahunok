import {useThemedStyles} from '../../../shared/theme';
import type {AppTheme, Scale} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  safe: {flex: 1, backgroundColor: theme.colors.surface},
  top: {paddingHorizontal: scale(20), paddingBottom: scale(14), backgroundColor: theme.colors.surface},
  area: {color: theme.colors.text, fontSize: scale(32), fontWeight: '700' as const, marginTop: scale(2)},
  hint: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(20)},
  map: {flex: 1},
  bottom: {
    padding: scale(20), flexDirection: 'row' as const, gap: scale(12),
    backgroundColor: theme.colors.surface
  },
  button: {flex: 1},
  locate: {
    position: 'absolute' as const, right: scale(20), bottom: scale(16), minHeight: scale(44),
    flexDirection: 'row' as const, alignItems: 'center' as const, gap: scale(6),
    paddingHorizontal: scale(16), borderRadius: scale(999), backgroundColor: theme.colors.surface,
    shadowColor: '#000000', shadowOpacity: 0.18, shadowRadius: scale(8), shadowOffset: {width: scale(0), height: scale(2)}, elevation: scale(3)
  },
  locateText: {color: theme.colors.text, fontSize: scale(15), fontWeight: '600' as const},
});

export const useStyles = () => useThemedStyles(createStyles);
