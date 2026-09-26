import React from 'react';
import {Alert, Pressable, ScrollView, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton, AppIcon, InfoCard} from '../../../shared/components/ui';
import {useAuth} from '../../../shared/core/providers/auth/AuthProvider';
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
  iconCircle: {
    width: 112, height: 112, borderRadius: 56,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center' as const, justifyContent: 'center' as const,
  },
  emptyTitle: {color: theme.colors.text, fontSize: 28, lineHeight: 34, fontWeight: '700' as const},
  emptyText: {color: theme.colors.textMuted, fontSize: 17, lineHeight: 24},
  hint: {color: theme.colors.textMuted, fontSize: 15, lineHeight: 20},
  signOut: {color: theme.colors.primary, fontSize: 15, lineHeight: 20, fontWeight: '600' as const},
  signOutHit: {minHeight: 44, alignSelf: 'flex-start' as const, justifyContent: 'center' as const},
});

export function HomeScreen() {
  const styles = useThemedStyles(createStyles);
  const {theme} = useTheme();
  const navigation = useRootNavigation();
  const {signOut} = useAuth();
  const date = new Intl.DateTimeFormat('uk-UA', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date());

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <Text style={styles.date}>{date.charAt(0).toUpperCase() + date.slice(1)}</Text>
          <Text style={styles.title}>Моє господарство</Text>
        </View>
        <InfoCard>
          <View style={styles.empty}>
            <View style={styles.iconCircle}>
              <AppIcon name="map" color={theme.colors.primary} size={56} />
            </View>
            <Text style={styles.emptyTitle}>Додайте першу ділянку</Text>
            <Text style={styles.emptyText}>
              Обведіть її на карті, обійдіть з телефоном або введіть площу з документів. Це займе хвилину.
            </Text>
            <AppButton label="+ Додати ділянку" onPress={() => navigation.navigate('Tabs', {screen: 'Fields'})} />
          </View>
        </InfoCard>
        <Text style={styles.hint}>
          Після цього тут з’являться ваша земля, роботи й гроші за сезон.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => signOut().catch(() => Alert.alert('Не вдалося вийти з акаунта'))}
          style={styles.signOutHit}>
          <Text style={styles.signOut}>Вийти з акаунта</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
