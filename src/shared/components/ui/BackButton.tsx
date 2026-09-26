import React from 'react';
import {Pressable, Text} from 'react-native';
import {useTheme, useThemedStyles} from '../../theme';
import type {AppTheme} from '../../theme/theme';
import {AppIcon} from './AppIcon';

const createStyles = (theme: AppTheme) => ({
  // The chevron has empty space on its left, so pull it to the screen edge like the iOS back button.
  button: {minHeight: 44, flexDirection: 'row' as const, alignItems: 'center' as const,
    alignSelf: 'flex-start' as const, gap: 2, marginLeft: -8, paddingRight: 12},
  pressed: {opacity: 0.6},
  label: {color: theme.colors.primary, fontSize: 17, lineHeight: 22},
});

export function BackButton({label = 'Назад', onPress}: {label?: string; onPress: () => void}) {
  const styles = useThemedStyles(createStyles);
  const {theme} = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} hitSlop={8} onPress={onPress}
    style={({pressed}) => [styles.button, pressed && styles.pressed]}>
    <AppIcon name="chevronLeft" color={theme.colors.primary} size={28} strokeWidth={2.4} />
    <Text style={styles.label}>{label}</Text>
  </Pressable>;
}
