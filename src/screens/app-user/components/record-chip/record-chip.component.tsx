import React from 'react';
import {Pressable, Text} from 'react-native';
import {useStyles} from './record-chip.styles';

export function Chip({label, selected, onPress}: {label: string; selected: boolean; onPress: () => void}) {
  const styles = useStyles();
  return <Pressable accessibilityRole="button" accessibilityState={{selected}} onPress={onPress}
    style={[styles.chip, selected && styles.selected]}>
    <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
  </Pressable>;
}
