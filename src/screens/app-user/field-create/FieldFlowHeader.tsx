import React from 'react';
import {Text, View} from 'react-native';
import {BackButton} from '../../../shared/components/ui';
import {useThemedStyles} from '../../../shared/theme';
import type {AppTheme} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme) => ({
  row: {minHeight: 52, flexDirection: 'row' as const, alignItems: 'center' as const},
  // Equal side slots keep the title centred whatever the back label is.
  side: {flex: 1},
  title: {flexShrink: 1, textAlign: 'center' as const, color: theme.colors.text, fontSize: 17, fontWeight: '600' as const},
});

export function FieldFlowHeader({backLabel = 'Назад', title, onBack}: {
  backLabel?: string; title?: string; onBack: () => void;
}) {
  const styles = useThemedStyles(createStyles);
  return <View style={styles.row}>
    <View style={styles.side}><BackButton label={backLabel} onPress={onBack} /></View>
    {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : null}
    <View style={styles.side} />
  </View>;
}
