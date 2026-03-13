import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Checkbox, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const GENRES = [
  {"code":"ANT000000","genre":"Antiques & Collectibles"},
  {"code":"ARC000000","genre":"Architecture"},
  {"code":"ART000000","genre":"Art"},
  {"code":"BIB000000","genre":"Bibles"},
  {"code":"BIO000000","genre":"Biography & Autobiography"},
  {"code":"BUS000000","genre":"Business & Economics"},
  {"code":"CGN000000","genre":"Comics & Graphic Novels"},
  {"code":"CKB000000","genre":"Cooking"},
  {"code":"COM000000","genre":"Computers"},
  {"code":"CRA000000","genre":"Crafts & Hobbies"},
  {"code":"DES000000","genre":"Design"},
  {"code":"DRA000000","genre":"Drama"},
  {"code":"EDU000000","genre":"Education"},
  {"code":"FAM000000","genre":"Family & Relationships"},
  {"code":"FIC000000","genre":"Fiction"},
  {"code":"FOR000000","genre":"Foreign Language Study"},
  {"code":"GAM000000","genre":"Games"},
  {"code":"GAR000000","genre":"Gardening"},
  {"code":"HEA000000","genre":"Health & Fitness"},
  {"code":"HIS000000","genre":"History"},
  {"code":"HOM000000","genre":"House & Home"},
  {"code":"HUM000000","genre":"Humor"},
  {"code":"JNF000000","genre":"Juvenile Nonfiction"},
  {"code":"JUV000000","genre":"Juvenile Fiction"},
  {"code":"LAN000000","genre":"Language Arts & Disciplines"},
  {"code":"LAW000000","genre":"Law"},
  {"code":"LCO000000","genre":"Literary Collections"},
  {"code":"LIT000000","genre":"Literary Criticism"},
  {"code":"MAT000000","genre":"Mathematics"},
  {"code":"MED000000","genre":"Medical"},
  {"code":"MUS000000","genre":"Music"},
  {"code":"NAT000000","genre":"Nature"},
  {"code":"OCC000000","genre":"Body, Mind & Spirit"},
  {"code":"PER000000","genre":"Performing Arts"},
  {"code":"PET000000","genre":"Pets"},
  {"code":"PHI000000","genre":"Philosophy"},
  {"code":"PHO000000","genre":"Photography"},
  {"code":"POE000000","genre":"Poetry"},
  {"code":"POL000000","genre":"Political Science"},
  {"code":"PSY000000","genre":"Psychology"},
  {"code":"REF000000","genre":"Reference"},
  {"code":"REL000000","genre":"Religion"},
  {"code":"SCI000000","genre":"Science"},
  {"code":"SEL000000","genre":"Self-Help"},
  {"code":"SOC000000","genre":"Social Science"},
  {"code":"SPO000000","genre":"Sports & Recreation"},
  {"code":"STU000000","genre":"Study Aids"},
  {"code":"TEC000000","genre":"Technology & Engineering"},
  {"code":"TRA000000","genre":"Transportation"},
  {"code":"TRU000000","genre":"True Crime"},
  {"code":"TRV000000","genre":"Travel"}
];

export default function GenreSelector() {
    const router = useRouter();
    const theme = useTheme();
    const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());

    const data = useMemo(() => GENRES, []);

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
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                            <MaterialIcons name="arrow-back-ios" size={22} color={theme.colors.primary} />
                            <Text style={{ color: theme.colors.primary, fontSize: 18, fontWeight: '600' }}>Back</Text>
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <MaterialIcons name="check" size={26} color={theme.colors.primary} />
                            <Text style={{ color: theme.colors.primary, fontSize: 18, fontWeight: '600' }}>Done</Text>
                        </TouchableOpacity>
                    )
                }}
            />
            
            <SafeAreaView style={styles.container}>
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