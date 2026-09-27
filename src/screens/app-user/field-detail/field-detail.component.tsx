import React, {useMemo} from 'react';
import {Alert, Text, View} from 'react-native';
import MapView, {Polygon} from 'react-native-maps';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton, InfoCard, Page} from '../../../shared/components/ui';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import {fieldTypeLabels, formatArea, regionForPoints, selectedAreaM2} from '../../../shared/core/fields/model';
import {logSupabaseError} from '../../../shared/core/supabase/errors';
import {useTheme, useThemedStyles} from '../../../shared/theme';
import type {AppTheme} from '../../../shared/theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'FieldDetail'>;

const createStyles = (theme: AppTheme) => ({
  map: {height: 190, borderRadius: 20, overflow: 'hidden' as const,
    borderWidth: 1, borderColor: theme.colors.border},
  mapFill: {flex: 1},
  label: {color: theme.colors.textMuted, fontSize: 17, fontWeight: '600' as const},
  metric: {color: theme.colors.text, fontSize: 40, lineHeight: 48, fontWeight: '700' as const},
  row: {minHeight: 44, flexDirection: 'row' as const, alignItems: 'center' as const, flexWrap: 'wrap' as const,
    gap: 8, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 10},
  rowLabel: {flex: 1, color: theme.colors.textMuted, fontSize: 15},
  rowValue: {color: theme.colors.text, fontSize: 17, fontWeight: '600' as const},
  badge: {borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: theme.colors.primarySoft},
  badgeText: {color: theme.colors.primary, fontSize: 13, fontWeight: '700' as const},
  crop: {color: theme.colors.text, fontSize: 22, lineHeight: 28, fontWeight: '700' as const},
});

function AreaRow({label, areaM2, selected}: {label: string; areaM2: number; selected: boolean}) {
  const styles = useThemedStyles(createStyles);
  return <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    {selected && <View style={styles.badge}><Text style={styles.badgeText}>у розрахунках</Text></View>}
    <Text style={styles.rowValue}>{formatArea(areaM2)}</Text>
  </View>;
}

export function FieldDetailScreen({route, navigation}: Props) {
  const styles = useThemedStyles(createStyles);
  const {theme} = useTheme();
  const {fields, removeField} = useFields();
  const field = fields.find(item => item.id === route.params.fieldId);
  const region = useMemo(
    () => (field && field.polygon.length >= 3 ? regionForPoints(field.polygon) : null),
    [field],
  );

  if (!field) return <Page title="Ділянку не знайдено" onBack={() => navigation.goBack()} />;

  const confirmDelete = () => Alert.alert('Видалити ділянку?',
    `«${field.name}» буде видалено назавжди.`, [
      {text: 'Скасувати', style: 'cancel'},
      {text: 'Видалити', style: 'destructive', onPress: () => {
        removeField(field.id).then(() => navigation.goBack())
          .catch(error => {
            logSupabaseError('Не вдалося видалити ділянку', error);
            Alert.alert('Не вдалося видалити ділянку', 'Не вдалося записати зміни на телефон.');
          });
      }},
    ]);

  const subtitle = [fieldTypeLabels[field.type], field.crop, field.variety].filter(Boolean).join(' · ');

  return <Page title={field.name} subtitle={subtitle} onBack={() => navigation.goBack()}>
    {region && <View style={styles.map} pointerEvents="none" accessibilityLabel="Контур ділянки на карті">
      <MapView style={styles.mapFill} mapType="satellite" region={region} liteMode
        scrollEnabled={false} zoomEnabled={false} rotateEnabled={false} pitchEnabled={false}>
        <Polygon coordinates={field.polygon} strokeColor={theme.colors.accent}
          fillColor="rgba(227,164,59,0.28)" strokeWidth={3} />
      </MapView>
    </View>}
    <InfoCard>
      <Text style={styles.label}>Площа для розрахунків</Text>
      <Text style={styles.metric}>{formatArea(selectedAreaM2(field))}</Text>
      {field.documentAreaM2 !== null && <AreaRow label="За документами" areaM2={field.documentAreaM2}
        selected={field.areaSource === 'document'} />}
      {field.measuredAreaM2 !== null && <AreaRow label="Виміряна" areaM2={field.measuredAreaM2}
        selected={field.areaSource === 'measured'} />}
    </InfoCard>
    {field.crop ? <InfoCard>
      <Text style={styles.label}>Поточна культура</Text>
      <Text style={styles.crop}>{field.crop}</Text>
      {field.variety ? <Text style={styles.label}>Сорт: {field.variety}</Text> : null}
    </InfoCard> : null}
    <AppButton label="Змінити" variant="secondary"
      onPress={() => navigation.navigate('FieldForm', {mode: 'edit', fieldId: field.id})} />
    <AppButton label="Видалити ділянку" variant="danger" onPress={confirmDelete} />
  </Page>;
}
