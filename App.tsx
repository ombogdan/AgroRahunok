import React from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {RootNavigator} from './src/navigation/RootNavigator';
import {ToastProvider} from './src/shared/components/ui';
import {AuthProvider} from './src/shared/core/providers/auth/AuthProvider';
import {FieldsProvider} from './src/shared/core/fields/FieldsProvider';
import {RecordsProvider} from './src/shared/core/records/RecordsProvider';
import {SubscriptionProvider} from './src/shared/core/providers/subscription/SubscriptionProvider';
import {ThemeProvider, useTheme} from './src/shared/theme';

function AppContent() {
  const {theme, isDark} = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <RootNavigator />
    </>
  );
}

const styles = StyleSheet.create({root: {flex: 1}});

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <FieldsProvider>
              <RecordsProvider>
                <SubscriptionProvider>
                  <ToastProvider>
                    <AppContent />
                  </ToastProvider>
                </SubscriptionProvider>
              </RecordsProvider>
            </FieldsProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
