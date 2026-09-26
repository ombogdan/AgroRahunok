import {useThemedStyles} from '../../shared/theme';
import type {AppTheme} from '../../shared/theme/theme';

const createStyles = (theme: AppTheme) => ({
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.heading,
    fontWeight: '700' as const,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
  },
  body: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: 24,
  },
  muted: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 23,
  },
  metric: {
    color: theme.colors.text,
    fontSize: theme.typography.metric,
    fontWeight: '700' as const,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: theme.spacing.md,
  },
  group: {gap: theme.spacing.md},
  divider: {height: 1, backgroundColor: theme.colors.border},
  pill: {
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radii.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  pillText: {
    color: theme.colors.primary,
    fontWeight: '700' as const,
    fontSize: theme.typography.small,
  },
});

export const useScreenStyles = () => useThemedStyles(createStyles);
