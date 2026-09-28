import {useThemedStyles} from '../../../shared/theme';
import type {AppTheme, Scale} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  safe: {flex: 1, backgroundColor: theme.colors.background},
  content: {paddingHorizontal: scale(20), paddingTop: scale(8), paddingBottom: scale(40), gap: scale(32)},
  heading: {
    gap: scale(4),
    paddingHorizontal: scale(20),
    paddingTop: scale(20),
    paddingBottom: scale(12),
    backgroundColor: theme.colors.background
  },
  headingTop: {
    minHeight: scale(48), flexDirection: 'row' as const, alignItems: 'center' as const,
    justifyContent: 'space-between' as const
  },
  settingsButton: {
    width: scale(48),
    height: scale(48),
    alignItems: 'center' as const,
    justifyContent: 'center' as const
  },
  date: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(20)},
  title: {color: theme.colors.text, fontSize: scale(34), lineHeight: scale(41), fontWeight: '700' as const},
  empty: {gap: scale(24), paddingVertical: scale(12)},
  iconCircle: {
    width: scale(112), height: scale(112), borderRadius: scale(56),
    backgroundColor: theme.colors.primarySoft, alignItems: 'center' as const, justifyContent: 'center' as const
  },
  emptyTitle: {color: theme.colors.text, fontSize: scale(28), lineHeight: scale(34), fontWeight: '700' as const},
  emptyText: {color: theme.colors.textMuted, fontSize: scale(17), lineHeight: scale(24)},
  hint: {color: theme.colors.textMuted, fontSize: scale(15), lineHeight: scale(20)},
  syncHint: {color: theme.colors.textMuted, fontSize: scale(14), lineHeight: scale(19)},
  summaryLabel: {color: theme.colors.textMuted, fontSize: scale(17), fontWeight: '600' as const},
  // «Уся земля» and the way to see it all on the map share one line.
  totalHeader: {flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const,
    gap: scale(12)},
  mapButton: {minHeight: scale(40), paddingHorizontal: scale(14), borderRadius: scale(999),
    backgroundColor: theme.colors.primarySoft, flexDirection: 'row' as const, alignItems: 'center' as const,
    gap: scale(6)},
  mapButtonText: {color: theme.colors.primary, fontSize: scale(15), fontWeight: '700' as const},
  totalRow: {flexDirection: 'row' as const, alignItems: 'baseline' as const, flexWrap: 'wrap' as const, gap: scale(8)},
  total: {color: theme.colors.text, fontSize: scale(40), lineHeight: scale(48), fontWeight: '700' as const},
  subTotal: {color: theme.colors.textMuted, fontSize: scale(17)},
  bar: {flexDirection: 'row' as const, gap: scale(3), height: scale(12)},
  segment: {minWidth: scale(10), borderRadius: scale(999)},
  // The plot's name and area share the first line; its crop button sits under the name.
  fieldRow: {
    minHeight: scale(44), borderTopWidth: scale(1), borderTopColor: theme.colors.border, paddingTop: scale(12),
    flexDirection: 'row' as const, alignItems: 'flex-start' as const, gap: scale(12)
  },
  dot: {width: scale(12), height: scale(12), borderRadius: scale(6), marginTop: scale(5)},
  rowBody: {flex: 1, gap: scale(8), alignItems: 'flex-start' as const},
  rowTitle: {color: theme.colors.text, fontSize: scale(17), lineHeight: scale(22), fontWeight: '600' as const},
  cropButton: {
    minHeight: scale(36), paddingHorizontal: scale(12), paddingVertical: scale(6), borderRadius: scale(999),
    backgroundColor: theme.colors.primarySoft, flexDirection: 'row' as const, alignItems: 'center' as const,
    gap: scale(6), maxWidth: '100%' as const
  },
  cropButtonPressed: {opacity: 0.7},
  cropButtonText: {flexShrink: 1, color: theme.colors.primary, fontSize: scale(15), lineHeight: scale(20),
    fontWeight: '600' as const},
  rowArea: {color: theme.colors.text, fontSize: scale(17), lineHeight: scale(22), fontWeight: '600' as const},
  seasonHeader: {
    flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const,
    flexWrap: 'wrap' as const, gap: scale(8)
  },
  seasonTitle: {color: theme.colors.textMuted, fontSize: scale(20), fontWeight: '600' as const},
  badge: {
    borderRadius: scale(999),
    paddingHorizontal: scale(12),
    paddingVertical: scale(5),
    backgroundColor: theme.colors.accentSoft
  },
  badgeText: {color: theme.colors.accentInk, fontSize: scale(15), fontWeight: '700' as const},
  moneyRow: {
    flexDirection: 'row' as const, alignItems: 'baseline' as const, justifyContent: 'space-between' as const,
    flexWrap: 'wrap' as const, gap: scale(8)
  },
  moneyLabel: {color: theme.colors.text, fontSize: scale(17)},
  moneyBig: {color: theme.colors.text, fontSize: scale(28), lineHeight: scale(34), fontWeight: '700' as const},
  moneyMuted: {color: theme.colors.textMuted, fontSize: scale(17)},
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const
  },
  sectionTitle: {color: theme.colors.text, fontSize: scale(22), lineHeight: scale(28), fontWeight: '700' as const},
  yearSection: {gap: scale(8)},
  yearLabel: {color: theme.colors.textMuted, fontSize: scale(17), fontWeight: '600' as const},
  link: {minHeight: scale(44), justifyContent: 'center' as const},
  linkText: {color: theme.colors.primary, fontSize: scale(17), fontWeight: '600' as const},
  recordsCard: {paddingVertical: scale(4)},
});

export const useStyles = () => useThemedStyles(createStyles);
