import BookItem from '@/components/book-item';
import ReadingStatsBook from '@/components/stats-reading-book';
import { BookSelectType, getBooks } from '@/state/library/book-slice';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { entities: books, loading, error } = useSelector((state: any) => state.book);

  useEffect(() => {
    dispatch(getBooks({ page: 1, limit: 20 }) as any);
  }, [dispatch]);
  
  return (
    <React.Fragment>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Library',
          headerShadowVisible: false,
          header: () => (
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
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
                <TouchableOpacity style={styles.addBookButton} onPress={() => router.push({ pathname: '/books/book-editor', params: { mode: 'add' } })}>
                  <Button
                    icon={() => <MaterialIcons name="add" size={26} color={theme.colors.primary} />}
                  >
                    <Text style={{ color: theme.colors.primary, fontSize: 18, fontWeight: '600' }}>Add Book</Text>
                  </Button>
                </TouchableOpacity>
              </View>
            </View>
          )
        }}
      />

      <SafeAreaView style={styles.safeArea} edges={[]}>
        <ScrollView nestedScrollEnabled={true}>
          <View style={styles.scrollContent}>
            <View style={{ marginBottom: 16 }}>
              <ReadingStatsBook />
            </View>

            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : error ? (
              <View style={styles.centerContainer}>
                <Text style={{ color: 'red', fontSize: 16 }}>Error loading books: {error}</Text>
              </View>
            ) : books.length === 0 ? (
              <View style={styles.centerContainer}>
                <Text style={{ fontSize: 16, color: '#999' }}>No books found. Add your first book!</Text>
              </View>
            ) : (
              books.map((book: BookSelectType) => (
                <View key={book.id} style={styles.bookCardWrapper}>
                  <BookItem book={book} />
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingLeft: 16,
    paddingBottom: 16,
    alignItems: 'center',
    gap: 8,
  },
  searchBar: {
    flex: 1,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  actionsContainer: {
  },
  addBookButton: {
    width: 'auto',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    flex: 1,
  },
  bookCardWrapper: {
    marginBottom: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
});
