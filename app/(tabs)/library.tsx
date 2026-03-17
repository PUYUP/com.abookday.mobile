import BookItem from '@/components/book-item';
import { BookDetails } from '@/state/library/book-slice';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const BOOKS: BookDetails[] = [
  {
    id: '1',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    genre: 'Fiction',
    coverImageUri: 'https://images.unsplash.com/photo-1544931219-17beab1abd6c',
    description: 'A woman explores parallel lives in a mysterious library.',
    totalPages: 304,
    lastReadPage: 76,
    status: 'paused',
  },
  {
    id: '2',
    title: 'Atomic Habits',
    author: 'James Clear',
    genre: 'Self-Help',
    coverImageUri: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f',
    description: 'Tiny habits compounding into remarkable results.',
    totalPages: 320,
    lastReadPage: 120,
    status: 'finished',
  },
  {
    id: '3',
    title: 'Educated',
    author: 'Tara Westover',
    genre: 'Memoir',
    coverImageUri: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d',
    description: 'A memoir about a woman who leaves her survivalist family to learn.',
    totalPages: 352,
    lastReadPage: 210,
    status: 'reading',
  },
  {
    id: '4',
    title: 'Project Hail Mary with Sebastian Junger the Villages',
    author: 'Andy Weir',
    genre: 'Science Fiction',
    coverImageUri: 'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7',
    description: 'A lone astronaut must save Earth from a dying sun.',
    totalPages: 476,
    lastReadPage: 58,
    status: 'reading',
  },
  {
    id: '5',
    title: 'Braiding Sweetgrass',
    author: 'Robin Wall Kimmerer',
    genre: 'Nature',
    coverImageUri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    description: 'Indigenous wisdom and plant science woven together.',
    totalPages: 408,
    lastReadPage: 145,
    status: 'archived',
  },
];

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  
  return (
    <React.Fragment>
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

      <SafeAreaView style={styles.safeArea} edges={[]}>
        <ScrollView nestedScrollEnabled={true}>
          <View style={styles.scrollContent}>
            {BOOKS.map((book) => (
              <View key={book.id} style={styles.bookCardWrapper}>
                <BookItem book={book} />
              </View>
            ))}
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
});
