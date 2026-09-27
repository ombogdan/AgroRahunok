import {useStyles} from './back-button.styles';
import React from 'react';
import {Pressable, Text} from 'react-native';
import {useScale, useTheme} from '../../../theme';
import {AppIcon} from '../app-icon/app-icon.component';


export function BackButton({label = 'Назад', onPress}: {label?: string; onPress: () => void}) {
  const styles = useStyles();
  const {theme} = useTheme();
  const scale = useScale();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} hitSlop={scale(8)} onPress={onPress}
    style={({pressed}) => [styles.button, pressed && styles.pressed]}>
    <AppIcon name="chevronLeft" color={theme.colors.primary} size={28} strokeWidth={2.4} />
    <Text style={styles.label}>{label}</Text>
  </Pressable>;
}
