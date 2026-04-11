import React from 'react';
import { StyleSheet, View } from 'react-native';

import { SessionData } from '@/state/reading/reading-slice';

import { BookSelectType } from '@/state/library/book-slice';
import SessionItem from './session-item';

const SAMPLE_SESSIONS: SessionData[] = [
    {
        bookId: '1',
        bookTitle: 'The Midnight Library',
        startPage: 1,
        lastPage: 42,
        mood: 'thoughtful',
        startTime: '2025-06-01T07:30:00Z',
        endTime: '2025-06-01T08:05:00Z',
        timer: [
            { action: 'start', time: '2025-06-01T07:30:00Z' },
            { action: 'finish', time: '2025-06-01T08:05:00Z' },
        ],
        note: 'Lovely pacing so far.',
    },
    {
        bookId: '2',
        bookTitle: 'Atomic Habits',
        startPage: 120,
        lastPage: 168,
        mood: 'inspired',
        startTime: '2025-06-02T06:10:00Z',
        endTime: '2025-06-02T07:15:00Z',
        timer: [
            { action: 'start', time: '2025-06-02T06:10:00Z' },
            { action: 'pause', time: '2025-06-02T06:35:00Z', timerAtPause: '2025-06-02T06:35:00Z' },
            { action: 'resume', time: '2025-06-02T06:50:00Z', timerAtResume: '2025-06-02T06:50:00Z' },
            { action: 'finish', time: '2025-06-02T07:15:00Z' },
        ],
        note: 'Systems > goals reminder.',
    },
    {
        bookId: '3',
        bookTitle: 'Educated',
        startPage: 210,
        lastPage: 244,
        mood: 'emotional',
        startTime: '2025-06-03T09:00:00Z',
        endTime: '2025-06-03T09:40:00Z',
        timer: [
            { action: 'start', time: '2025-06-03T09:00:00Z' },
            { action: 'finish', time: '2025-06-03T09:40:00Z' },
        ],
        note: 'Hard to put down.',
    },
    {
        bookId: '4',
        bookTitle: 'Project Hail Mary',
        startPage: 58,
        lastPage: 102,
        mood: 'happy',
        startTime: '2025-06-04T20:15:00Z',
        endTime: '2025-06-04T21:05:00Z',
        timer: [
            { action: 'start', time: '2025-06-04T20:15:00Z' },
            { action: 'finish', time: '2025-06-04T21:05:00Z' },
        ],
        note: 'Ryland + Rocky ❤️',
    },
    {
        bookId: '5',
        bookTitle: 'Braiding Sweetgrass',
        startPage: 145,
        lastPage: 188,
        mood: 'calm',
        startTime: '2025-06-05T05:55:00Z',
        endTime: '2025-06-05T06:30:00Z',
        timer: [
            { action: 'start', time: '2025-06-05T05:55:00Z' },
            { action: 'finish', time: '2025-06-05T06:30:00Z' },
        ],
        note: 'Gentle morning read.',
    },
    {
        bookId: '6',
        bookTitle: 'Sapiens',
        startPage: 10,
        lastPage: 48,
        mood: 'thoughtful',
        startTime: '2025-06-06T12:05:00Z',
        endTime: '2025-06-06T13:00:00Z',
        timer: [
            { action: 'start', time: '2025-06-06T12:05:00Z' },
            { action: 'pause', time: '2025-06-06T12:25:00Z', timerAtPause: '2025-06-06T12:25:00Z' },
            { action: 'resume', time: '2025-06-06T12:40:00Z', timerAtResume: '2025-06-06T12:40:00Z' },
            { action: 'finish', time: '2025-06-06T13:00:00Z' },
        ],
    },
    {
        bookId: '7',
        bookTitle: 'The Psychology of Money',
        startPage: 1,
        lastPage: 32,
        mood: 'calm',
        startTime: '2025-06-07T15:20:00Z',
        endTime: '2025-06-07T15:55:00Z',
        timer: [
            { action: 'start', time: '2025-06-07T15:20:00Z' },
            { action: 'finish', time: '2025-06-07T15:55:00Z' },
        ],
        note: 'Makes me want to be a better steward of my resources. Can\'t wait to read more.',
    },
    {
        bookId: '8',
        bookTitle: 'Deep Work',
        startPage: 80,
        lastPage: 126,
        mood: 'inspired',
        timer: [
            { action: 'start', time: '2025-06-08T04:30:00Z' },
            { action: 'finish', time: '2025-06-08T05:05:00Z' },
        ],
    },
    {
        bookId: '9',
        bookTitle: 'Clean Code',
        startPage: 200,
        lastPage: 242,
        mood: 'thoughtful',
        startTime: '2025-06-09T18:10:00Z',
        endTime: '2025-06-09T18:55:00Z',
        timer: [
            { action: 'start', time: '2025-06-09T18:10:00Z' },
            { action: 'finish', time: '2025-06-09T18:55:00Z' },
        ],
        note: 'Refactoring checklist forming.',
    },
    {
        bookId: '10',
        bookTitle: 'The Pragmatic Programmer',
        startPage: 50,
        lastPage: 94,
        mood: 'happy',
        startTime: '2025-06-10T07:00:00Z',
        endTime: '2025-06-10T07:42:00Z',
        timer: [
            { action: 'start', time: '2025-06-10T07:00:00Z' },
            { action: 'finish', time: '2025-06-10T07:42:00Z' },
        ],
        note: 'Tracer bullets idea clicked.',
    },
];

type Props = {
    sessions?: SessionData[];
    book?: BookSelectType;
};

export default function SessionList({ sessions = SAMPLE_SESSIONS, book }: Props) {
    return (
        <View style={styles.container}>
            {sessions.map((session) => (
                <SessionItem
                    key={`${session.bookId}-${session.lastPage ?? 0}-${session.timer[0]?.time}`}
                    session={session}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
    },
});