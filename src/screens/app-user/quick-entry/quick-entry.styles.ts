import {useThemedStyles} from '../../../shared/theme';
import type {AppTheme} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme) => ({
  choices: {flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: theme.spacing.sm},
  choice: {
    minHeight: 48,
    borderRadius: theme.radii.full,
    paddingHorizontal: theme.spacing.md,
    justifyContent: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  choiceActive: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary,
  },
  choiceText: {color: theme.colors.text, fontSize: theme.typography.small, fontWeight: '600' as const},
  input: {
    minHeight: 52,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.body,
  },
});

export const useStyles = () => useThemedStyles(createStyles);
