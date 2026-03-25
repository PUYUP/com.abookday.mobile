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

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from 'react-native-paper';

// ─── Color Palette ────────────────────────────────────────────────────────────
const C = {
  cream:     '#f7fbff',   // lightest background
  warm:      '#e8f1ff',   // soft supporting bg
  amber:     '#1e90ff',   // primary accent (DodgerBlue)
  amberDark: '#0f6cc5',   // darker accent for contrast
  brown:     '#0d1f36',   // header/background base
  ink:       '#0a1526',   // primary text on light surfaces
  gold:      '#9cc4ff',   // mid accent for pills/spine
  goldLight: '#d2e4ff',   // subtle accent for borders/fills
  paper:     '#f2f6ff',   // card surface
  muted:     '#6b86aa',   // secondary text
  mutedDark: '#4c6285',   // tertiary text
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
    const router = useRouter();
    const theme = useTheme();
  const pagesRead = Math.max(0, endPage - startPage + 1);
  const speed     = minutesRead > 0 ? (pagesRead / minutesRead).toFixed(1) : '—';
  const pct       = totalPages > 0 ? Math.min(100, Math.round((endPage / totalPages) * 100)) : 0;

  // ── Animations ──
  const fadeAnim     = useRef(new Animated.Value(0)).current;
  const slideAnim    = useRef(new Animated.Value(40)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Card entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 120 }),
    ]).start();

    // Progress bar fill (delayed so it plays after card appears)
    setTimeout(() => {
      Animated.timing(progressAnim, {
        toValue:         pct / 100,
        duration:        1400,
        useNativeDriver: false,
      }).start();
    }, 500);
  }, []);

  // ── Share text builder ──
  function buildShareText(): string {
    return '';
  }

  function shareFacebook() {
    const text = encodeURIComponent(buildShareText());
    Linking.openURL(
      `https://www.facebook.com/sharer/sharer.php?quote=${text}&u=https://facebook.com`
    );
  }

  function shareTwitter() {
    const text = encodeURIComponent(buildShareText());
    Linking.openURL(`https://twitter.com/intent/tweet?text=${text}`);
  }

  const progressWidth = progressAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  });

    // ─────────────────────────────────────────────────────────────────────────────
    return (
        <View style={s.root}>
            <Stack.Screen options={{ 
                title: 'Summary',
                headerBackButtonDisplayMode: 'minimal',
                headerShadowVisible: false,
            }} />

            <ScrollView
                contentContainerStyle={s.scroll}
                showsVerticalScrollIndicator={false}
            >
                <View style={s.card}>
                    {/* ── Header ── */}
                    <View style={s.header}>
                        <Text style={s.congratsTitle}>{bookTitle}</Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                            <Text style={s.bookTitle}>{author}</Text>
                            <MaterialIcons name="circle" size={6} color="rgba(253,246,236,0.55)" />
                            <Text style={s.bookTitle}>{category}</Text>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                            <Text style={s.bookTitle}>Session #{sessionNumber}</Text>
                            <Text style={s.bookTitle}>{formatDate()}</Text>
                        </View>
                    </View>

                    {/* ── Body ── */}
                    <View style={s.body}>
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
                        <View style={s.statsGrid}>
                        <StatBox
                            label="Reading Time"
                            value={String(minutesRead)}
                            unit="min"
                        />
                        <StatBox
                            label="Pages Read"
                            value={String(pagesRead)}
                            unit={`${startPage} – ${endPage}`}
                        />
                        <StatBox
                            label="Total Pages"
                            value={String(totalPages)}
                            unit={''}
                        />
                        <StatBox
                            label="Reading Speed"
                            value={String(speed)}
                            unit={'pages / min'}
                        />
                        </View>

                        {/* ── Inspirational Quote ── */}
                        <View style={s.quoteBox}>
                            <TextInput 
                                style={s.quoteInput} 
                                multiline={true} 
                                placeholder='Write your thoughts here...' 
                                placeholderTextColor={C.muted}
                            />
                            <Text style={s.quoteAuthor}>{'- Muhammad Rahman'}</Text>
                        </View>
                    </View>
                </View>

                {/* ── Share Section ── */}
                <View style={s.shareSection}>
                    <Text style={s.shareLabel}>Share Your Achievement</Text>
                    <View style={s.shareRow}>
                        <TouchableOpacity
                            style={[s.shareBtn, s.btnFB]}
                            onPress={shareFacebook}
                            activeOpacity={0.85}
                            accessibilityLabel="Share on Facebook"
                        >
                            <MaterialIcons name="facebook" size={18} color="#fff" />
                            <Text style={s.shareBtnText}>Facebook</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[s.shareBtn, s.btnX]}
                            onPress={shareTwitter}
                            activeOpacity={0.85}
                            accessibilityLabel="Share on X / Twitter"
                        >
                            <MaterialIcons name="close" size={18} color="#fff" />
                            <Text style={s.shareBtnText}>Twitter</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

