import React from 'react';
import {Pressable, Text} from 'react-native';
import {useThemedStyles} from '../../theme';
import type {AppTheme} from '../../theme/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'quiet';
  disabled?: boolean;
};

const createStyles = (theme: AppTheme) => ({
  button: {
    minHeight: 52,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderRadius: theme.radii.md,
  },
  primary: {backgroundColor: theme.colors.primary},
  secondary: {
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quiet: {backgroundColor: theme.colors.surfaceAlt},
  disabled: {opacity: 0.5},
  primaryText: {color: theme.colors.onPrimary},
  secondaryText: {color: theme.colors.primary},
  quietText: {color: theme.colors.text},
  label: {fontSize: theme.typography.body, fontWeight: '700' as const},
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
        pressed && !disabled && {opacity: 0.82},
      ]}>
      <Text style={[styles.label, styles[`${variant}Text`]]}>{label}</Text>
    </Pressable>
  );
}
