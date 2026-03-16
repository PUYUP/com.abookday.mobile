import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { BookDetails } from '@/state/library/book-slice';

type Props = {
    book: BookDetails;
};

export default function BookItem({ book }: Props) {
    const totalPages = book.totalPages ?? 0;
    const lastReadPage = Math.max(0, Math.min(book.lastReadPage ?? 0, totalPages || Number.MAX_SAFE_INTEGER));

    const progress = totalPages > 0 ? Math.min(lastReadPage / totalPages, 1) : 0;
    const progressPct = Math.round(progress * 100);

    return (
        <View style={styles.container}>
            <View style={styles.cover}>
                {book.coverImageUri ? (
                    <Image source={{ uri: book.coverImageUri }} style={styles.coverImage} />
                ) : (
                    <View style={styles.coverFallback} />
                )}
            </View>

            <View style={styles.content}>
                <View style={styles.bookMeta}>
                    <Text style={styles.title} numberOfLines={book.author && book.genre ? 1 : 2}>
                        {book.title}
                    </Text>
                    {book.author && (
                        <Text style={styles.author} numberOfLines={1}>
                            {book.author}
                        </Text>
                    )}
                    {book.genre && (
                        <Text style={styles.genre}>{book.genre}</Text>
                    )}
                </View>

                <View style={styles.progressCard}>
                    <Text style={styles.pages}>{totalPages}</Text>

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
            </View>
        </View>
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
        width: 60,
        height: 90,
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
        marginTop: 2,
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
});