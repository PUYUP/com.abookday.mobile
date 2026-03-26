import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Set the navigation bar style
      NavigationBar.setButtonStyleAsync('light'); // Light buttons for dark background
    }
}, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#f5f5f5',
          height: Platform.OS === 'android' ? 102 : 80,
          elevation: 0, // for Android
          shadowOpacity: 0, // for iOS
          borderTopWidth: 0, // Also useful for some cases
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => <MaterialIcons name="book" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="clubs"
        options={{
          title: 'Clubs',
          tabBarIcon: ({ color }) => <MaterialIcons name="nature-people" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="insight"
        options={{
          title: 'Insight',
          tabBarIcon: ({ color }) => <MaterialIcons name="insights" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
