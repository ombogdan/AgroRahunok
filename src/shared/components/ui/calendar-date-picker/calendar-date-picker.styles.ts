import {useThemedStyles} from '../../../theme';
import type {AppTheme, Scale} from '../../../theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  overlay: {flex: 1, justifyContent: 'center' as const, paddingHorizontal: scale(18)},
  backdrop: {position: 'absolute' as const, top: 0, right: 0, bottom: 0, left: 0,
    backgroundColor: theme.colors.scrim},
  card: {backgroundColor: theme.colors.surface, borderRadius: scale(24), padding: scale(18),
    borderWidth: scale(1), borderColor: theme.colors.border, gap: scale(12)},
  heading: {flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const},
  title: {color: theme.colors.text, fontSize: scale(22), fontWeight: '700' as const},
  close: {width: scale(44), height: scale(44), alignItems: 'center' as const, justifyContent: 'center' as const},
  closeText: {color: theme.colors.textMuted, fontSize: scale(22)},
  monthRow: {flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const},
  arrow: {width: scale(44), height: scale(44), borderRadius: scale(12), backgroundColor: theme.colors.primarySoft,
    alignItems: 'center' as const, justifyContent: 'center' as const},
  arrowText: {color: theme.colors.primary, fontSize: scale(30)},
  month: {color: theme.colors.text, fontSize: scale(18), fontWeight: '700' as const, textTransform: 'capitalize' as const},
  yearRow: {flexDirection: 'row' as const, justifyContent: 'center' as const, gap: scale(12)},
  yearButton: {minHeight: scale(40), paddingHorizontal: scale(16), borderRadius: scale(12),
    backgroundColor: theme.colors.surfaceAlt, alignItems: 'center' as const, justifyContent: 'center' as const},
  yearText: {color: theme.colors.primary, fontSize: scale(15), fontWeight: '600' as const},
  grid: {flexDirection: 'row' as const, flexWrap: 'wrap' as const},
  dayCell: {width: '14.2857%' as const, height: scale(44), alignItems: 'center' as const,
    justifyContent: 'center' as const},
  weekday: {color: theme.colors.textMuted, fontSize: scale(13), fontWeight: '600' as const},
  dayButton: {width: scale(40), height: scale(40), borderRadius: scale(20),
    alignItems: 'center' as const, justifyContent: 'center' as const},
  daySelected: {backgroundColor: theme.colors.primary},
  dayText: {color: theme.colors.text, fontSize: scale(17)},
  daySelectedText: {color: theme.colors.onPrimary, fontWeight: '700' as const},
  todayButton: {minHeight: scale(48), borderRadius: scale(14), backgroundColor: theme.colors.primarySoft,
    alignItems: 'center' as const, justifyContent: 'center' as const},
  todayText: {color: theme.colors.primary, fontSize: scale(17), fontWeight: '700' as const},
});

export const useStyles = () => useThemedStyles(createStyles);
