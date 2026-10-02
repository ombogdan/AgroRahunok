import {t} from '../../../shared/config/i18n';
import {useStyles} from './sign-in.styles';
import React, {useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppIcon, InfoCard} from '../../../shared/components/ui';
import {GoogleSignInButton} from './components/google-sign-in-button/google-sign-in-button.component';
import {useAuth} from '../../../shared/core/providers/auth/AuthProvider';
import {signInErrorMessage} from '../../../shared/core/services/auth/googleAuth';
import {useTheme} from '../../../shared/theme';


export function SignInScreen() {
  const styles = useStyles();
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
      if (__DEV__) console.warn(t("googleSignInFailed"), cause);
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
          <Text style={styles.title}>{t("appName")}</Text>
          <Text style={styles.subtitle}>{t("yourFieldsWorkHarvestAndFinancesInOnePlace", [], "both")}</Text>
        </View>
        <InfoCard>
          <Text style={styles.cardTitle}>{t("signInToYourFarm")}</Text>
          <GoogleSignInButton
            label={busy ? t("signingIn") : t("continueWithGoogle")}
            onPress={handleGoogleSignIn}
            busy={busy}
          />
          {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        </InfoCard>
      </ScrollView>
    </SafeAreaView>
  );
}
