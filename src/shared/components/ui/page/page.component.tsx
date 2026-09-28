import {useStyles} from './page.styles';
import React from 'react';
import {KeyboardAvoidingView, Platform, ScrollView, Text, View} from 'react-native';
import type {PropsWithChildren, ReactNode} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BackButton} from '../back-button/back-button.component';

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  withHeader?: boolean;
  onBack?: () => void;
  footer?: ReactNode;
}>;


export function Page({title, subtitle, withHeader = false, onBack, footer, children}: Props) {
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
      <KeyboardAvoidingView style={styles.body} behavior={footer && Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive" automaticallyAdjustKeyboardInsets={!footer}>
          {children}
        </ScrollView>
        {footer && <View style={styles.footer}>{footer}</View>}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
