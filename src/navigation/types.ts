import type {NavigatorScreenParams} from '@react-navigation/native';
import type {GeoPoint} from '../shared/core/fields/model';

export type MainTabParamList = {
  Home: undefined;
  Fields: undefined;
  Journal: undefined;
  Money: undefined;
};

export type EntryKind = 'work' | 'harvest' | 'sale';

// A contour redrawn on the map or walked again while editing a plot, not saved yet.
export type NewBoundary = {polygon: GeoPoint[]; measuredAreaM2: number; source: 'map' | 'walk'};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<MainTabParamList> | undefined;
  FieldMethod: undefined;
  // With a plot id both screens change that plot's contour and return it to the edit form.
  FieldMap: {fieldId: string; polygon: GeoPoint[]} | undefined;
  FieldWalk: {fieldId: string} | undefined;
  FieldForm:
    | {mode: 'manual'}
    | {mode: 'map' | 'walk'; polygon: GeoPoint[]; measuredAreaM2: number}
    | {mode: 'edit'; fieldId: string; boundary?: NewBoundary};
  FieldDetail: {fieldId: string};
  RowsSetup: {fieldId: string};
  WorkRecord: {recordId?: string} | undefined;
  QuantityRecord: {kind: 'harvest' | 'sale'; recordId?: string};
  OtherRecord: {recordId?: string} | undefined;
  Settings: undefined;
  QuickEntry: {kind: EntryKind} | undefined;
  SignIn: undefined;
};
