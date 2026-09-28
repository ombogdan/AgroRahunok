import {t} from '../../../config/i18n';
import {useStyles} from './demo-badge.styles';
import React from 'react';
import {Text, View} from 'react-native';


export function DemoBadge() {
  const styles = useStyles();
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{t("mockupSampleData")}</Text>
    </View>
  );
}
