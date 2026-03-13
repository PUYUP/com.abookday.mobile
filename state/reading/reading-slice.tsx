import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// BUG FIX: MoodOption was `'happy' | 'sad' | 'neutral' | 'excited' | 'bored' | 'sleepy'`
// which did not match the mood ids used in SessionEndedScreen
// (`'calm' | 'thoughtful' | 'inspired' | 'emotional'`). Unified to a single
// source of truth that matches the MOOD_OPTIONS constant in the UI.
export type MoodOption =
  | 'happy'
  | 'calm'
  | 'thoughtful'
  | 'inspired'
  | 'emotional'
  | 'sleepy';

export type ActionLog = 'start' | 'pause' | 'resume' | 'finish';

// BUG FIX: Added 'finished' status to distinguish between a session that has
// completed naturally (timer stopped, waiting to be saved) vs one that has
// been fully saved and cleared. This prevents finishReading and stopReading
// from both collapsing into 'stopped', which made it impossible to know
// whether sessionData was safe to read or already stale.
export type ReadingStatus = 'reading' | 'paused' | 'stopped' | 'finished';

export interface TimerLog {
  action: ActionLog;
  time: string;
  timerAtPause?: string;
  timerAtResume?: string;
}

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

export interface BookData {
  id: string;
  title: string;
  genre: string;
  author?: string;
}

export interface ReadingState {
  status: ReadingStatus;
  sessionData: SessionData | null;
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: ReadingState = {
  status: 'stopped',
  sessionData: null,
};

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

export const readingSlice = createSlice({
  name: 'reading',
  initialState,
  reducers: {
    // BUG FIX: Was spreading `state.sessionData` into the new session, causing
    // stale fields (mood, note, lastPage) from a previous session to bleed in.
    // Now always initialises a clean SessionData object from the payload.
    //
    // BUG FIX: Was using object spread (`return { ...state, ... }`) instead of
    // Immer mutation, which is inconsistent with the other reducers and can
    // bypass Immer's draft proxy for nested objects. Switched to direct mutation.
    startReading: (state, action: PayloadAction<StartSessionPayload>) => {
      state.status = 'reading';
      state.sessionData = {
        bookId: action.payload.bookId,
        bookTitle: action.payload.bookTitle,
        timer: action.payload.timer,
        // mood, lastPage, note intentionally omitted — set only on save
      };
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

    // BUG FIX: Previously set status to 'stopped' — same as stopReading —
    // making it impossible to distinguish "timer done, awaiting save form"
    // from "fully saved and cleared". Now sets 'finished' so SessionEndedScreen
    // knows sessionData is populated and ready to be decorated with mood/page/note.
    finishReading: (state, action: PayloadAction<{ timer: TimerLog[] }>) => {
      state.status = 'finished';
      if (state.sessionData) {
        state.sessionData.timer = action.payload.timer;
      }
    },

    // BUG FIX: Was leaving sessionData populated after stopping. Any component
    // that reads from sessionData while status === 'stopped' would see ghost
    // data from the previous session. Now clears everything back to initial state.
    stopReading: () => initialState,
  },
});

export const {
  startReading,
  stopReading,
  pauseReading,
  resumeReading,
  finishReading,
} = readingSlice.actions;

export default readingSlice.reducer;