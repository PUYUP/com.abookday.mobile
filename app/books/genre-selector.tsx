import { Genre, GENRES } from '@/db/schema/book';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Checkbox, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

export default function GenreSelector() {
    const dispatch = useDispatch();
    const router = useRouter();
    const theme = useTheme();
    const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
    const selectedGenres = useSelector((state: any) => state.book.selectedGenres);

    const data = useMemo(() => GENRES, []);

    useEffect(() => {
        // Initialize selectedCodes from Redux state
        console.log(selectedGenres)
        const codes = new Set<string>(selectedGenres.map((g: Genre) => g.code));
        setSelectedCodes(codes);
    }, []);

    const toggleGenre = (code: string) => {
        setSelectedCodes((prev) => {
            const next = new Set(prev);
            if (next.has(code)) {
                next.delete(code);
            } else {
                next.add(code);
            }
            return next;
        });
    };

    const finishHandler = () => {
        const payload: Genre[] = GENRES.filter(({ code }) => selectedCodes.has(code));
        dispatch({
            type: 'book/setGenres',
            payload,
        });
        router.back();
    }

    const renderItem = ({ item }: { item: { code: string; genre: string } }) => {
        const checked = selectedCodes.has(item.code);
        return (
            <Pressable
                onPress={() => toggleGenre(item.code)}
                style={styles.row}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
            >
                <View style={styles.textWrapper}>
                    <Text style={styles.genre}>{item.genre}</Text>
                    <Text style={styles.code}>{item.code}</Text>
                </View>
                <Checkbox
                    status={checked ? 'checked' : 'unchecked'}
                    onPress={() => toggleGenre(item.code)}
                />
            </Pressable>
        );
    };

    return (
        <React.Fragment>
            <Stack.Screen
                options={{
                    title: 'Select Genre',
                    headerBackTitle: 'Back',
                    headerRight: () => (
                        <TouchableOpacity onPress={finishHandler} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={{ color: theme.colors.primary, fontSize: 18, fontWeight: '600' }}>Done</Text>
                        </TouchableOpacity>
                    )
                }}
            />
            
            <SafeAreaView style={styles.container} edges={['bottom']}>
                <FlatList
                    data={data}
                    keyExtractor={(item) => item.code}
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => <View style={styles.divider} />}
                    contentContainerStyle={styles.listContent}
                />
            </SafeAreaView>
        </React.Fragment>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        gap: 12,
        justifyContent: 'space-between',
    },
    textWrapper: {
        flex: 1,
    },
    genre: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    code: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#d2d4d6',
    },
});