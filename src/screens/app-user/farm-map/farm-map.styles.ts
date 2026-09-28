import {useThemedStyles} from '../../../shared/theme';
import type {AppTheme, Scale} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  safe: {flex: 1, backgroundColor: theme.colors.surface},
  top: {paddingHorizontal: scale(20), paddingBottom: scale(12), gap: scale(4), backgroundColor: theme.colors.surface},
  hint: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(20)},
  map: {flex: 1},
  // Plot names on the satellite image: a small pill that stays readable over any ground.
  label: {maxWidth: scale(180), paddingHorizontal: scale(10), paddingVertical: scale(4), borderRadius: scale(999),
    backgroundColor: theme.colors.surface, borderWidth: scale(1), borderColor: theme.colors.border},
  labelSelected: {backgroundColor: theme.colors.primary, borderColor: theme.colors.primary},
  labelText: {color: theme.colors.text, fontSize: scale(14), fontWeight: '700' as const},
  labelTextSelected: {color: theme.colors.onPrimary},
  card: {position: 'absolute' as const, left: scale(16), right: scale(16), bottom: scale(16), gap: scale(8),
    padding: scale(18), borderRadius: scale(20), backgroundColor: theme.colors.surface,
    shadowColor: '#000000', shadowOpacity: 0.2, shadowRadius: scale(12), shadowOffset: {width: 0, height: scale(4)},
    elevation: scale(6)},
  cardHeader: {flexDirection: 'row' as const, alignItems: 'flex-start' as const, gap: scale(8)},
  cardTitle: {flex: 1, color: theme.colors.text, fontSize: scale(22), lineHeight: scale(28), fontWeight: '700' as const},
  close: {width: scale(36), height: scale(36), alignItems: 'center' as const, justifyContent: 'center' as const},
  meta: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(20)},
  crop: {color: theme.colors.primary, fontSize: scale(17), lineHeight: scale(22), fontWeight: '600' as const},
  moneyRow: {flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'baseline' as const,
    gap: scale(12)},
  moneyLabel: {color: theme.colors.textMuted, fontSize: scale(15)},
  moneyValue: {color: theme.colors.text, fontSize: scale(17), fontWeight: '600' as const},
});

export const useStyles = () => useThemedStyles(createStyles);
