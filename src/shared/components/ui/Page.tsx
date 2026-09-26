import React from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';
import type {PropsWithChildren} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useThemedStyles} from '../../theme';
import type {AppTheme} from '../../theme/theme';

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  withHeader?: boolean;
  onBack?: () => void;
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
  back: {minHeight: 44, alignSelf: 'flex-start' as const, justifyContent: 'center' as const},
  backText: {color: theme.colors.primary, fontSize: 17},
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
      <ScrollView contentContainerStyle={styles.content}>
        {onBack && <Pressable accessibilityRole="button" onPress={onBack} style={styles.back}>
          <Text style={styles.backText}>‹ Назад</Text>
        </Pressable>}
        <View style={styles.heading}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
