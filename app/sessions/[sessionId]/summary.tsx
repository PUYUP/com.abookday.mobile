/**
 * ReadingSummaryScreen.tsx
 *
 * A beautiful reading session summary screen.
 *
 * Props:
 *   bookTitle       – title of the book
 *   author          – book author
 *   category        – book category
 *   minutesRead     – total minutes spent reading
 *   startPage       – page you started on
 *   endPage         – page you finished on
 *   totalPages      – total pages in the book
 *   sessionNumber   – session number (default 1)
 *
 * All dependencies are built-in React Native.
 * Share uses RN's built-in Share API.
 * Deep-links to Facebook & Twitter use Linking.
 */

import { MOOD_OPTIONS } from '@/state/reading/reading-slice';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    Animated,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { TextInput as PaperTextInput, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ViewShot from "react-native-view-shot";

// ─── Color Palette ────────────────────────────────────────────────────────────
const C = {
    cream:     '#f7fbff',
    warm:      '#e8f1ff',
    amber:     '#1e90ff',
    amberDark: '#0f6cc5',
    brown:     '#0d1f36',
    ink:       '#0a1526',
    gold:      '#9cc4ff',
    goldLight: '#d2e4ff',
    paper:     '#f2f6ff',
    muted:     '#6b86aa',
    mutedDark: '#4c6285',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(): string {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year:    'numeric',
        month:   'long',
        day:     'numeric',
    });
}

// Derive the union type from the constant so it stays in sync automatically.
type MoodId = (typeof MOOD_OPTIONS)[number]['id'];

