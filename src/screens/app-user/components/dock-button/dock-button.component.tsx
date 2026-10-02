import {useStyles} from './dock-button.styles';
import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {AppIcon} from '../../../../shared/components/ui';
import {useTheme} from '../../../../shared/theme';

type Props = { title: string; onPress: () => void };

// The dock's main action: a large plus in a circle next to the label.
export function DockButton({title, onPress}: Props) {
  const styles = useStyles();
  const {theme, isDark} = useTheme();

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress}
               style={({pressed}) => [styles.button, !isDark && styles.shadow, pressed && styles.pressed]}>
      <View style={styles.plus}>
        <AppIcon name="plus" color={theme.colors.primary} size={24} strokeWidth={3}/>
      </View>
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
}
