import {useStyles} from './info-card.styles';
import React from 'react';
import {View} from 'react-native';
import type {PropsWithChildren} from 'react';


export function InfoCard({children}: PropsWithChildren) {
  const styles = useStyles();
  return <View style={styles.card}>{children}</View>;
}
