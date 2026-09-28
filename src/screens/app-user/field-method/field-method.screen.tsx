import {t} from '../../../shared/config/i18n';
import {useStyles} from './field-method.styles';
import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/types';
import {FieldFlowHeader} from '../../../shared/components/field-flow-header/field-flow-header.component';
import {MethodOption} from './components/method-option/method-option.component';

type Props = NativeStackScreenProps<RootStackParamList, 'FieldMethod'>;

export function FieldMethodScreen({navigation}: Props) {
  const styles = useStyles();
  return <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
    <View style={styles.header}>
      <FieldFlowHeader onBack={() => navigation.goBack()} />
      <View style={styles.heading}>
        <Text style={styles.title} accessibilityRole="header">{t("newField")}</Text>
        <Text style={styles.subtitle}>{t("howWouldYouLikeToMeasureTheArea")}</Text>
      </View>
    </View>
    <ScrollView contentContainerStyle={styles.content}>
      <MethodOption title={t("drawOnMap")} detail={t("tapTheFieldCornersOnTheSatelliteMap")}
        icon="draw" onPress={() => navigation.navigate('FieldMap')} />
      <MethodOption title={t("walkWithPhone")} detail={t("walkTheBoundaryToCalculateAreaAutomatically")}
        icon="feet" onPress={() => navigation.navigate('FieldWalk')} />
      <MethodOption title={t("enterManually")} detail={t("documentedAreaInAresOrHectares")}
        icon="ruler" onPress={() => navigation.navigate('FieldForm', {mode: 'manual'})} />
    </ScrollView>
  </SafeAreaView>;
}
