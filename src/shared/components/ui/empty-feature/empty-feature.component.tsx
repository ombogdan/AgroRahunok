import {useStyles} from './empty-feature.styles';
import React from 'react';
import {Text, View} from 'react-native';
import {AppIcon} from '../app-icon/app-icon.component';
import type {AppIconName} from '../app-icon/app-icon.component';
import {InfoCard} from '../info-card/info-card.component';
import {useTheme} from '../../../theme';


export function EmptyFeature({
  icon,
  title,
  detail,
}: {
  icon: AppIconName;
  title: string;
  detail: string;
}) {
  const styles = useStyles();
  const {theme} = useTheme();
  return (
    <InfoCard>
      <View style={styles.content}>
        <View style={styles.circle}><AppIcon name={icon} size={44} color={theme.colors.primary} /></View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>
    </InfoCard>
  );
}
