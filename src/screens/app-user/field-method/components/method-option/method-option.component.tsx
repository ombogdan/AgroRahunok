import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {AppIcon} from '../../../../../shared/components/ui';
import type {AppIconName} from '../../../../../shared/components/ui/app-icon/app-icon.component';
import {useTheme} from '../../../../../shared/theme';
import {useStyles} from './method-option.styles';

type Props = {title: string; detail: string; icon: AppIconName; onPress: () => void};

export function MethodOption({title, detail, icon, onPress}: Props) {
  const styles = useStyles();
  const {theme} = useTheme();
  return <Pressable accessibilityRole="button" onPress={onPress} style={styles.tile}>
    <View style={styles.icon}><AppIcon name={icon} color={theme.colors.primary} size={28} /></View>
    <View style={styles.body}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.detail}>{detail}</Text>
    </View>
    <AppIcon name="chevronRight" color={theme.colors.textMuted} size={24} strokeWidth={2.2} />
  </Pressable>;
}
