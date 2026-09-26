import React from 'react';
import {ActivityIndicator, Alert, ScrollView, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton, AppIcon, FieldsSyncStatus, InfoCard} from '../../../shared/components/ui';
import {useAuth} from '../../../shared/core/providers/auth/AuthProvider';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import {fieldTypeLabels, formatArea, formatHectares, formatSotkas, selectedAreaM2} from '../../../shared/core/fields/model';
import {useTheme, useThemedStyles} from '../../../shared/theme';
import type {AppTheme} from '../../../shared/theme/theme';
import {useRootNavigation} from '../../../navigation/useRootNavigation';

const createStyles = (theme: AppTheme) => ({
  safe: {flex: 1, backgroundColor: theme.colors.background},
  content: {paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, gap: 32},
  heading: {gap: 4},
  date: {color: theme.colors.textMuted, fontSize: 15, lineHeight: 20},
  title: {color: theme.colors.text, fontSize: 34, lineHeight: 41, fontWeight: '700' as const},
  empty: {gap: 24, paddingVertical: 12},
  iconCircle: {width: 112, height: 112, borderRadius: 56,
    backgroundColor: theme.colors.primarySoft, alignItems: 'center' as const, justifyContent: 'center' as const},
  emptyTitle: {color: theme.colors.text, fontSize: 28, lineHeight: 34, fontWeight: '700' as const},
  emptyText: {color: theme.colors.textMuted, fontSize: 17, lineHeight: 24},
  hint: {color: theme.colors.textMuted, fontSize: 15, lineHeight: 20},
  summaryLabel: {color: theme.colors.textMuted, fontSize: 17, fontWeight: '600' as const},
  total: {color: theme.colors.text, fontSize: 40, lineHeight: 48, fontWeight: '700' as const},
  subTotal: {color: theme.colors.textMuted, fontSize: 17},
  fieldRow: {borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 12,
    flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12},
  dot: {width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary},
  rowBody: {flex: 1, gap: 2},
  rowTitle: {color: theme.colors.text, fontSize: 17, fontWeight: '600' as const},
  rowDetail: {color: theme.colors.textMuted, fontSize: 15},
  rowArea: {color: theme.colors.text, fontSize: 17, fontWeight: '600' as const},
});

export function HomeScreen() {
  const styles = useThemedStyles(createStyles);
  const {theme} = useTheme();
  const navigation = useRootNavigation();
  const {signOut} = useAuth();
  const {fields, loadState, reload} = useFields();
  const totalM2 = fields.reduce((sum, field) => sum + selectedAreaM2(field), 0);
  const date = new Intl.DateTimeFormat('uk-UA', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date());

  return <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.heading}>
        <Text style={styles.date}>{date.charAt(0).toUpperCase() + date.slice(1)}</Text>
        <Text style={styles.title}>Моє господарство</Text>
      </View>
      {loadState === 'ready' && <FieldsSyncStatus />}
      {loadState === 'loading' && <ActivityIndicator color={theme.colors.primary} size="large" />}
      {loadState === 'error' && <InfoCard>
        <Text style={styles.emptyTitle}>Не вдалося відкрити ділянки</Text>
        <Text style={styles.emptyText}>Локальні записи залишилися на телефоні.</Text>
        <AppButton label="Повторити" onPress={reload} />
      </InfoCard>}
      {loadState === 'ready' && fields.length === 0 && <>
        <InfoCard>
          <View style={styles.empty}>
            <View style={styles.iconCircle}><AppIcon name="map" color={theme.colors.primary} size={56} /></View>
            <Text style={styles.emptyTitle}>Додайте першу ділянку</Text>
            <Text style={styles.emptyText}>Обведіть її на карті або введіть площу з документів. Це займе хвилину.</Text>
            <AppButton label="+ Додати ділянку" onPress={() => navigation.navigate('FieldMethod')} />
          </View>
        </InfoCard>
        <Text style={styles.hint}>Після цього тут з’являться ваша земля, роботи й гроші за сезон.</Text>
      </>}
      {loadState === 'ready' && fields.length > 0 && <>
        <InfoCard>
          <Text style={styles.summaryLabel}>Уся земля</Text>
          <Text style={styles.total}>{formatHectares(totalM2)}</Text>
          <Text style={styles.subTotal}>{formatSotkas(totalM2)}</Text>
          {fields.map(field => <View key={field.id} style={styles.fieldRow}>
            <View style={styles.dot} />
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>{field.name}</Text>
              <Text style={styles.rowDetail}>{field.crop || fieldTypeLabels[field.type]}</Text>
            </View>
            <Text style={styles.rowArea}>{formatArea(selectedAreaM2(field))}</Text>
          </View>)}
        </InfoCard>
        <AppButton label="+ Додати ділянку" onPress={() => navigation.navigate('FieldMethod')} />
        <Text style={styles.hint}>Роботи, урожай і гроші з’являться тут після перших записів.</Text>
      </>}
      <AppButton label="Вийти з акаунта" variant="danger"
        onPress={() => signOut().catch(() => Alert.alert('Не вдалося вийти з акаунта'))} />
    </ScrollView>
  </SafeAreaView>;
}
