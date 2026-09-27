import {useStyles} from './app-button.styles';
import React from 'react';
import {Pressable, Text} from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
  disabled?: boolean;
};


export function AppButton({
                            label,
                            onPress,
                            variant = 'primary',
                            disabled = false,
                          }: Props) {
  const styles = useStyles();
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
