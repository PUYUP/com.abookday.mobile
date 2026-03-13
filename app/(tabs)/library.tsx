import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Library',
          headerShadowVisible: false,
          header: () => (
            <View style={[styles.header, { paddingTop: insets.top }]}>
              {/* Back button */}
              {/* <TouchableOpacity onPress={() => router.back()}>
                <MaterialIcons name="arrow-back-ios" size={22} color={theme.colors.primary} />
              </TouchableOpacity> */}
              
              {/* Search bar */}
              <View style={styles.searchBar}>
                <TextInput style={styles.searchInput} placeholder="Search books..." autoFocus={false} />
              </View>

              {/* Placeholder for future filter/sort button */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.addBookButton} onPress={() => router.push({ pathname: '/book-editor', params: { mode: 'add' } })}>
                  <Button
                    icon={() => <MaterialIcons name="add" size={26} color={theme.colors.primary} />}
                  >
                    <Text style={{ color: theme.colors.primary, fontSize: 18, fontWeight: '600' }}>Book</Text>
                  </Button>
                </TouchableOpacity>
              </View>
            </View>
          )
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingBottom: 16,
    alignItems: 'center',
    gap: 8,
  },
  searchBar: {
    flex: 1,
  },
  searchInput: {
    backgroundColor: '#fff',
    height: 36,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    fontSize: 14,
  },
  actionsContainer: {
  },
  addBookButton: {
    width: 80,
  }
});
