import type {NavigatorScreenParams} from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Fields: undefined;
  Journal: undefined;
  Insights: undefined;
  Profile: undefined;
};

export type EntryKind = 'work' | 'harvest' | 'sale';

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<MainTabParamList> | undefined;
  FieldDetail: {fieldId: string};
  QuickEntry: {kind: EntryKind} | undefined;
  SignIn: undefined;
};
