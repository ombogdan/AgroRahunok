import React from 'react';
import {ScrollView, StatusBar, Text, View} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {ThemeProvider, useTheme} from './src/shared/theme';
import {useThemedStyles} from './src/shared/theme/useThemedStyles';
import type {AppTheme} from './src/shared/theme/theme';

const createScreenStyles = (theme: AppTheme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: theme.typography.label,
    fontWeight: '700' as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.title,
    fontWeight: '700' as const,
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 24,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.heading,
    fontWeight: '600' as const,
  },
  cardText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 23,
  },
  accent: {
    height: 5,
    width: 48,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.accent,
  },
});

function WelcomeScreen() {
  const {theme, isDark} = useTheme();
  const styles = useThemedStyles(createScreenStyles);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>Новий проєкт</Text>
        <Text style={styles.title}>АгроРахунок</Text>
        <Text style={styles.description}>
          Простий облік господарства: поля, роботи, витрати та результат.
        </Text>

        <View style={styles.card}>
          <View style={styles.accent} />
          <Text style={styles.cardTitle}>Основа застосунку готова</Text>
          <Text style={styles.cardText}>
            Налаштовано тему, кольори, типографіку та відступи. Наступний крок —
            погодити перший робочий сценарій і моделі даних.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <WelcomeScreen />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
