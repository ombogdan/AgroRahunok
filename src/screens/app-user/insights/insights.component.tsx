import {t} from '../../../shared/config/i18n';
import {useStyles} from './insights.styles';
import React from 'react';
import {Text, View} from 'react-native';
import {DemoBadge, InfoCard, Page} from '../../../shared/components/ui';
import {useScreenStyles} from '../screen.styles';


export function InsightsScreen() {
  const common = useScreenStyles();
  const styles = useStyles();
  return (
    <Page title={t("summary")} subtitle={t("areaHarvestAndFinancesBySeason")}>
      <DemoBadge />
      <InfoCard>
        <Text style={common.sectionTitle}>{t("areaByCrop")}</Text>
        <View style={common.row}>
          <Text style={common.body}>{t("winterWheat")}</Text>
          <Text style={common.pillText}>{t("twoHectaresExample")}</Text>
        </View>
        <View style={styles.track}><View style={styles.bar} /></View>
        <View style={common.row}>
          <Text style={common.body}>{t("raspberry")}</Text>
          <Text style={common.pillText}>{t("twentyAresExample")}</Text>
        </View>
      </InfoCard>
      <InfoCard>
        <Text style={common.sectionTitle}>{t("seasonFinances")}</Text>
        <Text style={common.muted}>{t("financesEmptyDescription", [], "both")}</Text>
      </InfoCard>
    </Page>
  );
}
