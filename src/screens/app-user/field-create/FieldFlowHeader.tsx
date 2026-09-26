import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {useThemedStyles} from '../../../shared/theme';
import type {AppTheme} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme) => ({
  row: {minHeight: 52, flexDirection: 'row' as const, alignItems: 'center' as const},
  back: {minHeight: 44, justifyContent: 'center' as const, paddingRight: 16},
  backText: {color: theme.colors.primary, fontSize: 17},
  title: {flex: 1, textAlign: 'center' as const, color: theme.colors.text, fontSize: 17, fontWeight: '600' as const},
  spacer: {width: 76},
});

export function FieldFlowHeader({backLabel = 'Назад', title, onBack}: {
  backLabel?: string; title?: string; onBack: () => void;
}) {
  const styles = useThemedStyles(createStyles);
  return <View style={styles.row}>
    <Pressable accessibilityRole="button" onPress={onBack} style={styles.back}>
      <Text style={styles.backText}>‹ {backLabel}</Text>
    </Pressable>
    <Text style={styles.title}>{title}</Text>
    <View style={styles.spacer} />
  </View>;
}
