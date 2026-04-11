import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BookForm, { BookFormData, BookFormHandle } from '@/components/book-form';
import { BookInsertType, deleteBook, getBook, insertBook } from '@/state/library/book-slice';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Button, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

export default function BookEditorScreen() {
    const theme = useTheme();
    const { mode, bookId } = useLocalSearchParams<{ mode?: string, bookId?: string }>();
    const formRef = useRef<BookFormHandle>(null);
    const dispatch = useDispatch();
    const router = useRouter();

    const { entity: bookDetail, loading, error } = useSelector((state: any) => state.book);

    // Fetch book detail when bookId is available
    useEffect(() => {
        if (bookId) {
            dispatch(getBook(parseInt(bookId)) as any);
        }
    }, [bookId]);

    // Derive initial form data from fetched book
    const initialData: BookFormData | undefined = bookDetail && bookId
        ? {
            title: bookDetail.title,
            author: bookDetail.author,
            totalPages: String(bookDetail.totalPages),
            genres: bookDetail.genres,
            isReading: bookDetail.status === 'reading',
        }
        : undefined;

    const handleSubmit = async (data: BookFormData) => {
        const payload: BookInsertType = {
            title: data.title,
            author: data.author,
            totalPages: parseInt(data.totalPages),
            genres: data.genres ? JSON.stringify(data.genres) : JSON.stringify([]),
            ownedBy: 'user-123',
            status: data.isReading ? 'reading' : 'archive',
        }

        try {
            const result = await dispatch(insertBook(payload) as any);
            console.log('Book submited:', result);
            router.back();
        } catch (error) {
            console.log('Book submit error:', error)
        }
    };

    const handleDelete = async () => {
        if (bookId) {
            await dispatch(deleteBook(parseInt(bookId)) as any);
            router.push('/(tabs)/library');
        }
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

                <BookForm ref={formRef} onSubmit={handleSubmit} defaultValues={initialData} />

                {mode === 'edit' && (
                    <View style={{ padding: 26 }}>
                        <TouchableOpacity onPress={async () => handleDelete()}>
                            <Button 
                                buttonColor={'#cd5c5c'} 
                                textColor={'#fff'} 
                                style={{ paddingVertical: 6 }}
                            >
                                <Text style={{ fontSize: 16 }}>Delete Book</Text>
                            </Button>
                        </TouchableOpacity>
                    </View>
                )}
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