import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../../navigation/types';
import type {FarmRecord} from '../../../../shared/core/records/model';

// Every record opens in the form it was made with.
export function openRecord(navigation: Pick<NativeStackNavigationProp<RootStackParamList>, 'navigate'>,
  record: FarmRecord): void {
  if (record.kind === 'work') navigation.navigate('WorkRecord', {recordId: record.id});
  else if (record.kind === 'harvest' || record.kind === 'sale') {
    navigation.navigate('QuantityRecord', {kind: record.kind, recordId: record.id});
  } else navigation.navigate('OtherRecord', {recordId: record.id});
}
