import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BookForm, { BookFormData, BookFormHandle } from '@/components/book-form';
import { BookInsertType, insertBook } from '@/state/library/book-slice';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

export default function BookEditorScreen() {
    const theme = useTheme();
    const { mode } = useLocalSearchParams<{ mode?: string }>();
    const formRef = useRef<BookFormHandle>(null);
    const dispatch = useDispatch();
    const selectedGenres = useSelector((state: any) => state.book.selectedGenres);

    const handleSubmit = async (data: BookFormData) => {
        const payload: BookInsertType = {
            title: data.title,
            author: data.author,
            totalPages: parseInt(data.totalPages),
            genres: selectedGenres,
            ownedBy: 'user-123',
            status: data.isReading ? 'reading' : 'archive',
        }
        const result = await dispatch(insertBook(payload) as any);
        console.log('Book submitted:', result);
    };

    return (
        <React.Fragment>
            <Stack.Screen
                options={{
                    title: mode === 'edit' ? 'Edit Book' : 'Add Book',
                    headerBackTitle: 'Back',
                    headerStyle: { backgroundColor: '#fff' },
                    headerRight: () => (
                        <TouchableOpacity onPress={() => formRef.current?.submit()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <MaterialIcons name="save" size={26} color={theme.colors.primary} />
                            <Text style={{ color: theme.colors.primary, fontSize: 18, fontWeight: '600' }}>Save</Text>
                        </TouchableOpacity>
                    )
                }}
            />
            
            <SafeAreaView style={styles.container} edges={['bottom']}>
                <Stack.Screen
                    options={{
                        title: mode === 'edit' ? 'Edit Book' : 'Add Book',
                    }}
                />

                <BookForm ref={formRef} onSubmit={handleSubmit} />
            </SafeAreaView>
        </React.Fragment>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});