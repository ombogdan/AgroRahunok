import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import type {PropsWithChildren} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useThemedStyles} from '../../theme';
import type {AppTheme} from '../../theme/theme';
import {BackButton} from './BackButton';

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  withHeader?: boolean;
  onBack?: () => void;
}>;

const createStyles = (theme: AppTheme) => ({
  safe: {flex: 1, backgroundColor: theme.colors.background},
  // The header stays put while only the content below it scrolls.
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.title,
    lineHeight: 41,
    fontWeight: '700' as const,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 24,
  },
});

export function Page({title, subtitle, withHeader = false, onBack, children}: Props) {
  const styles = useThemedStyles(createStyles);
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
