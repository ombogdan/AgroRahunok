import React, {useState} from 'react';
import {ActivityIndicator, ScrollView, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton, AppIcon, InfoCard} from '../../../shared/components/ui';
import {useAuth} from '../../../shared/core/providers/auth/AuthProvider';
import {signInErrorMessage} from '../../../shared/core/services/auth/googleAuth';
import {useTheme, useThemedStyles} from '../../../shared/theme';
import type {AppTheme} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme) => ({
  safe: {flex: 1, backgroundColor: theme.colors.background},
  content: {flexGrow: 1, padding: 20, justifyContent: 'center' as const, gap: 32},
  brand: {gap: 16},
  iconCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center' as const, justifyContent: 'center' as const,
  },
  title: {color: theme.colors.text, fontSize: 34, lineHeight: 41, fontWeight: '700' as const},
  subtitle: {color: theme.colors.textMuted, fontSize: 17, lineHeight: 24},
  cardTitle: {color: theme.colors.text, fontSize: 22, lineHeight: 28, fontWeight: '700' as const},
  fine: {color: theme.colors.textMuted, fontSize: 15, lineHeight: 20},
  error: {color: theme.colors.danger, fontSize: 15, lineHeight: 20},
});

export function SignInScreen() {
  const styles = useThemedStyles(createStyles);
  const {theme} = useTheme();
  const {signInWithGoogle} = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setError(null);
    setBusy(true);
    try {
      // A cancelled sheet just returns to this screen without an error.
      await signInWithGoogle();
    } catch (cause) {
      if (__DEV__) console.warn('Вхід через Google не вдався', cause);
      setError(signInErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <View style={styles.iconCircle}>
            <AppIcon name="plots" color={theme.colors.primary} size={48} />
          </View>
          <Text style={styles.title}>АгроРахунок</Text>
          <Text style={styles.subtitle}>
            Ваша земля, роботи, урожай і гроші — в одному місці.
          </Text>
        </View>
        <InfoCard>
          <Text style={styles.cardTitle}>Увійдіть у господарство</Text>
          <Text style={styles.fine}>Почніть з акаунта Google. Вхід Apple додамо згодом.</Text>
          <AppButton label={busy ? 'Входимо…' : 'Продовжити з Google'} onPress={handleGoogleSignIn} disabled={busy} />
          {busy && <ActivityIndicator color={theme.colors.primary} />}
          {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        </InfoCard>
      </ScrollView>
    </SafeAreaView>
  );
}
