import { BookData, StartSessionPayload, TimerLog } from '@/state/reading/reading-slice';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Animated, Easing, LayoutChangeEvent, StyleSheet, Text, TextInput, View } from 'react-native';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import { Button, Dialog, Portal, useTheme } from 'react-native-paper';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BOOK_DATA: BookData = {
    id:     '1',
    title:  'Dari Logika Mistika, Lewat Filsafat, Menuju Ilmu Pengetahuan',
    author: 'Cania Citta',
    genre:  'Novel',
};

type Status = 'stopped' | 'reading' | 'paused';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatTime = (totalSeconds: number): string => {
    const hrs  = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
};

const nowISO = () => new Date().toISOString();

// ---------------------------------------------------------------------------
// Keyboard offset hook
// FIX: removed console.log that fired on every render.
// FIX: hook now returns both the animated style AND the raw pixel value so
//      callers can use whichever they need without running two separate
//      keyboard-tracking systems.
// ---------------------------------------------------------------------------

function useKeyboardOffset(insets: ReturnType<typeof useSafeAreaInsets>) {
    const height = useSharedValue(0);

    useKeyboardHandler(
        {
            onMove: (event) => {
                'worklet';
                height.value = withTiming(Math.max(event.height, insets.bottom), { duration: 0 });
            },
        },
        []
    );

    const animatedStyle = useAnimatedStyle(
        () => ({ marginBottom: Math.abs(height.value) }),
        [height]
    );

    return { animatedStyle, height };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReadingPlayerMinimal() {
    const insets   = useSafeAreaInsets();
    const router   = useRouter();
    const theme    = useTheme();
    const dispatch = useDispatch();
    const readingState = useSelector((state: any) => state.reading);

    const [status,             setStatus]             = useState<Status>('stopped');
    const [seconds,            setSeconds]            = useState(0);
    const [confirmEndReading,  setConfirmEndReading]  = useState(false);

    // FIX: removed duplicate KeyboardEvents listeners. keyboardHeight is now
    // derived from the single useKeyboardOffset hook instead of running two
    // separate keyboard-tracking systems in parallel.
    const { animatedStyle: _keyboardAnimStyle, height: keyboardHeightSV } = useKeyboardOffset(insets);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        // Mirror the shared value into plain state for the Dialog's marginBottom.
        const id = setInterval(() => {
            setKeyboardHeight(keyboardHeightSV.value);
        }, 16);
        return () => clearInterval(id);
    }, [keyboardHeightSV]);

    const dialogInputRef = useRef<TextInput | null>(null);

    const actionLogRef = useRef<TimerLog[]>([]);
    const [, forceUpdate] = useState(0);

    const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null);
    const spinAnim       = useRef(new Animated.Value(0)).current;
    const spinAnimRef    = useRef<Animated.CompositeAnimation | null>(null);
    const isStoppingRef  = useRef(false);

    // -------------------------------------------------------------------------
    // Log helpers
    // -------------------------------------------------------------------------

    const appendLog = useCallback((entry: TimerLog) => {
        actionLogRef.current = [...actionLogRef.current, entry];
        forceUpdate((n) => n + 1);
    }, []);

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
    // Auto-focus the dialog input
    // FIX (bug 2): the original code used setTimeout(..., 120ms) which races
    // against the Dialog's mount animation — on slower devices the ref is still
    // null when the timeout fires. Instead we focus from onLayout, which is
    // guaranteed to fire exactly once after the TextInput is fully in the
    // layout tree, so the ref is always populated by then.
    // -------------------------------------------------------------------------

    const handleInputLayout = useCallback((_e: LayoutChangeEvent) => {
        dialogInputRef.current?.focus();
    }, []);

    // -------------------------------------------------------------------------
    // Confirmation form
    // -------------------------------------------------------------------------

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm({
        defaultValues: { pageNumber: '' },
        mode: 'onChange',
    });

    // FIX (bug 1): onDismiss was wired to endRead (the destructive submit
    // handler). When the keyboard appeared and the user tapped outside the
    // dialog, endRead fired handleStop() and navigated away before the user
    // had a chance to interact — making it look like the dialog never showed.
    // onDismiss should be a neutral no-op (or keepRead) so tapping outside
    // merely collapses the keyboard without destroying session state.
    const handleDismiss = useCallback(() => {
        // Intentionally do nothing: require an explicit button press.
        // If you want tapping outside to act as "keep reading", call keepRead() here.
    }, []);

    const showDialog = () => setConfirmEndReading(true);

    const endRead = handleSubmit((data) => {
        handleStop();
        setConfirmEndReading(false);
        reset();

        router.push({
            pathname: `/sessions/[sessionId]/summary`,
            params: {
                sessionId: 124,
                lastPage:  data.pageNumber,
            },
        });
    });

    const keepRead = useCallback(() => {
        reset();
        setConfirmEndReading(false);
        // Resume reading only if we were previously in a reading state.
        // handleRead guards against re-entering 'reading' from 'reading'.
        handleRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reset]);

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
    // -------------------------------------------------------------------------

    useEffect(() => {
        if (status === 'reading') {
            spinAnimRef.current = Animated.loop(
                Animated.timing(spinAnim, {
                    toValue:         1,
                    duration:        4000,
                    easing:          Easing.linear,
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
            patchLastPauseWithResume(time);
            appendLog({ action: 'resume', time });
        } else {
            appendLog({ action: 'start', time });
        }

        setStatus('reading');

        const payload: StartSessionPayload = {
            bookId:    BOOK_DATA.id,
            bookTitle: BOOK_DATA.title,
            startPage: 1,
            timer:     [...actionLogRef.current],
        };

        dispatch({ type: 'reading/startReading', payload });
    }, [status, appendLog, patchLastPauseWithResume, dispatch]);

    const handlePause = useCallback(
        (action: string = '') => {
            if (status === 'reading') {
                const time = nowISO();
                appendLog({ action: 'pause', time, timerAtPause: time, timerAtResume: undefined });
                setStatus('paused');

                dispatch({
                    type:    'reading/pauseReading',
                    payload: { timer: [...actionLogRef.current] },
                });
            }

            if (action === 'stopped') {
                showDialog();
            }
        },
        // FIX: removed `router` from the dependency array — it was never used
        // inside handlePause, causing unnecessary re-creation of the callback.
        [status, appendLog, dispatch]
    );

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
        inputRange:  [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const isActive = status === 'reading' || status === 'paused';

    const playPauseIcon =
        status === 'reading' ? 'pause' :
        status === 'paused'  ? 'play-arrow' :
                               'play-lesson';

    const playPauseLabel =
        status === 'reading' ? 'Pause' :
        status === 'paused'  ? 'Resume' :
                               'Read';

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
                                    <Text style={styles.progressLabel}>Progress</Text>
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

            <Portal>
                <Dialog
                    visible={confirmEndReading}
                    // FIX (bug 1): was `onDismiss={endRead}` — tapping outside or the
                    // keyboard appearing would silently call handleStop() + navigate,
                    // making the dialog seem to vanish immediately. Now a neutral no-op.
                    onDismiss={handleDismiss}
                    style={{
                        borderRadius:    20,
                        marginBottom:    keyboardHeight > 0
                            ? keyboardHeight - insets.bottom
                            : insets.bottom,
                        marginHorizontal: 20,
                    }}
                >
                    <Dialog.Title style={{ textAlign: 'center' }}>
                        Enter the last page you read
                    </Dialog.Title>

                    <Dialog.Content>
                        <Controller
                            name="pageNumber"
                            control={control}
                            rules={{
                                required: 'This field is required',
                                pattern:  { value: /^\d+$/, message: 'Must be a valid number' },
                                min:      { value: 1,       message: 'Must be at least page 1' },
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    ref={dialogInputRef}
                                    placeholder="e.g. 120"
                                    style={{
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#ccc',
                                        marginTop:         8,
                                        paddingVertical:   16,
                                        fontSize:          20,
                                        fontWeight:        '600',
                                        textAlign:         'center',
                                    }}
                                    keyboardType="number-pad"
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    value={value ?? ''}
                                    // FIX (bug 2): was setTimeout(..., 120ms) which raced
                                    // against the Dialog animation — ref could still be null.
                                    // onLayout fires once the input is fully mounted and
                                    // measured, guaranteeing the ref is populated.
                                    onLayout={handleInputLayout}
                                />
                            )}
                        />

                        {errors.pageNumber && (
                            <Text style={styles.errorText}>{errors.pageNumber.message}</Text>
                        )}
                    </Dialog.Content>

                    <Dialog.Actions style={{ justifyContent: 'center', gap: 20, paddingBottom: 24 }}>
                        <Button onPress={keepRead}>Keep Reading</Button>
                        <Button onPress={endRead} disabled={!isValid}>Save Progress</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </React.Fragment>
    );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius:    20,
        width:           '100%',
        borderWidth:     1,
        borderColor:     '#dcdcdc',
    },
    topRow: {
        flexDirection: 'row',
        alignItems:    'center',
        gap:           14,
        padding:       16,
        paddingBottom: 12,
    },
    albumArt: {
        width:           70,
        height:          84,
        borderRadius:    10,
        backgroundColor: '#1a1a1a',
        overflow:        'hidden',
    },
    albumArtInner: {
        flex:           1,
        alignItems:     'center',
        justifyContent: 'center',
        gap:            4,
    },
    vinylRing: {
        width:        28,
        height:       28,
        borderRadius: 14,
        borderWidth:  5,
        borderColor:  'rgba(255,255,255,0.15)',
    },
    albumLabel: {
        color:         'rgba(255,255,255,0.4)',
        fontSize:      8,
        letterSpacing: 1,
        fontWeight:    '500',
    },
    songInfo: {
        flex:          1,
        flexDirection: 'row',
    },
    songMeta: {
        flex: 1,
    },
    songTitle: {
        fontSize:     15,
        fontWeight:   '600',
        color:        '#1a1a1a',
        marginBottom: 2,
    },
    songArtist: {
        fontSize:   13,
        color:      '#888',
        fontWeight: '400',
    },
    songAlbum: {
        fontSize:      10,
        color:         '#a3a3a3',
        fontWeight:    '300',
        marginTop:     2,
        letterSpacing: 0.8,
    },
    bottomRow: {
        flexDirection:   'row',
        alignItems:      'center',
        justifyContent:  'space-between',
        paddingVertical: 12,
        paddingTop:      0,
        paddingHorizontal: 12,
        paddingLeft:     20,
    },
    controls: {
        flexDirection: 'row',
        alignItems:    'center',
        gap:           8,
    },
    controlButton: {
        width: 100,
    },
    timer: {
        fontSize:    20,
        fontWeight:  '800',
        color:       '#666',
        letterSpacing: 0.5,
        fontFamily:  'Courier New, monospace',
    },
    progressRow: {
        flexDirection: 'row',
    },
    progressMeta: {
        width: 66,
    },
    progressLabel: {
        fontSize:      11,
        color:         '#888',
        letterSpacing: 0.3,
        textTransform: 'uppercase',
        marginBottom:  1,
    },
    progressValue: {
        fontSize:   16,
        fontWeight: '700',
        color:      '#333',
    },
    errorText: {
        fontSize:  12,
        color:     '#E53E3E',
        marginTop: 6,
        textAlign: 'center',
    },
});