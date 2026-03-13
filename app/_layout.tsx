import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import store from '@/state/store';
import { useEffect } from 'react';
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

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Set the navigation bar style
      NavigationBar.setStyle('light');
      NavigationBar.setBackgroundColorAsync(theme.colors.elevation.level2);
    }
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <PaperProvider theme={theme}>
          <KeyboardProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              <Stack.Screen name="session-ended" options={{ presentation: 'fullScreenModal', headerShown: false }} />
              <Stack.Screen name="adjust-goal" options={{ title: 'Adjust Goal', presentation: 'fullScreenModal', headerBackTitle: 'Back' }} />
              <Stack.Screen name="book-editor" options={{ title: 'Book Editor', headerBackTitle: 'Back' }} />
              <Stack.Screen name="genre-selector" options={{ title: 'Select Genre', presentation: 'fullScreenModal', headerBackTitle: 'Back' }} />
            </Stack>
          </KeyboardProvider>
          <StatusBar style="auto" />
        </PaperProvider>
      </ThemeProvider>
    </Provider>
  );
}
