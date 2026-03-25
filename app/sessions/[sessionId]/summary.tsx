/**
 * ReadingSummaryScreen.tsx
 *
 * A beautiful reading session summary screen.
 *
 * Props:
 *   bookTitle       – title of the book
 *   minutesRead     – total minutes spent reading
 *   startPage       – page you started on
 *   endPage         – page you finished on
 *   totalPages      – total pages in the book
 *   sessionNumber   – session number (default 1)
 *   onClose?        – callback for close / back button
 *
 * All dependencies are built-in React Native.
 * Share uses RN's built-in Share API.
 * Deep-links to Facebook & Twitter use Linking.
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
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

// ─── Quote Pool ───────────────────────────────────────────────────────────────
const QUOTES = [
  {
    text:   'Reading is a window to a limitless world. Every page you open is a step toward a wiser version of yourself.',
    author: '— Anonymous',
  },
  {
    text:   'There is no friend as loyal as a book. It waits patiently, never judges, and always has something to give.',
    author: '— Ernest Hemingway',
  },
  {
    text:   'The more that you read, the more things you will know. The more that you learn, the more places you will go.',
    author: '— Dr. Seuss',
  },
  {
    text:   'A book is a dream that you hold in your hands. Every night you spend with one is a night well won.',
    author: '— Neil Gaiman',
  },
  {
    text:   'Reading gives you peace of mind, breadth of perspective, and the courage to dream bigger than before.',
    author: '— Anonymous',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });
}

function computeBadges(minutes: number, pagesRead: number, pct: number) {
  const list: { icon: string; label: string }[] = [];
  if (pagesRead >= 50) list.push({ icon: '🔥', label: '50+ Pages!' });
  if (pagesRead >= 20) list.push({ icon: '📖', label: 'Active Reader' });
  if (minutes  >= 60)  list.push({ icon: '⏳', label: '1-Hour Focus' });
  if (minutes  >= 30)  list.push({ icon: '⚡', label: '30-Min Streak' });
  if (pct      >= 50)  list.push({ icon: '🏅', label: 'Halfway There' });
  if (pct      >= 100) list.push({ icon: '🏆', label: 'Book Complete!' });
  if (list.length === 0) list.push({ icon: '⭐', label: 'First Step' });
  return list;
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
  onClose?:       () => void;
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
  onClose,
}: Props) {
    const router = useRouter();
    const theme = useTheme();
  const pagesRead = Math.max(0, endPage - startPage + 1);
  const speed     = minutesRead > 0 ? (pagesRead / minutesRead).toFixed(1) : '—';
  const pct       = totalPages > 0 ? Math.min(100, Math.round((endPage / totalPages) * 100)) : 0;

  const [quoteIdx,     setQuoteIdx]     = useState(0);

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
    const preview = QUOTES[quoteIdx].text.slice(0, 80) + '…';
    return (
      `📚 Reading Session Complete!\n\n` +
      `Book: ${bookTitle}\n` +
      `⏱ ${minutesRead} minutes of reading\n` +
      `📄 ${pagesRead} pages read (pp. ${startPage}–${endPage})\n` +
      `📊 Progress: ${pct}% of ${totalPages} pages\n\n` +
      `"${preview}"\n\n` +
      `#ReadingSession #BookLovers #Reading`
    );
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

  function nextQuote() {
    setQuoteIdx(i => (i + 1) % QUOTES.length);
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
        // headerTitle: (props) => {
        //     return (
        //         <View style={{ backgroundColor: 'green', position: 'absolute', left: 40, right: 40 }}>
        //         <Text style={{ textAlign: 'center' }}>{props.children}</Text>
        //         </View>
        //     );
        // },
        // headerLeft: () => (
        //     <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
        //         <MaterialIcons name="arrow-back-ios" size={22} color={theme.colors.primary} />
        //         <Text style={{ color: theme.colors.primary, fontSize: 18, fontWeight: '600' }}>Back</Text>
        //     </TouchableOpacity>
        // ),
       }} />

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            s.card,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* ── Spine accent ── */}
          <View style={s.spine} />

          {/* ── Header ── */}
          <View style={s.header}>
            <Text style={s.congratsTitle}>{bookTitle}</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <MaterialIcons name="book" size={18} color="rgba(253,246,236,0.55)" />
                <Text style={s.bookTitle}>{author}</Text>
                <MaterialIcons name="circle" size={6} color="rgba(253,246,236,0.55)" />
                <Text style={s.bookTitle}>{category}</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <MaterialIcons name="calendar-today" size={18} color="rgba(253,246,236,0.55)" />
                <Text style={s.bookTitle}>Session #{sessionNumber}</Text>
                <Text style={s.bookTitle}>{formatDate()}</Text>
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
                  <Text style={s.shareBtnIcon}>f</Text>
                  <Text style={s.shareBtnText}>Facebook</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.shareBtn, s.btnX]}
                  onPress={shareTwitter}
                  activeOpacity={0.85}
                  accessibilityLabel="Share on X / Twitter"
                >
                  <Text style={s.shareBtnIcon}>𝕏</Text>
                  <Text style={s.shareBtnText}>Twitter</Text>
                </TouchableOpacity>
              </View>
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
                sub={`≈ ${(minutesRead * 60).toLocaleString()} seconds of focus`}
              />
              <StatBox
                label="Pages Read"
                value={String(pagesRead)}
                unit="pp."
                sub={`pp. ${startPage} – ${endPage}`}
              />
              <StatBox
                label="Total Pages"
                value={String(totalPages)}
                unit="pp."
                sub="Book length"
              />
              <StatBox
                label="Reading Speed"
                value={String(speed)}
                unit=""
                sub="pages / minute"
              />
            </View>

            {/* ── Divider */}
            <View style={s.divider}>
                <View style={s.dividerLine} />
                <Text style={s.dividerChar}>❧</Text>
                <View style={s.dividerLine} />
            </View>

            {/* ── Inspirational Quote ── */}
            <TouchableOpacity
              style={s.quoteBox}
              onPress={nextQuote}
              activeOpacity={0.85}
              accessibilityLabel="Tap to change quote"
            >
              <Text style={s.quoteMark}>"</Text>
              <Text style={s.quoteText}>{QUOTES[quoteIdx].text}</Text>
              <Text style={s.quoteAuthor}>{QUOTES[quoteIdx].author}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Close / Back Button ── */}
        {onClose && (
          <TouchableOpacity
            style={s.closeBtn}
            onPress={onClose}
            activeOpacity={0.8}
            accessibilityLabel="Close summary"
          >
            <Text style={s.closeBtnText}>Close</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

// ─── StatBox Sub-Component ────────────────────────────────────────────────────
function StatBox({
  label,
  value,
  unit,
  sub,
}: {
  label: string;
  value: string;
  unit:  string;
  sub:   string;
}) {
  return (
    <View style={s.statBox}>
      <View style={s.statAccent} />
      <Text style={s.statLabel}>{label}</Text>
      <View style={s.statValueRow}>
        <Text style={s.statValue}>{value}</Text>
        {unit ? <Text style={s.statUnit}> {unit}</Text> : null}
      </View>
      <Text style={s.statSub}>{sub}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // Root & scroll
  root: {
    flex:            1,
    backgroundColor: C.brown,
  },
  scroll: {
    alignItems:        'center',
    paddingVertical:   0,
  },

  // Card
  card: {
    width:           '100%',
    maxWidth:        520,
    backgroundColor: C.paper,
    borderRadius:    0,
    overflow:        'hidden',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 12 },
    shadowOpacity:   0.45,
    shadowRadius:    28,
    elevation:       18,
  },

  // Spine
  spine: {
    height:          6,
    backgroundColor: C.gold,
  },

  // Header
  header: {
    backgroundColor:   C.brown,
    paddingHorizontal: 26,
    paddingTop:        26,
    paddingBottom:     26,
  },
  headerDecor: {
    position: 'absolute',
    right:    24,
    top:      12,
    fontSize: 52,
    color:    'rgba(212,164,76,0.18)',
  },
  congratsLabel: {
    fontSize:      10,
    fontWeight:    '600',
    letterSpacing: 3.5,
    textTransform: 'uppercase',
    color:         C.gold,
    opacity:       0.85,
    marginBottom:  8,
  },
  congratsTitle: {
    fontSize:   28,
    fontWeight: '900',
    color:      C.cream,
  },
  bookTitle: {
    fontSize:  15,
    fontStyle: 'italic',
    color:     'rgba(253,246,236,0.55)',
  },

  // Body
  body: {
    padding: 22,
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
    borderWidth:     1.5,
    borderColor:     'rgba(200,133,58,0.2)',
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
    fontSize: 11,
    color:    C.muted,
  },

  // Divider
  divider: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            10,
    marginVertical: 0,
  },
  dividerLine: {
    flex:            1,
    height:          1,
    backgroundColor: 'rgba(200,133,58,0.22)',
  },
  dividerChar: {
    fontSize: 18,
    color:    'rgba(200,133,58,0.45)',
  },

  // Badges
  badgesRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           8,
  },
  badge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               5,
    backgroundColor:   C.cream,
    borderWidth:       1.5,
    borderColor:       'rgba(200,133,58,0.25)',
    borderRadius:      50,
    paddingVertical:   6,
    paddingHorizontal: 12,
  },
  badgeIcon:  { fontSize: 14 },
  badgeLabel: {
    fontSize:   11.5,
    fontWeight: '500',
    color:      C.amberDark,
  },

  // Quote
  quoteBox: {
    backgroundColor: C.brown,
    borderRadius:    3,
    padding:         24,
    overflow:        'hidden',
  },
  quoteMark: {
    position:  'absolute',
    left:      10,
    top:       -12,
    fontSize:  90,
    color:     C.amber,
    opacity:   0.18,
    lineHeight: 100,
  },
  quoteText: {
    fontSize:   15,
    fontStyle:  'italic',
    lineHeight: 26,
    color:      C.cream,
  },
  quoteAuthor: {
    fontSize:      10.5,
    fontWeight:    '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color:         C.gold,
    marginTop:     12,
    opacity:       0.85,
  },

  // Meta
  meta: {
    flexDirection:  'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 11,
    color:    '#b08050',
  },

  // Share
  shareSection: { 
    gap: 10,
    marginTop: 22,
  },
  shareLabel: {
    fontSize:      10,
    fontWeight:    '600',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color:         C.gold,
  },
  shareRow: {
    flexDirection: 'row',
    gap:           8,
  },
  shareBtn: {
    flex:           1,
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            6,
    paddingVertical: 12,
    borderRadius:   3,
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
  btnNative: {
    backgroundColor: C.brown,
    borderWidth:     1,
    borderColor:     'rgba(212,164,76,0.3)',
    shadowColor:     C.brown,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.3,
    shadowRadius:    8,
    elevation:       4,
  },
  shareBtnIcon: {
    fontSize:   14,
    color:      '#fff',
    fontWeight: '700',
  },
  shareBtnText: {
    fontSize:   12.5,
    fontWeight: '600',
    color:      '#fff',
  },

  // Footer
  footer: {
    paddingHorizontal: 28,
    paddingBottom:     24,
    alignItems:        'center',
  },
  footerText: {
    fontSize:      10,
    color:         '#c8a070',
    letterSpacing: 0.8,
    textAlign:     'center',
  },

  // Close button
  closeBtn: {
    marginTop:         20,
    paddingVertical:   12,
    paddingHorizontal: 40,
    borderRadius:      50,
    borderWidth:       1,
    borderColor:       'rgba(212,164,76,0.35)',
  },
  closeBtnText: {
    color:         C.gold,
    fontSize:      13,
    fontWeight:    '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
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
  onClose={() => navigation.goBack()}
/>
*/