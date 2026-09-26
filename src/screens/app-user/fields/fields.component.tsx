import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {DemoBadge, InfoCard, Page} from '../../../shared/components/ui';
import {demoFields, formatArea} from '../../../shared/data/demoFarm';
import {useRootNavigation} from '../../../navigation/useRootNavigation';
import {useScreenStyles} from '../screen.styles';
import {useStyles} from './fields.styles';

export function FieldsScreen() {
  const navigation = useRootNavigation();
  const styles = useStyles();
  const common = useScreenStyles();

  return (
    <Page title="Ділянки" subtitle="Карта, площа та історія посадок">
      <DemoBadge />
      <View style={styles.mapPreview} accessibilityLabel="Схема майбутньої карти">
        <View style={styles.plotRow}>
          <View style={styles.plot} />
          <View style={styles.plotSmall} />
        </View>
        <Text style={styles.mapText}>Схема · карту підключимо окремо</Text>
      </View>
      <Text style={common.sectionTitle}>Мої ділянки</Text>
      {demoFields.map(field => (
        <Pressable
          key={field.id}
          accessibilityRole="button"
          onPress={() =>
            navigation.navigate('FieldDetail', {fieldId: field.id})
          }>
          <InfoCard>
            <View style={common.row}>
              <Text style={common.sectionTitle}>{field.name}</Text>
              <Text style={common.pillText}>{formatArea(field.areaM2)}</Text>
            </View>
            <Text style={common.muted}>{field.crop}</Text>
            <Text style={common.label}>{field.note}</Text>
          </InfoCard>
        </Pressable>
      ))}
      <InfoCard>
        <Text style={common.body}>Наступний крок — додавання власної ділянки</Text>
        <Text style={common.muted}>
          Перед збереженням реальних даних додамо карту, вимір площі й локальну
          базу.
        </Text>
      </InfoCard>
    </Page>
  );
}
