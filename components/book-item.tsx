import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BookSelectType } from '@/state/library/book-slice';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

type Props = {
    book: BookSelectType;
};

const parseGenres = (genres: any): string => {
    if (!genres) return '';
    
    let genreArray = genres;
    
    // If it's a string, try to parse it as JSON
    if (typeof genres === 'string') {
        try {
            genreArray = JSON.parse(genres);
        } catch (e) {
            return '';
        }
    }
    
    // If it's an array, extract genre names
    if (Array.isArray(genreArray)) {
        return genreArray.map((item: any) => item.genre).join(', ');
    }
    
    return '';
};

export default function BookItem({ book }: Props) {
    console.log('xx', book.genres)
    const router = useRouter();
    const totalPages = book.totalPages ?? 0;
    const lastReadPage = Math.max(0, Math.min(book.lastReadPage ?? 0, totalPages || Number.MAX_SAFE_INTEGER));

    const progress = totalPages > 0 ? Math.min(lastReadPage / totalPages, 1) : 0;
    const progressPct = Math.round(progress * 100);
    const genres = parseGenres(book.genres);
    
    return (
        <TouchableOpacity style={styles.container} onPress={() => router.push(`/books/${book.id}`)}>
            <View style={styles.cover}>
                {book.coverUrl ? (
                    <Image source={{ uri: book.coverUrl }} style={styles.coverImage} />
                ) : (
                    <View style={styles.coverFallback} />
                )}
            </View>

            <View style={styles.content}>
                <View style={styles.bookMeta}>
                    <Text style={styles.title} numberOfLines={book.author && book.genres ? 1 : 2}>
                        {book.title}
                    </Text>
                    {book.author && (
                        <Text style={styles.author} numberOfLines={1}>
                            {book.author}
                        </Text>
                    )}
                    {book.genres && (
                        <Text style={styles.genre}>{genres}</Text>
                    )}
                </View>

                <View style={styles.progressRow}>
                    {/* {book.status === 'reading' && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                            <MaterialIcons name="book" size={14} color={theme.colors.primary} />
                            <Text style={[styles.readingStatus, { color: theme.colors.primary }]}>Reading</Text>
                        </View>
                    )} */}

                    {book.status === 'finish' && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                            <MaterialIcons name="check" size={14} color="#228b22" />
                            <Text style={[styles.readingStatus, { color: '#228b22' }]}>Finished</Text>
                        </View>
                    )}

                    {book.status === 'archive' && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                            <MaterialIcons name="archive" size={14} color="#696969" />
                            <Text style={[styles.readingStatus, { color: '#696969' }]}>Archived</Text>
                        </View>
                    )}

                    {book.status === 'pause' && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                            <MaterialIcons name="pause" size={14} color="#ff8c00" />
                            <Text style={[styles.readingStatus, { color: '#ff8c00' }]}>Paused</Text>
                        </View>
                    )}
                    
                    {book.status === 'reading' && (
                        <View style={styles.progressCard}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Text style={styles.pages}>{lastReadPage}</Text>
                                <Text style={[styles.pages, { fontWeight: 'normal' }]}>of</Text>
                                <Text style={styles.pages}>{totalPages}</Text>
                                <Text style={[styles.pages, { fontWeight: 'normal' }]}>pages</Text>
                            </View>

                            <View style={styles.trackContainer}>
                                <View style={styles.track}>
                                    <View style={[styles.trackFill, { width: `${progressPct}%` }]} />
                                    <View style={[styles.trackGlow, { width: `${progressPct}%` }]} />
                                </View>
                            </View>

                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{progressPct}%</Text>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

export const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: 12,
        paddingHorizontal: 12,
        paddingVertical: 14,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    cover: {
        width: 80,
        height: 100,
        backgroundColor: '#ccc',
        borderRadius: 8,
        overflow: 'hidden',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    coverFallback: {
        flex: 1,
        backgroundColor: '#e2e8f0',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    bookMeta: {
        marginBottom: 8,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 3,
    },
    author: {
        fontSize: 13,
        color: '#475569',
    },
    genre: {
        fontSize: 12,
        color: '#64748b',
    },
    progressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        backgroundColor: '#e0f2fe',
    },
    badgeText: {
        fontSize: 12,
        color: '#0369a1',
        fontWeight: '700',
    },
    trackContainer: {
        flex: 1,
        position: 'relative',
    },
    track: {
        height: 10,
        borderRadius: 999,
        backgroundColor: '#e2e8f0',
        overflow: 'hidden',
    },
    trackFill: {
        height: '100%',
        borderRadius: 999,
        backgroundColor: '#38bdf8',
    },
    trackGlow: {
        position: 'absolute',
        height: '100%',
        borderRadius: 999,
        backgroundColor: 'rgba(59,130,246,0.18)',
    },
    pages: {
        fontSize: 12,
        color: '#1e293b',
        fontWeight: '700',
    },
    progressRow: {
        marginTop: 'auto',
    },
    readingStatus: {
        fontSize: 12,
    },
});