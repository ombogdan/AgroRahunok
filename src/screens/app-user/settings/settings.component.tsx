import React from 'react';
import {Alert, Text} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton, InfoCard, Page} from '../../../shared/components/ui';
import {useAuth} from '../../../shared/core/providers/auth/AuthProvider';
import {useFarmData} from '../../../shared/core/offline/FarmDataProvider';
import {useScreenStyles} from '../screen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({navigation}: Props) {
  const common = useScreenStyles();
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
      <Text style={common.label}>Дані</Text>
      <Text style={common.sectionTitle}>{syncState === 'syncing' ? 'Синхронізуємо…'
        : syncState === 'waiting' && pendingCount === 0 ? 'Очікуємо з’єднання'
          : pendingCount === 0 ? 'Синхронізовано' : `На телефоні: ${pendingCount} змін`}</Text>
      <Text style={common.muted}>Записи зберігаються на телефоні й автоматично надсилаються в базу, коли є інтернет.</Text>
      <AppButton label="Синхронізувати зараз" onPress={sync} />
    </InfoCard>
    <InfoCard>
      <Text style={common.label}>Акаунт Google</Text>
      <Text style={common.sectionTitle}>{account?.displayName || 'Ваш акаунт'}</Text>
      {account?.email ? <Text style={common.muted}>{account.email}</Text> : null}
      <AppButton label="Вийти з акаунта" variant="danger" onPress={confirmSignOut} />
    </InfoCard>
  </Page>;
}
