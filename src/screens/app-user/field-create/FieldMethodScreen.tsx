import React from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppIcon} from '../../../shared/components/ui';
import {useTheme, useThemedStyles} from '../../../shared/theme';
import type {AppTheme} from '../../../shared/theme/theme';
import {FieldFlowHeader} from './FieldFlowHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'FieldMethod'>;
const createStyles = (theme: AppTheme) => ({
  safe: {flex: 1, backgroundColor: theme.colors.background},
  content: {paddingHorizontal: 20, paddingBottom: 40, gap: 18},
  heading: {marginTop: 14, marginBottom: 6},
  title: {color: theme.colors.text, fontSize: 34, lineHeight: 41, fontWeight: '700' as const},
  subtitle: {color: theme.colors.textMuted, fontSize: 17, lineHeight: 24, marginTop: 4},
  tile: {minHeight: 112, padding: 16, flexDirection: 'row' as const, alignItems: 'center' as const,
    gap: 16, backgroundColor: theme.colors.surface, borderColor: theme.colors.border,
    borderWidth: 1, borderRadius: 20},
  icon: {width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.primarySoft,
    alignItems: 'center' as const, justifyContent: 'center' as const},
  tileBody: {flex: 1, gap: 3},
  tileTitle: {color: theme.colors.text, fontSize: 21, fontWeight: '600' as const},
  tileDetail: {color: theme.colors.textMuted, fontSize: 15, lineHeight: 21},
});

export function FieldMethodScreen({navigation}: Props) {
  const styles = useThemedStyles(createStyles);
  const {theme} = useTheme();
  return <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
    <ScrollView contentContainerStyle={styles.content}>
      <FieldFlowHeader onBack={() => navigation.goBack()} />
      <View style={styles.heading}>
        <Text style={styles.title}>Нова ділянка</Text>
        <Text style={styles.subtitle}>Як зручніше визначити площу?</Text>
      </View>
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate('FieldMap')} style={styles.tile}>
        <View style={styles.icon}><AppIcon name="draw" color={theme.colors.primary} size={28} /></View>
        <View style={styles.tileBody}>
          <Text style={styles.tileTitle}>Обвести на карті</Text>
          <Text style={styles.tileDetail}>Торкніться кутів ділянки на супутниковій карті</Text>
        </View>
        <AppIcon name="chevronRight" color={theme.colors.textMuted} size={24} strokeWidth={2.2} />
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate('FieldWalk')} style={styles.tile}>
        <View style={styles.icon}><AppIcon name="feet" color={theme.colors.primary} size={28} /></View>
        <View style={styles.tileBody}>
          <Text style={styles.tileTitle}>Обійти з телефоном</Text>
          <Text style={styles.tileDetail}>Пройдіть межею — площа порахується сама</Text>
        </View>
        <AppIcon name="chevronRight" color={theme.colors.textMuted} size={24} strokeWidth={2.2} />
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate('FieldForm', {mode: 'manual'})} style={styles.tile}>
        <View style={styles.icon}><AppIcon name="ruler" color={theme.colors.primary} size={28} /></View>
        <View style={styles.tileBody}>
          <Text style={styles.tileTitle}>Ввести вручну</Text>
          <Text style={styles.tileDetail}>Площа з документів у сотках або гектарах</Text>
        </View>
        <AppIcon name="chevronRight" color={theme.colors.textMuted} size={24} strokeWidth={2.2} />
      </Pressable>
    </ScrollView>
  </SafeAreaView>;
}
