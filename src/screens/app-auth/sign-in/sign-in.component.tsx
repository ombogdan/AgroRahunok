import React from 'react';
import {Text} from 'react-native';
import {AppButton, InfoCard, Page} from '../../../shared/components/ui';
import {useThemedStyles} from '../../../shared/theme';
import type {AppTheme} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme) => ({
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.heading,
    fontWeight: '700' as const,
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 23,
  },
});

export function SignInScreen() {
  const styles = useThemedStyles(createStyles);
  return (
    <Page title="Вхід" subtitle="Акаунт для майбутньої синхронізації" withHeader>
      <InfoCard>
        <Text style={styles.title}>Продовжити з акаунтом</Text>
        <Text style={styles.description}>
          Зараз застосунок працює без реєстрації. Кнопки входу запрацюють після
          налаштування Google, Apple та сервера синхронізації.
        </Text>
        <AppButton label="Продовжити з Apple" onPress={() => {}} disabled />
        <AppButton
          label="Продовжити з Google"
          variant="secondary"
          onPress={() => {}}
          disabled
        />
      </InfoCard>
      <Text style={styles.description}>
        Базові можливості залишаться доступними без входу й без підписки.
      </Text>
    </Page>
  );
}
