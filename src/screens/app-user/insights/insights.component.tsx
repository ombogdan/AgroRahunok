import React from 'react';
import {Text, View} from 'react-native';
import {DemoBadge, InfoCard, Page} from '../../../shared/components/ui';
import {useScreenStyles} from '../screen.styles';
import {useThemedStyles} from '../../../shared/theme';
import type {AppTheme} from '../../../shared/theme/theme';

const createStyles = (theme: AppTheme) => ({
  track: {
    height: 14,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radii.full,
    overflow: 'hidden' as const,
  },
  bar: {
    height: 14,
    width: '68%' as const,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.full,
  },
});

export function InsightsScreen() {
  const common = useScreenStyles();
  const styles = useThemedStyles(createStyles);
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
