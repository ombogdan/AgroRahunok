import {useThemedStyles} from '../../../shared/theme';
import type {AppTheme, Scale} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  choices: {flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: scale(theme.spacing.sm)},
  choice: {
    minHeight: scale(48),
    borderRadius: scale(theme.radii.full),
    paddingHorizontal: scale(theme.spacing.md),
    justifyContent: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: scale(1),
  },
  choiceActive: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary,
  },
  choiceText: {color: theme.colors.text, fontSize: scale(theme.typography.small), fontWeight: '600' as const},
  input: {
    minHeight: scale(52),
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    borderWidth: scale(1),
    borderColor: theme.colors.border,
    borderRadius: scale(theme.radii.md),
    paddingHorizontal: scale(theme.spacing.md),
    fontSize: scale(theme.typography.body),
  },
});

export const useStyles = () => useThemedStyles(createStyles);
