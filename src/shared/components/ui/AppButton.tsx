import React from 'react';
import {Pressable, Text} from 'react-native';
import {useThemedStyles} from '../../theme';
import type {AppTheme} from '../../theme/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
  disabled?: boolean;
};

const createStyles = (theme: AppTheme) => ({
  button: {
    minHeight: 56,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderRadius: theme.radii.full,
  },
  primary: {backgroundColor: theme.colors.primary},
  pressed: {backgroundColor: theme.colors.primaryPressed},
  secondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
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
  label: {fontSize: theme.typography.button, fontWeight: '600' as const},
});

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}: Props) {
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && variant === 'primary' && {backgroundColor: styles.pressed.backgroundColor},
        pressed && !disabled && variant !== 'primary' && {opacity: 0.82},
      ]}>
      <Text style={[styles.label, styles[`${variant}Text`]]}>{label}</Text>
    </Pressable>
  );
}
