import React from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {RootNavigator} from './src/navigation/RootNavigator';
import {ToastProvider} from './src/shared/components/ui';
import {AuthProvider} from './src/shared/core/providers/auth/AuthProvider';
import {FarmDataProvider} from './src/shared/core/offline/FarmDataProvider';
import {SubscriptionProvider} from './src/shared/core/providers/subscription/SubscriptionProvider';
import {ThemeProvider, useTheme} from './src/shared/theme';
import {LanguageProvider, useLanguage} from './src/shared/config/i18n';

function AppContent() {
  const {theme, isDark} = useTheme();
  const {language} = useLanguage();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <RootNavigator key={language} />
    </>
  );
}

const styles = StyleSheet.create({root: {flex: 1}});

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <LanguageProvider>
          <AuthProvider>
            <FarmDataProvider>
                <SubscriptionProvider>
                  <ToastProvider>
                    <AppContent />
                  </ToastProvider>
                </SubscriptionProvider>
            </FarmDataProvider>
          </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
