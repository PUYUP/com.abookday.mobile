import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SessionData } from '@/state/reading/reading-slice';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { differenceInMinutes, format } from 'date-fns';

type Props = {
    session: SessionData;
};

const MOOD_EMOJI: Record<NonNullable<SessionData['mood']>, string> = {
    happy: '😊',
    calm: '😌',
    thoughtful: '🤔',
    inspired: '😮',
    emotional: '😭',
    sleepy: '😴',
};

function formatDuration(startTime?: string, endTime?: string): string | null {
    if (!startTime || !endTime) return null;
    const minutes = differenceInMinutes(new Date(endTime), new Date(startTime));
    return minutes > 0 ? `${minutes} min` : null;
}

export default function SessionItem({ session }: Props) {
    const pagesRead = (session.lastPage ?? 0) - session.startPage;
    const duration = formatDuration(session.startTime, session.endTime);
    const moodEmoji = session.mood ? MOOD_EMOJI[session.mood] : null;

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: session.note ? 'flex-start' : 'center' }}>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {session.startTime && (
                            <React.Fragment>
                                <Text style={styles.value}>
                                    {format(new Date(session.startTime), 'PPP')}
                                </Text>
                                <MaterialIcons name="circle" size={4} color="#718096" />
                            </React.Fragment>
                        )}

                        {duration && (
                            <React.Fragment>
                                <Text style={styles.value}>{duration}</Text>
                                <MaterialIcons name="circle" size={4} color="#718096" />
                            </React.Fragment>
                        )}

                        <Text style={styles.value}>{pagesRead} pages</Text>
                    </View>
                </View>

                {moodEmoji && (
                    <View style={[styles.mood, !session.note && styles.moodInline]}>
                        <Text style={styles.moodText}>{moodEmoji}</Text>
                    </View>
                )}
            </View>

            {session.note && (
                <View style={styles.noteRow}>
                    <Text style={styles.noteText}>{session.note}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#fff',
        borderRadius: 18,
        marginBottom: 12,
        position: 'relative',
    },
    mood: {
        alignItems: 'center',
        position: 'absolute',
        top: -2,
        right: -4,
    },
    moodInline: {
        position: 'relative',
        top: 0,
    },
    moodText: {
        fontSize: 26,
        marginTop: -4,
    },
    value: {
        fontSize: 14,
        color: '#2d3748',
    },
    noteRow: {
        paddingTop: 6,
    },
    noteText: {
        fontSize: 16,
    },
});