import {useStyles} from './field-flow-header.styles';
import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {BackButton} from '../ui';
import {useScale} from '../../theme';


export function FieldFlowHeader({backLabel = 'Назад', title, onBack, rightLabel, onRight}: {
  backLabel?: string; title?: string; onBack: () => void; rightLabel?: string; onRight?: () => void;
}) {
  const styles = useStyles();
  const scale = useScale();
  return <View style={styles.row}>
    <View style={styles.side}><BackButton label={backLabel} onPress={onBack} /></View>
    {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : null}
    <View style={styles.right}>
      {rightLabel && onRight ? <Pressable accessibilityRole="button" hitSlop={scale(8)} onPress={onRight} style={styles.rightButton}>
        <Text style={styles.rightText} numberOfLines={1}>{rightLabel}</Text>
      </Pressable> : null}
    </View>
  </View>;
}
