import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {FieldDetailScreen, FieldsScreen, HomeScreen, JournalScreen, MoneyScreen, SettingsScreen} from '../screens/app-user';
import {FieldFormScreen} from '../screens/app-user/field-form/field-form.screen';
import {FieldMapScreen} from '../screens/app-user/field-map/field-map.screen';
import {FieldMethodScreen} from '../screens/app-user/field-method/field-method.screen';
import {FieldWalkScreen} from '../screens/app-user/field-walk/field-walk.screen';
import {OtherRecordScreen} from '../screens/app-user/other-record/other-record.screen';
import {QuantityRecordScreen} from '../screens/app-user/quantity-record/quantity-record.screen';
import {TabBarWithDock} from '../screens/app-user/components/record-dock/record-dock.component';
import {WorkRecordScreen} from '../screens/app-user/work-record/work-record.screen';
import {RowsSetupScreen} from '../screens/app-user/rows-setup/rows-setup.screen';
import {SignInScreen} from '../screens/app-auth/sign-in/sign-in.component';
import {AppIcon} from '../shared/components/ui';
import type {AppIconName} from '../shared/components/ui/app-icon/app-icon.component';
import {useAuth} from '../shared/core/providers/auth/AuthProvider';
import {SeasonProvider} from '../shared/core/records/SeasonProvider';
import {useScale, useTheme} from '../shared/theme';
import {useThemedStyles} from '../shared/theme';
import type {AppTheme} from '../shared/theme/theme';
import type {MainTabParamList, RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const tabs: Record<keyof MainTabParamList, {label: string; icon: AppIconName}> = {
  Home: {label: 'Головна', icon: 'home'},
  Fields: {label: 'Ділянки', icon: 'plots'},
  Journal: {label: 'Журнал', icon: 'journal'},
  Money: {label: 'Гроші', icon: 'money'},
};

const tabIcons = {
  Home: ({color}: {color: string}) => <AppIcon name="home" color={color} size={26} />,
  Fields: ({color}: {color: string}) => <AppIcon name="plots" color={color} size={26} />,
  Journal: ({color}: {color: string}) => <AppIcon name="journal" color={color} size={26} />,
  Money: ({color}: {color: string}) => <AppIcon name="money" color={color} size={26} />,
};

const createLoadingStyles = (theme: AppTheme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center' as const,
  },
});

const renderTabBar = (props: BottomTabBarProps) => <TabBarWithDock {...props} />;

function MainTabs() {
  const {theme} = useTheme();
  const scale = useScale();
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          height: scale(83),
          paddingTop: scale(8),
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarLabelStyle: {fontSize: scale(13), fontWeight: '700'},
        tabBarIcon: tabIcons[route.name],
        tabBarLabel: tabs[route.name].label,
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Fields" component={FieldsScreen} />
      <Tab.Screen name="Journal" component={JournalScreen} />
      <Tab.Screen name="Money" component={MoneyScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const {theme} = useTheme();
  const {session} = useAuth();
  const loadingStyles = useThemedStyles(createLoadingStyles);
  if (session === null) {
    return (
      <View style={loadingStyles.container}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SeasonProvider key={session.kind === 'authenticated' ? session.userId : 'guest'}
      userId={session.kind === 'authenticated' ? session.userId : null}>
      <NavigationContainer
        theme={{
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: theme.colors.background,
            card: theme.colors.surface,
            text: theme.colors.text,
            border: theme.colors.border,
            primary: theme.colors.primary,
          },
        }}>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {session.kind === 'authenticated' ? (
            <>
              <Stack.Screen name="Tabs" component={MainTabs} />
              <Stack.Screen name="FieldMethod" component={FieldMethodScreen} />
              <Stack.Screen name="FieldMap" component={FieldMapScreen} />
              <Stack.Screen name="FieldWalk" component={FieldWalkScreen} />
              <Stack.Screen name="FieldForm" component={FieldFormScreen} />
              <Stack.Screen name="FieldDetail" component={FieldDetailScreen} />
              <Stack.Screen name="RowsSetup" component={RowsSetupScreen} />
              <Stack.Screen name="WorkRecord" component={WorkRecordScreen} />
              <Stack.Screen name="QuantityRecord" component={QuantityRecordScreen} />
              <Stack.Screen name="OtherRecord" component={OtherRecordScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
            </>
          ) : (
            <Stack.Screen name="SignIn" component={SignInScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SeasonProvider>
  );
}
