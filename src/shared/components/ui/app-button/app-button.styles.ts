import {useThemedStyles} from '../../../theme';
import type {AppTheme, Scale} from '../../../theme/theme';

const createStyles = (theme: AppTheme, scale: Scale) => ({
  button: {
    minHeight: scale(56),
    paddingHorizontal: scale(theme.spacing.lg),
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderRadius: scale(theme.radii.full),
  },
  primary: {backgroundColor: theme.colors.primary},
  pressed: {backgroundColor: theme.colors.primaryPressed},
  secondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: scale(2),
    borderColor: theme.colors.border,
  },
  quiet: {backgroundColor: theme.colors.primarySoft},
  danger: {backgroundColor: theme.colors.danger},
  disabled: {opacity: 0.5},
  primaryText: {color: theme.colors.onPrimary},
  secondaryText: {color: theme.colors.primary},
  quietText: {color: theme.colors.primary},
  // onPrimary is white in the light theme and dark ink in the dark one, readable on both reds.
  dangerText: {color: theme.colors.onPrimary},
  label: {fontSize: scale(theme.typography.button), fontWeight: '600' as const, textAlign: 'center' as const},
});

export const useStyles = () => useThemedStyles(createStyles);
