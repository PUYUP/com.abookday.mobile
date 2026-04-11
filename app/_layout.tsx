import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack, useFocusEffect, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

import { runMigrations } from '@/db/migrate';
import { useColorScheme } from '@/hooks/use-color-scheme';
import store from '@/state/store';
import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Provider } from 'react-redux';

export const unstable_settings = {
  anchor: '(tabs)',
};

const theme = {
  ...MD3LightTheme,
  roundness: 16,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1E90FF',
    secondary: '#ff1493',
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level2: '#f5f5f5', // Set the desired default menu background color
    },
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Set the navigation bar style
      NavigationBar.setStyle('light');
      NavigationBar.setBackgroundColorAsync(theme.colors.elevation.level2);
    }

    (async () => {
      await runMigrations();
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        // Cleanup when navigating away
        console.log('Leaving BookEditor screen');
        console.log(pathname)
      };
    }, [])
  );


  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <PaperProvider theme={theme}>
          <KeyboardProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
          </KeyboardProvider>
          <StatusBar style="auto" />
        </PaperProvider>
      </ThemeProvider>
    </Provider>
  );
}
