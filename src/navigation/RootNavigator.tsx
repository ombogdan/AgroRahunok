import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {FieldsScreen, HomeScreen, JournalScreen, MoneyScreen} from '../screens/app-user';
import {SignInScreen} from '../screens/app-auth';
import {AppIcon} from '../shared/components/ui';
import type {AppIconName} from '../shared/components/ui/AppIcon';
import {useAuth} from '../shared/core/providers/auth/AuthProvider';
import {useTheme} from '../shared/theme';
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

function MainTabs() {
  const {theme} = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          height: 83,
          paddingTop: 8,
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarLabelStyle: {fontSize: 13, fontWeight: '700'},
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
          <Stack.Screen name="Tabs" component={MainTabs} />
        ) : (
          <Stack.Screen name="SignIn" component={SignInScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
