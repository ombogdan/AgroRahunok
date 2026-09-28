import {t} from '../../../../shared/config/i18n';
import {useStyles} from './record-dock.styles';
import React, {useState} from 'react';
import {View} from 'react-native';
import {BottomTabBar} from '@react-navigation/bottom-tabs';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useRootNavigation} from '../../../../navigation/useRootNavigation';
import {AppButton} from '../../../../shared/components/ui';
import {useFields} from '../../../../shared/core/fields/FieldsProvider';
import {RecordSheet} from '../record-sheet/record-sheet.component';


// Tab bar with the design's RecordDock above it: «+ Записати» on every tab once a plot exists,
// «+ Додати ділянку» on the plots tab.
export function TabBarWithDock(props: BottomTabBarProps) {
  const styles = useStyles();
  const navigation = useRootNavigation();
  const {fields} = useFields();
  const [sheetOpen, setSheetOpen] = useState(false);
  const onFieldsTab = props.state.routes[props.state.index].name === 'Fields';

  return <>
    {fields.length > 0 && <View style={styles.dock}>
      <AppButton label={onFieldsTab ? t("addField") : t("addRecord")}
        onPress={() => (onFieldsTab ? navigation.navigate('FieldMethod') : setSheetOpen(true))} />
    </View>}
    <BottomTabBar {...props} />
    <RecordSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} onChoose={kind => {
      setSheetOpen(false);
      if (kind === 'work') navigation.navigate('WorkRecord');
      else if (kind === 'harvest' || kind === 'sale') navigation.navigate('QuantityRecord', {kind});
      else if (kind === 'other') navigation.navigate('OtherRecord');
    }} />
  </>;
}
