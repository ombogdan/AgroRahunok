import {languageNames, languages, t, useLanguage} from '../../../shared/config/i18n';
import React from 'react';
import {Alert, Pressable, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton, InfoCard, Page} from '../../../shared/components/ui';
import {useAuth} from '../../../shared/core/providers/auth/AuthProvider';
import {useFarmData} from '../../../shared/core/offline/FarmDataProvider';
import {useStyles} from './settings.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({navigation}: Props) {
  const styles = useStyles();
  const {language, setLanguage} = useLanguage();
  const {session, signOut} = useAuth();
  const {pendingCount, syncState, sync} = useFarmData();
  const account = session?.kind === 'authenticated' ? session : null;

  const confirmSignOut = () => Alert.alert(
    t("confirmSignOutTitle"),
    t("signOutOfflineNotice"),
    [
      {text: t("cancel"), style: 'cancel'},
      {text: t("signOutAction"), style: 'destructive', onPress: () => {
        signOut().catch(() => Alert.alert(t("couldNotSignOut"), t("pleaseTryAgain")));
      }},
    ],
  );

  return <Page title={t("settings")} onBack={() => navigation.goBack()}>
    <InfoCard>
      <Text style={styles.label}>{t("data")}</Text>
      <Text style={styles.title}>{syncState === 'syncing' ? t("syncing")
        : syncState === 'waiting' && pendingCount === 0 ? t("waitingForConnection")
          : pendingCount === 0 ? t("synced") : t("pendingChangesOnPhone", [pendingCount])}</Text>
      <Text style={styles.description}>{t("offlineSyncDescription")}</Text>
      <AppButton label={t("syncNow")} onPress={sync} />
    </InfoCard>
    <InfoCard>
      <Text style={styles.label}>{t('appLanguage')}</Text>
      <View style={styles.languageList}>
        {languages.map(option => <Pressable key={option} accessibilityRole="radio"
          accessibilityState={{checked: language === option}}
          onPress={() => setLanguage(option)}
          style={[styles.languageOption, language === option && styles.languageSelected]}>
          <Text style={[styles.languageText, language === option && styles.languageTextSelected]}>
            {languageNames[option]}
          </Text>
        </Pressable>)}
      </View>
    </InfoCard>
    <InfoCard>
      <Text style={styles.label}>{t("googleAccount")}</Text>
      <Text style={styles.title}>{account?.displayName || t("yourAccount")}</Text>
      {account?.email ? <Text style={styles.description}>{account.email}</Text> : null}
      <AppButton label={t("signOutButton")} variant="danger" onPress={confirmSignOut} />
    </InfoCard>
  </Page>;
}
