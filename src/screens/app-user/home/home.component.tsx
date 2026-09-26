import React from 'react';
import {Text, View} from 'react-native';
import {AppButton, DemoBadge, InfoCard, Page} from '../../../shared/components/ui';
import {demoFields, formatArea} from '../../../shared/data/demoFarm';
import {useRootNavigation} from '../../../navigation/useRootNavigation';
import {useScreenStyles} from '../screen.styles';

export function HomeScreen() {
  const navigation = useRootNavigation();
  const styles = useScreenStyles();
  const totalArea = demoFields.reduce((sum, field) => sum + field.areaM2, 0);

  return (
    <Page title="АгроРахунок" subtitle="Ваше господарство на одному екрані">
      <DemoBadge />
      <InfoCard>
        <Text style={styles.label}>Уся земля</Text>
        <Text style={styles.metric}>{formatArea(totalArea)}</Text>
        <Text style={styles.muted}>2 ділянки · сезон 2027</Text>
        <AppButton
          label="Переглянути ділянки"
          variant="secondary"
          onPress={() => navigation.navigate('Tabs', {screen: 'Fields'})}
        />
      </InfoCard>
      <View style={styles.group}>
        <Text style={styles.sectionTitle}>Швидкий запис</Text>
        <AppButton
          label="Записати роботу"
          onPress={() => navigation.navigate('QuickEntry', {kind: 'work'})}
        />
        <AppButton
          label="Записати збір"
          variant="secondary"
          onPress={() => navigation.navigate('QuickEntry', {kind: 'harvest'})}
        />
        <AppButton
          label="Записати продаж"
          variant="quiet"
          onPress={() => navigation.navigate('QuickEntry', {kind: 'sale'})}
        />
      </View>
      <InfoCard>
        <Text style={styles.sectionTitle}>Підсумки сезону</Text>
        <Text style={styles.muted}>
          Тут зʼявляться витрати, урожай, продажі та результат, коли почнемо
          зберігати записи.
        </Text>
      </InfoCard>
    </Page>
  );
}
