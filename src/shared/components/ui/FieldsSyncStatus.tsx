import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {useFields} from '../../core/fields/FieldsProvider';
import {useThemedStyles} from '../../theme';
import type {AppTheme} from '../../theme/theme';

const messages = {
  unconfigured: 'Хмарне збереження ще не налаштовано. Ділянки поки на телефоні.',
  pending: 'Зміни очікують синхронізації.',
  syncing: 'Синхронізуємо ділянки…',
  error: 'Не вдалося синхронізувати. Ділянки збережено на телефоні.',
  synced: '',
};

const createStyles = (theme: AppTheme) => ({
  row: {gap: 4},
  text: {color: theme.colors.textMuted, fontSize: 14, lineHeight: 20},
  retry: {color: theme.colors.primary, fontSize: 14, fontWeight: '600' as const},
});

export function FieldsSyncStatus() {
  const {syncState, retrySync} = useFields();
  const styles = useThemedStyles(createStyles);
  if (syncState === 'synced') return null;
  return <View style={styles.row}>
    <Text style={styles.text}>{messages[syncState]}</Text>
    {syncState === 'error' && <Pressable accessibilityRole="button"
      onPress={retrySync}><Text style={styles.retry}>Спробувати ще раз</Text></Pressable>}
  </View>;
}
