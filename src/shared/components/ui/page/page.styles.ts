import {useThemedStyles} from '../../../theme';
import type {AppTheme, Scale} from '../../../theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  safe: {flex: 1, backgroundColor: theme.colors.background},
  // The header stays put while only the content below it scrolls.
  header: {
    paddingHorizontal: scale(theme.spacing.lg),
    paddingTop: scale(theme.spacing.lg),
    paddingBottom: scale(theme.spacing.md),
    gap: scale(theme.spacing.sm),
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: scale(theme.spacing.lg),
    paddingTop: scale(theme.spacing.sm),
    paddingBottom: scale(theme.spacing.xxl),
    gap: scale(theme.spacing.lg),
  },
  title: {
    color: theme.colors.text,
    fontSize: scale(theme.typography.title),
    lineHeight: scale(41),
    fontWeight: '700' as const,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: scale(theme.typography.body),
    lineHeight: scale(24),
  },
});

export const useStyles = () => useThemedStyles(createStyles);
