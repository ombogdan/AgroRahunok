import React from 'react';
import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import {AppButton, AppIcon, InfoCard, Page} from '../../../shared/components/ui';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import {fieldTypeLabels, formatArea, formatHectares, selectedAreaM2} from '../../../shared/core/fields/model';
import {useRootNavigation} from '../../../navigation/useRootNavigation';
import {useTheme, useThemedStyles} from '../../../shared/theme';
import type {AppTheme} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme) => ({
  label: {color: theme.colors.textMuted, fontSize: 17, fontWeight: '600' as const},
  total: {color: theme.colors.text, fontSize: 38, fontWeight: '700' as const},
  emptyTitle: {color: theme.colors.text, fontSize: 22, fontWeight: '700' as const},
  muted: {color: theme.colors.textMuted, fontSize: 17, lineHeight: 24},
  row: {minHeight: 72, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12},
  rowBody: {flex: 1, gap: 3},
  name: {color: theme.colors.text, fontSize: 19, fontWeight: '600' as const},
  area: {color: theme.colors.text, fontSize: 17, fontWeight: '600' as const},
});

export function FieldsScreen() {
  const styles = useThemedStyles(createStyles);
  const {theme} = useTheme();
  const navigation = useRootNavigation();
  const {fields, loadState, reload} = useFields();
  const totalM2 = fields.reduce((sum, field) => sum + selectedAreaM2(field), 0);

  return <Page title="Ділянки" subtitle="Ваша земля і її площа">
    {loadState === 'loading' && <ActivityIndicator color={theme.colors.primary} size="large" />}
    {loadState === 'error' && <InfoCard>
      <Text style={styles.emptyTitle}>Не вдалося завантажити ділянки</Text>
      <Text style={styles.muted}>Не вдалося відкрити дані на телефоні. Перезапустіть застосунок.</Text>
      <AppButton label="Повторити" onPress={reload} />
    </InfoCard>}
    {loadState === 'ready' && <>
      {fields.length > 0 && <InfoCard>
        <Text style={styles.label}>Уся земля</Text>
        <Text style={styles.total}>{formatHectares(totalM2)}</Text>
      </InfoCard>}
      {fields.length === 0 && <InfoCard>
        <Text style={styles.emptyTitle}>Ділянок ще немає</Text>
        <Text style={styles.muted}>Додайте першу ділянку на карті або введіть площу вручну.</Text>
      </InfoCard>}
      {fields.map(field => <Pressable key={field.id} accessibilityRole="button"
        onPress={() => navigation.navigate('FieldDetail', {fieldId: field.id})}>
        <InfoCard>
          <View style={styles.row}>
            <View style={styles.rowBody}>
              <Text style={styles.name}>{field.name}</Text>
              <Text style={styles.muted}>{[fieldTypeLabels[field.type], field.crop, field.variety].filter(Boolean).join(' · ')}</Text>
            </View>
            <Text style={styles.area}>{formatArea(selectedAreaM2(field))}</Text>
            <AppIcon name="chevronRight" color={theme.colors.textMuted} size={24} strokeWidth={2.2} />
          </View>
        </InfoCard>
      </Pressable>)}
      {/* With plots, «+ Додати ділянку» sits in the dock above the tabs. */}
      {fields.length === 0 && <AppButton label="+ Додати ділянку" onPress={() => navigation.navigate('FieldMethod')} />}
    </>}
  </Page>;
}
