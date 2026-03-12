import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Button, useTheme } from 'react-native-paper';

const SONG = {
  title: 'Dari Logika Mistika, Lewat Filsafat, Menuju Ilmu Pengetahuan',
  artist: 'Cania Citta',
  album: "Novel",
};

type ActionLog =
  | { action: 'start' | 'resume' | 'finish'; time: Date }
  | { action: 'pause'; time: Date; timerAtPause: Date; timerAtResume: Date | null };

export default function ReadingPlayer() {
  const router = useRouter();
  const [status, setStatus] = useState('stopped'); // 'playing' | 'paused' | 'stopped'
  const [seconds, setSeconds] = useState(0);
  const [actionLog, setActionLog] = useState<ActionLog[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const spinAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const theme = useTheme();

  const logAction = (action: ActionLog) => {
    setActionLog((prev) => [...prev, action]);
  };

  const patchLastPauseWithResume = (timerAtResume: Date) => {
    setActionLog((prev) => {
      const next = [...prev];
      for (let i = next.length - 1; i >= 0; i--) {
        if (next[i].action === 'pause') {
          next[i] = { ...next[i], timerAtResume } as ActionLog;
          break;
        }
      }
      return next;
    });
  };

  // Timer
  useEffect(() => {
    if (status === 'playing') {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
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

  // Vinyl spin animation
  useEffect(() => {
    if (status === 'playing') {
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
    }
  }, [status]);

  const handlePlay = () => {
    if (status !== 'playing') {
      if (status === 'paused') {
        patchLastPauseWithResume(new Date());
        logAction({ action: 'resume', time: new Date() });
      } else {
        logAction({ action: 'start', time: new Date() });
      }
      setStatus('playing');
    }
  };

  const handlePause = (action: string = '') => {
    if (status === 'playing') {
      logAction({ action: 'pause', time: new Date(), timerAtPause: new Date(), timerAtResume: null });
      setStatus('paused');

      // open confirmation dialog if action is 'stopped'
      if (action === 'stopped') {
        router.push('/session-ended');
      }
    }
  };

  const handleStop = () => {
    const finishEntry: ActionLog = { action: 'finish', time: new Date() };
    const finalLog = [...actionLog, finishEntry];

    setStatus('stopped');
    setSeconds(0);
    setActionLog([]);
  };

  const formatTime = (s: number) => {
    const hrs = Math.floor(s / 3600).toString().padStart(2, '0');
    const mins = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${sec}`;
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <React.Fragment>
      <View style={styles.card}>
        {/* Top row */}
        <View style={styles.topRow}>
          {/* Album Art */}
          <View style={styles.albumArt}>
            <View style={styles.albumArtInner}>
              <Animated.View
                style={[styles.vinylRing, { transform: [{ rotate: spin }] }]}
              />
              <Text style={styles.albumLabel}>PAUL'S</Text>
            </View>
          </View>

          {/* Song Info */}
          <View style={styles.songInfo}>
            <View style={styles.songMeta}>
              <Text style={styles.songTitle} numberOfLines={2}>{SONG.title}</Text>
              <Text style={styles.songArtist}>{SONG.artist}</Text>
              <Text style={styles.songAlbum}>{SONG.album.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Bottom row */}
        <View style={styles.bottomRow}>
          <View style={styles.progressRow}>
            {status === 'stopped' && <>
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
            </>}

            {(status === 'playing' || status === 'paused') && (
              <Text style={styles.timer}>{formatTime(seconds)}</Text>
            )}
          </View>

          <View style={styles.controls}>
            <Button
              icon={() => <MaterialIcons name={status === 'playing' ? 'pause' : (status === 'paused' ? 'play-arrow' : 'play-lesson')} color={theme.colors.primary} size={status === 'stopped' ? 22 : 26} />}
              onPress={status === 'playing' ? () => handlePause() : handlePlay}
              style={[
                styles.controlButton, 
                { backgroundColor: 'rgba(30,144,255,0.05)' }, 
                status === 'stopped' && { width: 'auto' }
              ]}
              labelStyle={{ marginLeft: status === 'stopped' ? 14 : 10 }}
            >
              {status === 'playing' ? 'Pause' : (status === 'paused' ? 'Resume' : 'Read')}
            </Button>

            {(status === 'playing' || status === 'paused') && (
              <Button
                icon={() => <MaterialIcons name="check" color={'#2e8b57'} size={26} />}
                onPress={() => handlePause('stopped')}
                textColor={'#2e8b57'}
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#dcdcdc',
  },

  // Top row
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

  // Bottom row
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingTop: 0,
    paddingHorizontal: 12,
    paddingLeft: 20,
  },

  // Controls
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 100,
  },

  // Timer
  timer: {
    fontSize: 20,
    fontWeight: '800',
    color: '#666',
    letterSpacing: 0.5,
    fontFamily: 'Courier New, monospace',
  },

  // Progress Row
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