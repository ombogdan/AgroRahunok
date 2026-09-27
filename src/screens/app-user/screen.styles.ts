import {useThemedStyles} from '../../shared/theme';
import type {AppTheme, Scale} from '../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  sectionTitle: {
    color: theme.colors.text,
    fontSize: scale(theme.typography.heading),
    fontWeight: '700' as const,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: scale(theme.typography.small),
  },
  body: {
    color: theme.colors.text,
    fontSize: scale(theme.typography.body),
    lineHeight: scale(24),
  },
  muted: {
    color: theme.colors.textMuted,
    fontSize: scale(theme.typography.body),
    lineHeight: scale(23),
  },
  metric: {
    color: theme.colors.text,
    fontSize: scale(theme.typography.metric),
    fontWeight: '700' as const,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: scale(theme.spacing.md),
  },
  group: {gap: scale(theme.spacing.md)},
  divider: {height: scale(1), backgroundColor: theme.colors.border},
  pill: {
    backgroundColor: theme.colors.primarySoft,
    borderRadius: scale(theme.radii.full),
    paddingHorizontal: scale(theme.spacing.md),
    paddingVertical: scale(theme.spacing.sm),
  },
  pillText: {
    color: theme.colors.primary,
    fontWeight: '700' as const,
    fontSize: scale(theme.typography.small),
  },
});

export const useScreenStyles = () => useThemedStyles(createStyles);