// ─── StatBox Sub-Component ────────────────────────────────────────────────────
function StatBox({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit:  string;
}) {
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
  // Root & scroll
  root: {
    flex:            1,
    backgroundColor: '#fff',
  },
  scroll: {
    alignItems:        'center',
    paddingVertical:   0,
    padding: 16,
  },

  // Card
  card: {
    width:           '100%',
    maxWidth:        520,
    backgroundColor: C.paper,
    borderRadius:    20,
    overflow:        'hidden',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 12 },
    shadowOpacity:   0.45,
    shadowRadius:    28,
    elevation:       18,
  },

  // Header
  header: {
    backgroundColor:   C.amberDark,
    paddingHorizontal: 20,
    paddingTop:        20,
    paddingBottom:     20,
  },
  congratsTitle: {
    fontSize:   20,
    fontWeight: '700',
    color:      C.cream,
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
  statSub: {
    fontSize:  11,
    color:     C.muted,
    marginTop: 3,
  },

  // Progress
  progressSection: { gap: 8 },
  progressHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  progressLabel: {
    fontSize:      10,
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
    height:          10,
    backgroundColor: C.warm,
    borderRadius:    2,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     'rgba(200,133,58,0.2)',
  },
  progressFill: {
    height:          '100%',
    backgroundColor: C.amber,
    borderRadius:    2,
  },
  progressInfo: {
    flexDirection:  'row',
    justifyContent: 'space-between',
  },
  progressInfoText: {
    fontSize: 12,
    color:    C.muted,
  },

  // Quote
  quoteBox: {
    backgroundColor: C.warm,
    borderRadius:    16,
    padding:         16,
    overflow:        'hidden',
  },
  quoteAuthor: {
    fontSize:      10.5,
    fontWeight:    '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color:         C.amberDark,
    marginTop:     12,
    opacity:       0.85,
  },
    quoteInput: {
        fontSize: 18,
        color: C.ink,
    },

  // Meta
  meta: {
    flexDirection:  'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 11,
    color:    C.amberDark,
  },

  // Share
  shareSection: { 
    gap: 10,
    marginTop: 16,
  },
  shareLabel: {
    fontSize:      10,
    fontWeight:    '600',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color:         C.gold,
    textAlign:     'center',
  },
  shareRow: {
    flexDirection: 'row',
    gap:           8,
  },
  shareBtn: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            6,
    paddingVertical: 12,
    borderRadius:   16,
    width:          112,
  },
  btnFB: {
    backgroundColor: '#1877f2',
    shadowColor:     '#1877f2',
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.3,
    shadowRadius:    8,
    elevation:       4,
  },
  btnX: {
    backgroundColor: '#000',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.3,
    shadowRadius:    8,
    elevation:       4,
  },
  shareBtnText: {
    fontSize:   12.5,
    fontWeight: '600',
    color:      '#fff',
  },
});

// ─── Usage Example ────────────────────────────────────────────────────────────
/*
import ReadingSummaryScreen from './ReadingSummaryScreen';

// Inside your navigator / screen:
<ReadingSummaryScreen
  bookTitle="Atomic Habits"
  minutesRead={45}
  startPage={15}
  endPage={46}
  totalPages={320}
  sessionNumber={3}
/>
*/