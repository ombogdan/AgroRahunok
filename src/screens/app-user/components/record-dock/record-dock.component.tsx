import {t} from '../../../../shared/config/i18n';
import {useStyles} from './record-dock.styles';
import React, {useState} from 'react';
import {View} from 'react-native';
import {BottomTabBar} from '@react-navigation/bottom-tabs';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useRootNavigation} from '../../../../navigation/useRootNavigation';
import {useFields} from '../../../../shared/core/fields/FieldsProvider';
import {dateLabel} from '../../../../shared/core/records/model';
import {useRecords} from '../../../../shared/core/records/RecordsProvider';
import {recordTitle} from '../record-row/record-row.component';
import {DockButton} from '../dock-button/dock-button.component';
import {RecordSheet} from '../record-sheet/record-sheet.component';


// Tab bar with the design's RecordDock above it: «Додати запис» on every tab once a plot exists,
// «Додати ділянку» on the plots tab.
export function TabBarWithDock(props: BottomTabBarProps) {
  const styles = useStyles();
  const navigation = useRootNavigation();
  const {fields} = useFields();
  const {records} = useRecords();
  const [sheetOpen, setSheetOpen] = useState(false);
  // The newest job, offered at the top of the sheet for another round (the next hoeing, say).
  const lastWork = records.find(record => record.kind === 'work');
  const lastWorkField = lastWork ? fields.find(field => field.id === lastWork.fieldId) : undefined;
  const onFieldsTab = props.state.routes[props.state.index].name === 'Fields';

  return <>
    {fields.length > 0 && <View style={styles.dock}>
      {onFieldsTab
        ? <DockButton title={t("addFieldTitle")} onPress={() => navigation.navigate('FieldMethod')} />
        : <DockButton title={t("addRecordTitle")} onPress={() => setSheetOpen(true)} />}
    </View>}
    <BottomTabBar {...props} />
    <RecordSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}
      repeat={lastWork && lastWorkField ? {
        title: t("repeatValue", [recordTitle(lastWork)]),
        detail: [lastWorkField.name, dateLabel(lastWork.occurredOn)].join(' · '),
        onPress: () => {
          setSheetOpen(false);
          navigation.navigate('WorkRecord', {repeatOf: lastWork.id});
        },
      } : null}
      onChoose={kind => {
      setSheetOpen(false);
      if (kind === 'work') navigation.navigate('WorkRecord');
      else if (kind === 'harvest' || kind === 'sale') navigation.navigate('QuantityRecord', {kind});
      else if (kind === 'other') navigation.navigate('OtherRecord');
    }} />
  </>;
}
