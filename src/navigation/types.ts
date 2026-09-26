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
  FieldForm: {mode: 'manual'} | {mode: 'map'; polygon: GeoPoint[]; measuredAreaM2: number};
  FieldDetail: {fieldId: string};
  Settings: undefined;
  QuickEntry: {kind: EntryKind} | undefined;
  SignIn: undefined;
};
