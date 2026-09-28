import {useThemedStyles} from '../../../../../shared/theme';
import type {AppTheme, Scale} from '../../../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  title: {color: theme.colors.text, fontSize: scale(22), lineHeight: scale(28), fontWeight: '700' as const},
  hint: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(21)},
  row: {minHeight: scale(56), flexDirection: 'row' as const, alignItems: 'center' as const, gap: scale(12),
    borderTopWidth: scale(1), borderTopColor: theme.colors.border, paddingTop: scale(12)},
  pressed: {opacity: 0.7},
  season: {width: scale(52), color: theme.colors.text, fontSize: scale(19), fontWeight: '700' as const,
    alignSelf: 'flex-start' as const},
  body: {flex: 1, gap: scale(4), alignItems: 'flex-start' as const},
  crop: {color: theme.colors.text, fontSize: scale(17), lineHeight: scale(22), fontWeight: '600' as const},
  cropMissing: {color: theme.colors.textMuted, fontSize: scale(17), lineHeight: scale(22), fontStyle: 'italic' as const},
  badge: {borderRadius: scale(999), paddingHorizontal: scale(10), paddingVertical: scale(3),
    backgroundColor: theme.colors.primarySoft},
  badgeText: {color: theme.colors.primary, fontSize: scale(13), fontWeight: '700' as const},
  badgePlanned: {backgroundColor: theme.colors.accentSoft},
  badgePlannedText: {color: theme.colors.accentInk},
  detail: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(20)},
  warning: {flexDirection: 'row' as const, alignItems: 'center' as const, gap: scale(6)},
  warningText: {flexShrink: 1, color: theme.colors.warning, fontSize: scale(15), lineHeight: scale(20),
    fontWeight: '600' as const},
});

export const useStyles = () => useThemedStyles(createStyles);
