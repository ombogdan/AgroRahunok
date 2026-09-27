import {useStyles} from './insights.styles';
import React from 'react';
import {Text, View} from 'react-native';
import {DemoBadge, InfoCard, Page} from '../../../shared/components/ui';
import {useScreenStyles} from '../screen.styles';


export function InsightsScreen() {
  const common = useScreenStyles();
  const styles = useStyles();
  return (
    <Page title="Підсумки" subtitle="Площа, урожай і гроші за сезон">
      <DemoBadge />
      <InfoCard>
        <Text style={common.sectionTitle}>Земля за культурами</Text>
        <View style={common.row}>
          <Text style={common.body}>Озима пшениця</Text>
          <Text style={common.pillText}>2 га</Text>
        </View>
        <View style={styles.track}><View style={styles.bar} /></View>
        <View style={common.row}>
          <Text style={common.body}>Малина</Text>
          <Text style={common.pillText}>20 соток</Text>
        </View>
      </InfoCard>
      <InfoCard>
        <Text style={common.sectionTitle}>Економіка сезону</Text>
        <Text style={common.muted}>
          Доходи, витрати й результат зʼявляться після внесення реальних
          записів. Базові підсумки залишаться безкоштовними.
        </Text>
      </InfoCard>
    </Page>
  );
}
