import React from 'react';
import {Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {AppButton, DemoBadge, InfoCard, Page} from '../../../shared/components/ui';
import {demoFields, formatArea} from '../../../shared/data/demoFarm';
import {useScreenStyles} from '../screen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'FieldDetail'>;

export function FieldDetailScreen({route, navigation}: Props) {
  const common = useScreenStyles();
  const field = demoFields.find(item => item.id === route.params.fieldId);

  if (!field) {
    return <Page title="Ділянку не знайдено" withHeader />;
  }

  return (
    <Page title={field.name} subtitle={`${field.type} · ${formatArea(field.areaM2)}`} withHeader>
      <DemoBadge />
      <InfoCard>
        <Text style={common.label}>Площа для розрахунків</Text>
        <Text style={common.metric}>{formatArea(field.areaM2)}</Text>
        <Text style={common.muted}>
          У робочій версії тут будуть площа за документами та виміряна площа.
        </Text>
      </InfoCard>
      <View style={common.group}>
        <Text style={common.sectionTitle}>Історія посадок</Text>
        <InfoCard>
          <View style={common.row}>
            <Text style={common.body}>{field.crop}</Text>
            <Text style={common.pillText}>2027</Text>
          </View>
          <Text style={common.muted}>{field.note}</Text>
        </InfoCard>
      </View>
      <InfoCard>
        <Text style={common.sectionTitle}>Роботи й урожай</Text>
        <Text style={common.muted}>
          Після додавання журналу тут буде хронологія робіт, зборів і продажів
          цієї ділянки.
        </Text>
        <AppButton
          label="Записати роботу"
          onPress={() => navigation.navigate('QuickEntry', {kind: 'work'})}
        />
      </InfoCard>
    </Page>
  );
}
