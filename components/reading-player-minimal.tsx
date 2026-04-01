import { BookData, StartSessionPayload, TimerLog } from '@/state/reading/reading-slice';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    Animated,
    Easing,
    LayoutChangeEvent,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
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
// useKeyboardOffset
// Returns an animated marginBottom style and the raw shared-value height so
// callers have a single source of truth for keyboard position.
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

    const [status,            setStatus]            = useState<Status>('stopped');
    const [seconds,           setSeconds]           = useState(0);
    const [confirmEndReading, setConfirmEndReading] = useState(false);
    const [keyboardHeight,    setKeyboardHeight]    = useState(0);

    const { height: keyboardHeightSV } = useKeyboardOffset(insets);

    // Mirror shared value → plain state for Dialog's marginBottom (runs at ~60 fps).
    useEffect(() => {
        const id = setInterval(() => setKeyboardHeight(keyboardHeightSV.value), 16);
        return () => clearInterval(id);
    }, [keyboardHeightSV]);

    const dialogInputRef  = useRef<TextInput | null>(null);
    const actionLogRef    = useRef<TimerLog[]>([]);
    const intervalRef     = useRef<ReturnType<typeof setInterval> | null>(null);
    const spinAnim        = useRef(new Animated.Value(0)).current;
    const spinAnimRef     = useRef<Animated.CompositeAnimation | null>(null);
    const isStoppingRef   = useRef(false);

    const [, forceUpdate] = useState(0);

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
    // Auto-focus dialog input via onLayout (avoids setTimeout race condition)
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

    // Neutral dismiss — require an explicit button press; tapping outside
    // must not trigger the destructive endRead path.
    const handleDismiss = useCallback(() => {}, []);

    const endRead = handleSubmit((data) => {
        handleStop();
        setConfirmEndReading(false);
        reset();
        router.push({
            pathname: `/sessions/[sessionId]/summary`,
            params: { 
                sessionId: 124, 
                fromPage: 34, 
                lastPage: data.pageNumber,
            },
        });
    });

    const keepRead = useCallback(() => {
        reset();
        setConfirmEndReading(false);
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
            clearInterval(intervalRef.current ?? undefined);
            intervalRef.current = null;
        }
        return () => {
            clearInterval(intervalRef.current ?? undefined);
            intervalRef.current = null;
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
            if (status === 'stopped') spinAnim.setValue(0);
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
        (action = '') => {
            if (status === 'reading') {
                const time = nowISO();
                appendLog({ action: 'pause', time, timerAtPause: time, timerAtResume: undefined });
                setStatus('paused');
                dispatch({ type: 'reading/pauseReading', payload: { timer: [...actionLogRef.current] } });
            }
            if (action === 'stopped') setConfirmEndReading(true);
        },
        [status, appendLog, dispatch]
    );

    const handleStop = useCallback(() => {
        if (isStoppingRef.current) return;
        isStoppingRef.current = true;

        const finalLog = [...actionLogRef.current, { action: 'finish', time: nowISO() } as TimerLog];
        dispatch({ type: 'reading/finishReading', payload: { timer: finalLog } });

        setStatus('stopped');
        setSeconds(0);
        resetLog();

        isStoppingRef.current = false;
    }, [dispatch, resetLog]);

    // -------------------------------------------------------------------------
    // Derived values
    // -------------------------------------------------------------------------

    const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    const isActive = status === 'reading' || status === 'paused';

    const playPauseIcon =
        status === 'reading' ? 'pause'        :
        status === 'paused'  ? 'play-arrow'   :
                               'play-lesson'  as any;

    const playPauseLabel =
        status === 'reading' ? 'Pause'     :
        status === 'paused'  ? 'Resume'    :
                               'Read Now';

    const dialogMarginBottom = keyboardHeight > 0
        ? keyboardHeight - insets.bottom
        : insets.bottom;

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
        <React.Fragment>
            <View style={styles.card}>
                <View style={styles.bottomRow}>
                    <View style={styles.progressRow}>
                        {status === 'stopped' ? (
                            <View style={styles.progressMeta}>
                                <Text style={styles.progressLabel}>Pages Left:</Text>
                                <Text style={styles.progressValue}>34</Text>
                            </View>
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
                                styles.playButton,
                                status === 'stopped' && styles.controlButtonAuto,
                            ]}
                            labelStyle={status === 'stopped' ? styles.labelStopped : styles.labelActive}
                        >
                            {playPauseLabel}
                        </Button>

                        {isActive && (
                            <Button
                                icon={() => <MaterialIcons name="check" color={COLORS.green} size={26} />}
                                onPress={() => handlePause('stopped')}
                                textColor={COLORS.green}
                                style={[styles.controlButton, styles.finishButton]}
                                labelStyle={styles.labelActive}
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
                    onDismiss={handleDismiss}
                    style={[styles.dialog, { marginBottom: dialogMarginBottom }]}
                >
                    <Dialog.Title style={styles.dialogTitle}>
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
                                    style={styles.pageInput}
                                    keyboardType="number-pad"
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    value={value ?? ''}
                                    onLayout={handleInputLayout}
                                />
                            )}
                        />
                        {errors.pageNumber && (
                            <Text style={styles.errorText}>{errors.pageNumber.message}</Text>
                        )}
                    </Dialog.Content>

                    <Dialog.Actions style={styles.dialogActions}>
                        <Button onPress={keepRead}>Keep Reading</Button>
                        <Button onPress={endRead} disabled={!isValid}>Save Progress</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </React.Fragment>
    );
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