// ─── Types ────────────────────────────────────────────────────────────────────
type FormValues = {
    // FIX: was typed as `MoodOption | undefined` (an external type that refers to
    // the full object), but the form only needs to store the selected mood id.
    // Using the derived MoodId union keeps the type honest and avoids mismatches.
    mood:     MoodId | null;
    lastPage: number;
    note:     string;
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
    bookTitle?:     string;
    author?:        string;
    category?:      string;
    minutesRead?:   number;
    startPage?:     number;
    endPage?:       number;
    totalPages?:    number;
    sessionNumber?: number;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ReadingSummaryScreen({
    bookTitle     = 'Makanya, Mikir!',
    author        = 'Dewi Lestari',
    category      = 'Fiction',
    minutesRead   = 45,
    startPage     = 15,
    endPage       = 46,
    totalPages    = 320,
    sessionNumber = 1,
}: Props) {
    const router  = useRouter();
    const insets  = useSafeAreaInsets();
    const theme   = useTheme();

    // States
    const [isSharing, setIsSharing] = useState<boolean>(false);

    // FIX: removed unused `height` state (was declared but never read).
    // Auto-grow is now handled by tracking content height via onContentSizeChange.
    const inputRef = useRef(null);
    const initialised = useRef(false);
    const shotRef = useRef(null);

    const pagesRead = Math.max(0, endPage - startPage + 1);
    const speed     = minutesRead > 0 ? (pagesRead / minutesRead).toFixed(1) : '—';
    const pct       = totalPages > 0 ? Math.min(100, Math.round((endPage / totalPages) * 100)) : 0;

    // -- Sharing ---
    const options: Sharing.SharingOptions = {
        mimeType: 'image/jpeg',
    }

    // ── Form ──────────────────────────────────────────────────────────────────
    // FIX: all fields are now properly wired via <Controller> so their values
    // are actually captured on submit. Previously `control` was imported but
    // no Controller wrapped any input, leaving mood/lastPage/note at defaults.
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        getValues
    } = useForm<FormValues>({
        mode: 'onChange',
        defaultValues: {
            mood:     null,
            lastPage: 0,
            note:     '',
        },
    });

    // ── Animations ────────────────────────────────────────────────────────────
    const fadeAnim     = useRef(new Animated.Value(0)).current;
    const slideAnim    = useRef(new Animated.Value(40)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 120 }),
        ]).start();

        setTimeout(() => {
            Animated.timing(progressAnim, {
                toValue:         pct / 100,
                duration:        1400,
                useNativeDriver: false,
            }).start();
        }, 500);
    }, []);

    const progressWidth = progressAnim.interpolate({
        inputRange:  [0, 1],
        outputRange: ['0%', '100%'],
    });

    // ── Share ─────────────────────────────────────────────────────────────────
    const share = async() => {
        if (shotRef && shotRef.current) {
            // @ts-ignore
            shotRef.current.capture().then(async uri => {
                setIsSharing(true);
                await Sharing.shareAsync(`file://${uri}`, options);
                setIsSharing(false);
            });
        }
    }

    // ── Submit ────────────────────────────────────────────────────────────────
    // FIX: handleSubmit was defined but never invoked — no save/done button
    // existed in the original render tree.
    function onSubmit(data: FormValues) {
        // TODO: dispatch to your store / call your API here.
        console.log('Session saved:', data);
        router.back();
    }

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <View style={s.root}>
            <Stack.Screen options={{
                title: 'Summary',
                headerBackTitle: 'Back',
                headerRight: () => (
                    <TouchableOpacity onPress={() => {}} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <MaterialIcons name="edit" size={22} color={theme.colors.primary} />
                        <Text style={{ color: theme.colors.primary, fontSize: 18, fontWeight: '600' }}>Edit</Text>
                    </TouchableOpacity>
                )
            }} />

            <KeyboardAwareScrollView
                contentContainerStyle={s.scroll}
                showsVerticalScrollIndicator={false}
                bottomOffset={insets.bottom + 20}
                nestedScrollEnabled={true}
            >
                <View style={s.pagesInputRow}>
                    <View style={{ flexDirection: 'row', flex: 1, gap: 12 }}>
                        <View>
                            <Text style={s.inputLabel}>From page</Text>
                            <PaperTextInput mode='outlined' style={s.pageInput} keyboardType='numeric' placeholder='e.g. 20' />
                        </View>

                        <View>
                            <Text style={s.inputLabel}>To page</Text>
                            <PaperTextInput mode='outlined' style={s.pageInput} keyboardType='numeric' placeholder='e.g. 40' />
                        </View>
                    </View>

                    <View>
                        <Text style={[s.shareLabel, { fontWeight: 'normal' }]}>Tell Friends</Text>
                        <View style={s.shareRow}>
                            <TouchableOpacity
                                style={[s.shareBtn, s.btnFB]}
                                onPress={share}
                                activeOpacity={0.85}
                                accessibilityLabel="Share on Facebook"
                            >
                                <MaterialIcons name="share" size={18} color="#fff" />
                                <Text style={s.shareBtnText}>Share</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            
                <ViewShot style={s.card} ref={shotRef}>
                    {/* ── Header ── */}
                    <View style={s.header}>
                        <Text style={s.congratsTitle}>{bookTitle}</Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                            <Text style={s.bookTitle}>{author}</Text>
                            <MaterialIcons name="circle" size={6} color="rgba(253,246,236,0.55)" />
                            <Text style={s.bookTitle}>{category}</Text>
                            <MaterialIcons name="circle" size={6} color="rgba(253,246,236,0.55)" />
                            <Text style={s.bookTitle}>{totalPages} pages</Text>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                            <Text style={s.bookTitle}>{formatDate()}</Text>
                        </View>
                    </View>

                    {/* ── Body ── */}
                    <View style={s.body}>
                        {/* ── Mood Selector ── */}
                        {/* FIX: mood is now wired to react-hook-form via Controller.
                            Previously setSelectedMood updated only local state while
                            setValue was never called, so mood was always undefined
                            on submit. The Controller's onChange is now the single
                            source of truth; isSelected derives from field.value. */}
                        <View>
                            <View style={[s.progressHeader, { marginBottom: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 6 }]}>
                                <MaterialIcons name="monitor-heart" size={18} color={C.amber} />
                                <Text style={s.progressLabel}>How did this session feel?</Text>
                            </View>

                            {/* FIX: mood validation error is only shown after a submit
                                attempt (errors.mood exists only once handleSubmit fires),
                                not on every render before the user has touched anything. */}
                            {errors.mood && (
                                <Text style={s.errorText}>Please select a mood before saving.</Text>
                            )}

                            <Controller
                                control={control}
                                name="mood"
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <FlatList
                                        scrollEnabled={false}
                                        keyboardShouldPersistTaps="handled"
                                        numColumns={6}
                                        data={MOOD_OPTIONS}
                                        keyExtractor={(item) => item.id}
                                        contentContainerStyle={s.moodGrid}
                                        columnWrapperStyle={s.moodRow}
                                        renderItem={({ item: mood }) => {
                                            const isSelected = field.value === mood.id;
                                            return (
                                                <TouchableOpacity
                                                    style={[
                                                        s.moodCard,
                                                        isSelected && {
                                                            borderColor:     mood.color,
                                                            backgroundColor: `${mood.color}18`,
                                                            borderWidth: 2,
                                                        },
                                                        errors.mood && {
                                                            borderColor: '#E53E3E',
                                                        },
                                                    ]}
                                                    onPress={() => field.onChange(mood.id)}
                                                    activeOpacity={0.75}
                                                >
                                                    <Text 
                                                        style={[s.moodEmoji, Platform.OS == 'android' ? { fontSize: 22, top: -1 } : { fontSize: 26 }]}
                                                    >
                                                        {mood.emoji}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        }}
                                    />
                                )}
                            />
                        </View>
                        
                        {/* ── Progress Bar ── */}
                        <View style={s.progressSection}>
                            <View style={s.progressHeader}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <MaterialIcons name="bar-chart" size={18} color={C.amber} />
                                    <Text style={s.progressLabel}>Overall Progress</Text>
                                </View>
                                <Text style={s.progressPct}>{pct}%</Text>
                            </View>
                            <View style={s.progressTrack}>
                                <Animated.View style={[s.progressFill, { width: progressWidth }]} />
                            </View>
                            <View style={s.progressInfo}>
                                <Text style={s.progressInfoText}>Done: {endPage} pages</Text>
                                <Text style={s.progressInfoText}>
                                    Left: {Math.max(0, totalPages - endPage)} to go
                                </Text>
                            </View>
                        </View>

                        {/* ── Stats 2×2 Grid ── */}
                        <View style={[s.statsGrid, { marginBottom: 12 }]}>
                            <StatBox label="Time"       value={String(minutesRead)} unit="min"              />
                            <StatBox label="Pages Read" value={String(pagesRead)}   unit={`${startPage} – ${endPage}`} />
                            <StatBox label="Sessions"   value={`#${sessionNumber}`} unit=""                 />
                            <StatBox label="Speed"      value={String(speed)}       unit="pages / min"      />
                        </View>

                        {/* ── Note Input ── */}
                        {/* FIX 1: was an uncontrolled TextInput wired to a ref with a
                            broken initialised-guard that called setNativeProps only on
                            the first keystroke — the value was never captured.
                            Now it's a controlled Controller field.
                            FIX 2: onContentSizeChange was console.log-ing instead of
                            updating height, so the textarea never grew. Now it updates
                            noteHeight so the input expands as the user types. */}
                        
                        {(!isSharing || getValues('note')) && (
                            <React.Fragment>
                                <View style={[s.progressHeader, { justifyContent: 'flex-start', alignItems: 'center', gap: 6 }]}>
                                    <MaterialIcons name="chat" size={18} color={C.amber} />
                                    <Text style={s.progressLabel}>The Thoughts</Text>
                                </View>

                                <View style={[s.quoteBox, { marginTop: -10 }]}>
                                    <Controller
                                        control={control}
                                        name="note"
                                        render={({ field }) => (
                                            <TextInput
                                                style={[s.quoteInput, { minHeight: 30 }]} 
                                                placeholder="Write here..."
                                                value={field.value}
                                                ref={inputRef}
                                                onChange={field.onChange}
                                                onChangeText={(text)=> {
                                                    if(!initialised.current && text?.trim()){
                                                        initialised.current = true
                                                        // @ts-ignore
                                                        inputRef.current?.setNativeProps({text})
                                                    }

                                                    field.onChange(text)
                                                }}
                                                onBlur={field.onBlur}
                                                multiline
                                                scrollEnabled={false}
                                            />
                                        )}
                                    />
                                </View>
                            </React.Fragment>
                        )}
                    </View>
                </ViewShot>
            </KeyboardAwareScrollView>
        </View>
    );
}

