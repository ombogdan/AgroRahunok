import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import type {PropsWithChildren} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useThemedStyles} from '../../theme';
import type {AppTheme} from '../../theme/theme';

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  withHeader?: boolean;
}>;

const createStyles = (theme: AppTheme) => ({
  safe: {flex: 1, backgroundColor: theme.colors.background},
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  heading: {gap: theme.spacing.sm},
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

export function Page({title, subtitle, withHeader = false, children}: Props) {
  const styles = useThemedStyles(createStyles);
  return (
    <SafeAreaView
      style={styles.safe}
      edges={withHeader ? ['left', 'right', 'bottom'] : ['top', 'left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
