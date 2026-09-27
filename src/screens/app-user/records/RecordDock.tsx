import React, {useState} from 'react';
import {View} from 'react-native';
import {BottomTabBar} from '@react-navigation/bottom-tabs';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useRootNavigation} from '../../../navigation/useRootNavigation';
import {AppButton} from '../../../shared/components/ui';
import {useFields} from '../../../shared/core/fields/FieldsProvider';
import {useThemedStyles} from '../../../shared/theme';
import type {AppTheme} from '../../../shared/theme/theme';
import {RecordSheet} from './RecordSheet';

const createStyles = (theme: AppTheme) => ({
  dock: {paddingHorizontal: 20, paddingVertical: 12, backgroundColor: theme.colors.background},
});

// Tab bar with the design's RecordDock above it: «+ Записати» on every tab once a plot exists,
// «+ Додати ділянку» on the plots tab.
export function TabBarWithDock(props: BottomTabBarProps) {
  const styles = useThemedStyles(createStyles);
  const navigation = useRootNavigation();
  const {fields} = useFields();
  const [sheetOpen, setSheetOpen] = useState(false);
  const onFieldsTab = props.state.routes[props.state.index].name === 'Fields';

  return <>
    {fields.length > 0 && <View style={styles.dock}>
      <AppButton label={onFieldsTab ? '+ Додати ділянку' : '+ Записати'}
        onPress={() => (onFieldsTab ? navigation.navigate('FieldMethod') : setSheetOpen(true))} />
    </View>}
    <BottomTabBar {...props} />
    <RecordSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} onChoose={kind => {
      setSheetOpen(false);
      if (kind === 'work') navigation.navigate('WorkRecord');
    }} />
  </>;
}