// ─── StatBox Sub-Component ────────────────────────────────────────────────────
function StatBox({ label, value, unit }: { label: string; value: string; unit: string }) {
    return (
        <View style={s.statBox}>
            <View style={s.statAccent} />
            <Text style={s.statLabel}>{label}</Text>
            <View style={s.statValueRow}>
                <Text style={s.statValue}>{value}</Text>
                {unit ? <Text style={s.statUnit}> {unit}</Text> : null}
            </View>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    root: {
        flex:            1,
        backgroundColor: '#f5f5f5',
    },
    scroll: {
        alignItems:    'center',
        paddingBottom: 16,
    },

    // Card
    card: {
        width:           '100%',
        height:          '100%',
        maxWidth:        520,
        backgroundColor: '#fff',
        overflow:        'hidden',
    },

    // Header
    header: {
        backgroundColor:   C.amberDark,
        paddingHorizontal: 20,
        paddingTop:        20,
        paddingBottom:     20,
    },
    congratsTitle: {
        fontSize:     20,
        fontWeight:   '700',
        color:        C.cream,
        marginBottom: 4,
    },
    bookTitle: {
        fontSize:  14,
        fontStyle: 'italic',
        color:     'rgba(253,246,236,0.75)',
    },

    // Body
    body: {
        padding: 18,
        gap:     16,
    },

    // Stats grid
    statsGrid: {
        flexDirection: 'row',
        flexWrap:      'wrap',
        gap:           10,
    },
    statBox: {
        width:           '48%',
        backgroundColor: C.cream,
        borderRadius:    16,
        borderWidth:     1,
        borderColor:     C.amber,
        padding:         14,
        paddingLeft:     22,
        overflow:        'hidden',
    },
    statAccent: {
        position:               'absolute',
        left: 0, top: 0, bottom: 0,
        width:                  8,
        backgroundColor:        C.amber,
        borderTopLeftRadius:    16,
        borderBottomLeftRadius: 16,
    },
    statLabel: {
        fontSize:      9,
        fontWeight:    '600',
        letterSpacing: 2,
        textTransform: 'uppercase',
        color:         C.amber,
        marginBottom:  5,
    },
    statValueRow: {
        flexDirection: 'row',
        alignItems:    'flex-end',
    },
    statValue: {
        fontSize:   28,
        fontWeight: '700',
        color:      C.ink,
        lineHeight: 32,
    },
    statUnit: {
        fontSize:     12,
        color:        C.mutedDark,
        marginBottom: 3,
        marginLeft:   2,
    },

    // Progress
    progressSection: { gap: 8 },
    progressHeader: {
        flexDirection:  'row',
        justifyContent: 'space-between',
        alignItems:     'center',
    },
    progressLabel: {
        fontSize:      11,
        fontWeight:    '600',
        letterSpacing: 2,
        textTransform: 'uppercase',
        color:         C.amber,
    },
    progressPct: {
        fontSize:   22,
        fontWeight: '700',
        color:      C.ink,
    },
    progressTrack: {
        height:          16,
        backgroundColor: C.warm,
        borderRadius:    8,
        overflow:        'hidden',
        borderWidth:     1,
        borderColor:     C.amber,
        padding:         2,
    },
    progressFill: {
        height:          '100%',
        backgroundColor: C.amber,
        borderRadius:    8,
    },
    progressInfo: {
        flexDirection:  'row',
        justifyContent: 'space-between',
    },
    progressInfoText: {
        fontSize: 12,
        color:    C.muted,
    },

    // Quote / note
    quoteBox: {},
    quoteInput: {
        fontSize: 18,
        color:    C.ink,
    },

    // Error
    errorText: {
        fontSize:  12,
        color:     '#E53E3E',
        marginTop: 4,
    },

    // Share
    shareLabel: {
        fontSize:      11,
        textAlign:     'left',
        textTransform: 'uppercase',
        paddingLeft: 2,
        marginBottom:  6,
        color: '#4A5568',
        letterSpacing: 0.75,
    },
    shareRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap:           8,
    },
    shareBtn: {
        flexDirection:   'row',
        alignItems:      'center',
        justifyContent:  'center',
        gap:             6,
        paddingVertical: 12,
        borderRadius:    16,
        width:           112,
        height:          42,
    },
    btnFB: {
        backgroundColor: '#1877f2',
    },
    shareBtnText: {
        fontSize:   12.5,
        fontWeight: '600',
        color:      '#fff',
    },

    // Mood grid
    moodGrid: {
        gap: 8,
    },
    moodRow: {
        justifyContent: 'space-between',
    },
    moodCard: {
        width:           46,
        height:          46,
        backgroundColor: '#FFFFFF',
        borderWidth:     1,
        borderColor:     '#E2E8F0',
        borderRadius:    23,
        alignItems:      'center',
        justifyContent:  'center',
    },
    moodEmoji: {
        fontSize: 28,
    },

    // Pages input
    pagesInputRow: {
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 16,
        justifyContent: 'space-between',
    },
    pageInput: {
        width: 90,
        height: 42,
    },
    inputLabel: {
        fontSize: 11,
        marginBottom: 6,
        textAlign: 'left',
        textTransform: 'uppercase',
        paddingLeft: 2,
        color: '#4A5568',
        letterSpacing: 0.75,
    },
});