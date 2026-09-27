import {useStyles} from './page.styles';
import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import type {PropsWithChildren} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BackButton} from '../back-button/back-button.component';

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  withHeader?: boolean;
  onBack?: () => void;
}>;


export function Page({title, subtitle, withHeader = false, onBack, children}: Props) {
  const styles = useStyles();
  return (
    <SafeAreaView
      style={styles.safe}
      edges={withHeader ? ['left', 'right', 'bottom'] : ['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        {onBack && <BackButton onPress={onBack} />}
        <Text style={styles.title} accessibilityRole="header">{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive" automaticallyAdjustKeyboardInsets>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
