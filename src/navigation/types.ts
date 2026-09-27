import type {NavigatorScreenParams} from '@react-navigation/native';
import type {GeoPoint} from '../shared/core/fields/model';

export type MainTabParamList = {
  Home: undefined;
  Fields: undefined;
  Journal: undefined;
  Money: undefined;
};

export type EntryKind = 'work' | 'harvest' | 'sale';

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<MainTabParamList> | undefined;
  FieldMethod: undefined;
  FieldMap: undefined;
  FieldWalk: undefined;
  FieldForm:
    | {mode: 'manual'}
    | {mode: 'map' | 'walk'; polygon: GeoPoint[]; measuredAreaM2: number}
    | {mode: 'edit'; fieldId: string};
  FieldDetail: {fieldId: string};
  RowsSetup: {fieldId: string};
  WorkRecord: {recordId?: string} | undefined;
  QuantityRecord: {kind: 'harvest' | 'sale'; recordId?: string};
  OtherRecord: {recordId?: string} | undefined;
  Settings: undefined;
  QuickEntry: {kind: EntryKind} | undefined;
  SignIn: undefined;
};
