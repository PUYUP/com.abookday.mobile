import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BookForm, { BookFormData, BookFormHandle } from '@/components/book-form';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from 'react-native-paper';

export default function BookEditorScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { mode } = useLocalSearchParams<{ mode?: string }>();
    const formRef = useRef<BookFormHandle>(null);

    const handleSubmit = (data: BookFormData) => {
        console.log('Book submitted:', data);
    };

    return (
        <React.Fragment>
            <Stack.Screen
                options={{
                    headerStyle: { backgroundColor: '#fff' },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                            <MaterialIcons name="arrow-back-ios" size={22} color={theme.colors.primary} />
                            <Text style={{ color: theme.colors.primary, fontSize: 18, fontWeight: '600' }}>Back</Text>
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity onPress={() => formRef.current?.submit()} style={{ padding: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <MaterialIcons name="check" size={26} color={theme.colors.primary} />
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