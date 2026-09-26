import React from 'react';
import {Text} from 'react-native';
import {AppButton, InfoCard, Page} from '../../../shared/components/ui';
import {useRootNavigation} from '../../../navigation/useRootNavigation';
import {useAuth} from '../../../shared/core/providers/auth/AuthProvider';
import {useSubscription} from '../../../shared/core/providers/subscription/SubscriptionProvider';
import {useScreenStyles} from '../screen.styles';

export function ProfileScreen() {
  const navigation = useRootNavigation();
  const {session} = useAuth();
  const {plan} = useSubscription();
  const styles = useScreenStyles();

  return (
    <Page title="Профіль" subtitle="Доступ і налаштування застосунку">
      <InfoCard>
        <Text style={styles.sectionTitle}>
          {session.kind === 'guest' ? 'Без акаунта' : session.displayName || 'Акаунт'}
        </Text>
        <Text style={styles.muted}>
          Зараз працює локальний режим. Вхід Google й Apple підключимо разом із
          хмарною синхронізацією.
        </Text>
        <AppButton
          label="Варіанти входу"
          variant="secondary"
          onPress={() => navigation.navigate('SignIn')}
        />
      </InfoCard>
      <InfoCard>
        <Text style={styles.sectionTitle}>План: {plan === 'free' ? 'Безкоштовний' : 'Плюс'}</Text>
        <Text style={styles.muted}>
          Ділянки, журнал, урожай, продажі, базові підсумки та резервна копія
          залишаються у безкоштовній частині.
        </Text>
      </InfoCard>
    </Page>
  );
}
