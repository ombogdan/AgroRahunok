import {useStyles} from './page.styles';
import React, {useContext} from 'react';
import {KeyboardAvoidingView, Platform, ScrollView, Text, View} from 'react-native';
import type {PropsWithChildren, ReactNode} from 'react';
import {BottomTabBarHeightContext} from '@react-navigation/bottom-tabs';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {Edge} from 'react-native-safe-area-context';
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
  // On a tab the tab bar already keeps clear of the home indicator; a second bottom inset
  // would leave an empty band above the «Додати запис» dock.
  const inTabs = useContext(BottomTabBarHeightContext) !== undefined;
  const edges: Edge[] = ['left', 'right'];
  if (!withHeader) edges.push('top');
  if (!inTabs) edges.push('bottom');
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
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