const COLORS = {
    green:       '#2e8b57',
    greenBg:     'rgba(46,139,87,0.10)',
    primaryBg:   'rgba(30,144,255,0.05)',
    border:      '#dcdcdc',
    timerText:   '#666',
    metaLabel:   '#888',
    metaValue:   '#333',
    error:       '#E53E3E',
    inputBorder: '#ccc',
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
    // --- Card ---
    card: {
        backgroundColor: '#fff',
        borderRadius:    20,
        width:           '100%',
        borderWidth:     1,
        borderColor:     COLORS.border,
        padding:         12,
    },

    // --- Controls row ---
    bottomRow: {
        flexDirection:  'row',
        alignItems:     'center',
        justifyContent: 'space-between',
    },
    progressRow: {
        flexDirection: 'row',
    },
    progressMeta: {
        minWidth:      66,
        flexDirection: 'row',
        gap:           4,
    },
    progressLabel: {
        fontSize: 16,
        color:    COLORS.metaLabel,
    },
    progressValue: {
        fontSize:   16,
        fontWeight: '700',
        color:      COLORS.metaValue,
    },
    timer: {
        fontSize:      20,
        fontWeight:    '800',
        color:         COLORS.timerText,
        letterSpacing: 0.5,
        fontFamily:    'Courier New, monospace',
    },
    controls: {
        flexDirection: 'row',
        alignItems:    'center',
        gap:           8,
    },
    controlButton: {
        width: 100,
    },
    controlButtonAuto: {
        width: 'auto',
    },
    playButton: {
        backgroundColor: COLORS.primaryBg,
    },
    finishButton: {
        backgroundColor: COLORS.greenBg,
    },
    labelStopped: {
        marginLeft: 14,
    },
    labelActive: {
        marginLeft: 10,
    },

    // --- Dialog ---
    dialog: {
        borderRadius:    20,
        marginHorizontal: 20,
    },
    dialogTitle: {
        textAlign: 'center',
    },
    dialogActions: {
        justifyContent: 'center',
        gap:            20,
        paddingBottom:  24,
    },
    pageInput: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.inputBorder,
        marginTop:         8,
        paddingVertical:   16,
        fontSize:          20,
        fontWeight:        '600',
        textAlign:         'center',
    },
    errorText: {
        fontSize:  12,
        color:     COLORS.error,
        marginTop: 6,
        textAlign: 'center',
    },
});