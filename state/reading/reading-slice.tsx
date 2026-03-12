import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type MoodOption = 'happy' | 'sad' | 'neutral' | 'excited' | 'bored' | 'sleepy';
export type ActionLog = 'start' | 'pause' | 'resume' | 'finish';
export type ReadingStatus = 'reading' | 'paused' | 'stopped';

export interface SessionData {
    bookId: string;
    bookTitle: string;
    mood?: MoodOption;
    lastPage?: string;
    timer: TimerLog[];
    note?: string;
}

export interface StartSessionPayload {
    bookId: string;
    bookTitle: string;
    startPage: string;
    timer: TimerLog[];
}

export interface TimerLog {
    action: ActionLog;
    time: string;
    timerAtPause?: string;
    timerAtResume?: string;
}

export interface ReadingState {
  status: ReadingStatus;
  sessionData: SessionData | null;
}

export interface BookData {
    id: string;
    title: string;
    genre: string;
    author?: string;
}

const initialState: ReadingState = {
    status: 'stopped',
    sessionData: null,
};

export const readingSlice = createSlice({
    name: 'reading',
    initialState,
    reducers: {
        startReading: (state, action: PayloadAction<StartSessionPayload>) => {
            return {
                ...state,
                status: 'reading',
                sessionData: {
                    ...state.sessionData,
                    ...action.payload,
                },
            }
        },
        stopReading: (state) => {
            state.status = 'stopped';
        },
        pauseReading: (state, action: PayloadAction<{ timer: TimerLog[] }>) => {
            state.status = 'paused';
            if (state.sessionData) {
                state.sessionData.timer = action.payload.timer;
            }
        },
        resumeReading: (state, action: PayloadAction<{ timer: TimerLog[] }>) => {
            state.status = 'reading';
            if (state.sessionData) {
                state.sessionData.timer = action.payload.timer;
            }
        },
        finishReading: (state, action: PayloadAction<{ timer: TimerLog[] }>) => {
            state.status = 'stopped';
            if (state.sessionData) {
                state.sessionData.timer = action.payload.timer;
            }
        },
    },
});

export const { startReading, stopReading, pauseReading, resumeReading, finishReading } = readingSlice.actions;

export default readingSlice.reducer;