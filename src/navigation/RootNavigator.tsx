import React from 'react';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StyleSheet, Text} from 'react-native';
import {
  FieldDetailScreen,
  FieldsScreen,
  HomeScreen,
  InsightsScreen,
  JournalScreen,
  ProfileScreen,
  QuickEntryScreen,
} from '../screens/app-user';
import {SignInScreen} from '../screens/app-auth';
import {useTheme} from '../shared/theme';
import type {MainTabParamList, RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const tabs = {
  Home: {label: 'Головна', symbol: '⌂'},
  Fields: {label: 'Ділянки', symbol: '▧'},
  Journal: {label: 'Журнал', symbol: '≡'},
  Insights: {label: 'Підсумки', symbol: '▥'},
  Profile: {label: 'Профіль', symbol: '◯'},
} as const;

const styles = StyleSheet.create({tabSymbol: {fontSize: 22}});

function TabSymbol({name, color}: {name: keyof MainTabParamList; color: string}) {
  return <Text style={[styles.tabSymbol, {color}]}>{tabs[name].symbol}</Text>;
}

const tabIcons = {
  Home: ({color}: {color: string}) => <TabSymbol name="Home" color={color} />,
  Fields: ({color}: {color: string}) => <TabSymbol name="Fields" color={color} />,
  Journal: ({color}: {color: string}) => <TabSymbol name="Journal" color={color} />,
  Insights: ({color}: {color: string}) => <TabSymbol name="Insights" color={color} />,
  Profile: ({color}: {color: string}) => <TabSymbol name="Profile" color={color} />,
};

function MainTabs() {
  const {theme} = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarLabelStyle: {fontSize: 12, fontWeight: '600'},
        tabBarIcon: tabIcons[route.name],
        tabBarLabel: tabs[route.name].label,
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Fields" component={FieldsScreen} />
      <Tab.Screen name="Journal" component={JournalScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const {theme} = useTheme();
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
      <Stack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: theme.colors.surface},
          headerTintColor: theme.colors.text,
          contentStyle: {backgroundColor: theme.colors.background},
        }}>
        <Stack.Screen
          name="Tabs"
          component={MainTabs}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="FieldDetail"
          component={FieldDetailScreen}
          options={{title: 'Ділянка'}}
        />
        <Stack.Screen
          name="QuickEntry"
          component={QuickEntryScreen}
          options={{title: 'Швидкий запис'}}
        />
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{title: 'Вхід'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
