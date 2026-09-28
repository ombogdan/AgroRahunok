import {useThemedStyles} from '../../../../../shared/theme';
import type {AppTheme, Scale} from '../../../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  section: {gap: scale(14), padding: scale(18), borderRadius: scale(20), borderWidth: scale(1),
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface},
  label: {color: theme.colors.text, fontSize: scale(17), fontWeight: '600' as const},
  card: {gap: scale(10), padding: scale(14), borderRadius: scale(16), borderWidth: scale(1),
    borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt},
  header: {flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const},
  cardTitle: {color: theme.colors.textMuted, fontSize: scale(15), fontWeight: '700' as const},
  remove: {width: scale(36), height: scale(36), alignItems: 'center' as const, justifyContent: 'center' as const},
  input: {minHeight: scale(54), paddingHorizontal: scale(14), borderRadius: scale(12), borderWidth: scale(1),
    borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text,
    fontSize: scale(17)},
  areaRow: {flexDirection: 'row' as const, alignItems: 'center' as const, flexWrap: 'wrap' as const, gap: scale(8)},
  area: {flexGrow: 1, flexBasis: scale(110)},
  note: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(21)},
  error: {color: theme.colors.danger, fontSize: scale(15), lineHeight: scale(20)},
});

export const useStyles = () => useThemedStyles(createStyles);
