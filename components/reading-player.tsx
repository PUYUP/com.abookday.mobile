import { BookData, StartSessionPayload, TimerLog } from '@/state/reading/reading-slice';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BOOK_DATA: BookData = {
  id: '1',
  title: 'Dari Logika Mistika, Lewat Filsafat, Menuju Ilmu Pengetahuan',
  author: 'Cania Citta',
  genre: 'Novel',
};

type Status = 'stopped' | 'reading' | 'paused';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatTime = (totalSeconds: number): string => {
  const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const secs = (totalSeconds % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
};

const nowISO = () => new Date().toISOString();

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReadingPlayer() {
  const router = useRouter();
  const theme = useTheme();
  const dispatch = useDispatch();
  const readingState = useSelector((state: any) => state.reading);

  const [status, setStatus] = useState<Status>('stopped');
  const [seconds, setSeconds] = useState(0);

  // BUG FIX: Use a ref for the action log so mutations are immediately
  // visible to handlers without waiting for a re-render cycle.
  // We also keep a state copy so the component re-renders when the log changes.
  const actionLogRef = useRef<TimerLog[]>([]);
  const [, forceUpdate] = useState(0); // trigger re-render when log mutates

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const spinAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  // BUG FIX: Track whether the stop was initiated internally to avoid the
  // Redux-watcher → handleStop → dispatch loop.
  const isStoppingRef = useRef(false);

  // -------------------------------------------------------------------------
  // Log helpers — operate on the ref so handlers always see the latest state
  // -------------------------------------------------------------------------

  const appendLog = useCallback((entry: TimerLog) => {
    actionLogRef.current = [...actionLogRef.current, entry];
    forceUpdate((n) => n + 1);
  }, []);

  // BUG FIX: patchLastPauseWithResume now receives the exact same timestamp
  // that was already written into the resume log entry for consistency.
  const patchLastPauseWithResume = useCallback((timerAtResume: string) => {
    const log = [...actionLogRef.current];
    for (let i = log.length - 1; i >= 0; i--) {
      if (log[i].action === 'pause') {
        log[i] = { ...log[i], timerAtResume };
        break;
      }
    }
    actionLogRef.current = log;
    forceUpdate((n) => n + 1);
  }, []);

  const resetLog = useCallback(() => {
    actionLogRef.current = [];
    forceUpdate((n) => n + 1);
  }, []);

  // -------------------------------------------------------------------------
  // Timer
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (status === 'reading') {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status]);

  // -------------------------------------------------------------------------
  // Vinyl spin animation
  // BUG FIX: Reset spinAnim to 0 when stopping so the next start has no jump.
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (status === 'reading') {
      spinAnimRef.current = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spinAnimRef.current.start();
    } else {
      spinAnimRef.current?.stop();
      spinAnimRef.current = null;
      if (status === 'stopped') {
        spinAnim.setValue(0);
      }
    }
  }, [status, spinAnim]);

  // -------------------------------------------------------------------------
  // Redux status watcher
  // BUG FIX: Guard with isStoppingRef to prevent recursive stop dispatch.
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (readingState.status === 'stopped' && !isStoppingRef.current) {
      handleStop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readingState.status]);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleRead = useCallback(() => {
    if (status === 'reading') return;

    const time = nowISO();

    if (status === 'paused') {
      // BUG FIX: patch and append use the same timestamp.
      patchLastPauseWithResume(time);
      appendLog({ action: 'resume', time });
    } else {
      appendLog({ action: 'start', time });
    }

    setStatus('reading');

    // BUG FIX: Build the payload from the ref (already updated above) rather
    // than from a potentially-stale state variable.
    const payload: StartSessionPayload = {
      bookId: BOOK_DATA.id,
      bookTitle: BOOK_DATA.title,
      startPage: '1',
      timer: [...actionLogRef.current],
    };

    dispatch({ type: 'reading/startReading', payload });
  }, [status, appendLog, patchLastPauseWithResume, dispatch]);

  const handlePause = useCallback(
    (action: string = '') => {
      if (status === 'reading') {
        const time = nowISO();
        appendLog({ action: 'pause', time, timerAtPause: time, timerAtResume: undefined });
        setStatus('paused');

        // BUG FIX: dispatch after appending so the payload includes the new entry.
        dispatch({
          type: 'reading/pauseReading',
          payload: { timer: [...actionLogRef.current] },
        });
      }

      if (action === 'stopped') {
        router.push('/session-ended');
      }
    },
    [status, appendLog, dispatch, router]
  );

  // BUG FIX: handleStop is now idempotent — guarded by isStoppingRef so it
  // never triggers a second dispatch cycle from the Redux watcher.
  const handleStop = useCallback(() => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;

    const finishEntry: TimerLog = { action: 'finish', time: nowISO() };
    const finalLog = [...actionLogRef.current, finishEntry];

    dispatch({ type: 'reading/finishReading', payload: { timer: finalLog } });

    setStatus('stopped');
    setSeconds(0);
    resetLog();

    isStoppingRef.current = false;
  }, [dispatch, resetLog]);

  // -------------------------------------------------------------------------
  // Derived values
  // -------------------------------------------------------------------------

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const isActive = status === 'reading' || status === 'paused';

  const playPauseIcon =
    status === 'reading' ? 'pause' : status === 'paused' ? 'play-arrow' : 'play-lesson';

  const playPauseLabel =
    status === 'reading' ? 'Pause' : status === 'paused' ? 'Resume' : 'Read';

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <React.Fragment>
      <View style={styles.card}>
        {/* Top row */}
        <View style={styles.topRow}>
          <View style={styles.albumArt}>
            <View style={styles.albumArtInner}>
              <Animated.View
                style={[styles.vinylRing, { transform: [{ rotate: spin }] }]}
              />
              <Text style={styles.albumLabel}>PAUL'S</Text>
            </View>
          </View>

          <View style={styles.songInfo}>
            <View style={styles.songMeta}>
              <Text style={styles.songTitle} numberOfLines={2}>
                {BOOK_DATA.title}
              </Text>
              {BOOK_DATA.author && (
                <Text style={styles.songArtist}>{BOOK_DATA.author}</Text>
              )}
              <Text style={styles.songAlbum}>{BOOK_DATA.genre.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Bottom row */}
        <View style={styles.bottomRow}>
          <View style={styles.progressRow}>
            {status === 'stopped' ? (
              <>
                <View style={styles.progressMeta}>
                  <Text style={styles.progressLabel}>Pages</Text>
                  <Text style={styles.progressValue}>873</Text>
                </View>
                <View style={styles.progressMeta}>
                  <Text style={styles.progressLabel}>Left</Text>
                  <Text style={styles.progressValue}>34</Text>
                </View>
                <View style={styles.progressMeta}>
                  <Text style={styles.progressLabel}>Track</Text>
                  <Text style={[styles.progressValue, { color: '#2e8b57' }]}>74%</Text>
                </View>
              </>
            ) : (
              <Text style={styles.timer}>{formatTime(seconds)}</Text>
            )}
          </View>

          <View style={styles.controls}>
            <Button
              icon={() => (
                <MaterialIcons
                  name={playPauseIcon}
                  color={theme.colors.primary}
                  size={status === 'stopped' ? 22 : 26}
                />
              )}
              onPress={status === 'reading' ? () => handlePause() : handleRead}
              style={[
                styles.controlButton,
                { backgroundColor: 'rgba(30,144,255,0.05)' },
                status === 'stopped' && { width: 'auto' },
              ]}
              labelStyle={{ marginLeft: status === 'stopped' ? 14 : 10 }}
            >
              {playPauseLabel}
            </Button>

            {isActive && (
              <Button
                icon={() => <MaterialIcons name="check" color="#2e8b57" size={26} />}
                onPress={() => handlePause('stopped')}
                textColor="#2e8b57"
                style={[styles.controlButton, { backgroundColor: 'rgba(46,139,87,0.1)' }]}
                labelStyle={{ marginLeft: 10 }}
              >
                Finish
              </Button>
            )}
          </View>
        </View>
      </View>
    </React.Fragment>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#dcdcdc',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    paddingBottom: 12,
  },
  albumArt: {
    width: 74,
    height: 84,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
  },
  albumArtInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  vinylRing: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  albumLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 8,
    letterSpacing: 1,
    fontWeight: '500',
  },
  songInfo: {
    flex: 1,
    flexDirection: 'row',
  },
  songMeta: {
    flex: 1,
  },
  songTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  songArtist: {
    fontSize: 13,
    color: '#888',
    fontWeight: '400',
  },
  songAlbum: {
    fontSize: 10,
    color: '#a3a3a3',
    fontWeight: '300',
    marginTop: 2,
    letterSpacing: 0.8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingTop: 0,
    paddingHorizontal: 12,
    paddingLeft: 20,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 100,
  },
  timer: {
    fontSize: 20,
    fontWeight: '800',
    color: '#666',
    letterSpacing: 0.5,
    fontFamily: 'Courier New, monospace',
  },
  progressRow: {
    flexDirection: 'row',
  },
  progressMeta: {
    width: 60,
  },
  progressLabel: {
    fontSize: 11,
    color: '#888',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
});