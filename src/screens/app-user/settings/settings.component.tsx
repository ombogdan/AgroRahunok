import React from 'react';
import {Alert, Text} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton, InfoCard, Page} from '../../../shared/components/ui';
import {useAuth} from '../../../shared/core/providers/auth/AuthProvider';
import {useFarmData} from '../../../shared/core/offline/FarmDataProvider';
import {useStyles} from './settings.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({navigation}: Props) {
  const styles = useStyles();
  const {session, signOut} = useAuth();
  const {pendingCount, syncState, sync} = useFarmData();
  const account = session?.kind === 'authenticated' ? session : null;

  const confirmSignOut = () => Alert.alert(
    'Вийти з акаунта?',
    'Ділянки залишаться збереженими. Щоб увійти знову, знадобиться інтернет.',
    [
      {text: 'Скасувати', style: 'cancel'},
      {text: 'Вийти', style: 'destructive', onPress: () => {
        signOut().catch(() => Alert.alert('Не вдалося вийти з акаунта', 'Спробуйте ще раз.'));
      }},
    ],
  );

  return <Page title="Налаштування" onBack={() => navigation.goBack()}>
    <InfoCard>
      <Text style={styles.label}>Дані</Text>
      <Text style={styles.title}>{syncState === 'syncing' ? 'Синхронізуємо…'
        : syncState === 'waiting' && pendingCount === 0 ? 'Очікуємо з’єднання'
          : pendingCount === 0 ? 'Синхронізовано' : `На телефоні: ${pendingCount} змін`}</Text>
      <Text style={styles.description}>Записи зберігаються на телефоні й автоматично надсилаються в базу, коли є інтернет.</Text>
      <AppButton label="Синхронізувати зараз" onPress={sync} />
    </InfoCard>
    <InfoCard>
      <Text style={styles.label}>Акаунт Google</Text>
      <Text style={styles.title}>{account?.displayName || 'Ваш акаунт'}</Text>
      {account?.email ? <Text style={styles.description}>{account.email}</Text> : null}
      <AppButton label="Вийти з акаунта" variant="danger" onPress={confirmSignOut} />
    </InfoCard>
  </Page>;
}
