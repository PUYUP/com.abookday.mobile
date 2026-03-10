/**
 * StreakCard.tsx
 *
 * Dependencies to install:
 *   npm install react-native-svg
 *   npx pod-install  (iOS)
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

// ─── Constants ────────────────────────────────────────────────────────────────

const GOAL_MINUTES = 30;
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TODAY_INDEX = 1; // Tuesday

const WEEK_DATA = [
  { read: true,  mins: 8 },
  { read: false, mins: 3 },
  { read: false, mins: 0 },
  { read: false, mins: 0 },
  { read: false, mins: 0 },
  { read: false, mins: 0 },
  { read: false, mins: 0 },
];

// ─── Streak Info Data ─────────────────────────────────────────────────────────

const STREAK_DATA = [
  { id: 'current',  icon: 'whatshot' as const,      color: '#EF4444', label: 'Current Streak',  value: '5',     unit: 'days' },
  { id: 'longest',  icon: 'star' as const,           color: '#03C430', label: 'Longest Streak',  value: '1.321', unit: 'days' },
  { id: 'failed',   icon: 'cancel' as const,         color: '#F59E0B', label: 'Failed Streak',   value: '24',    unit: 'days' },
];

// ─── Animated Circle ──────────────────────────────────────────────────────────

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── CircularProgress ─────────────────────────────────────────────────────────

interface CircularProgressProps {
  current: number;
  goal: number;
}

function CircularProgress({ current, goal }: CircularProgressProps) {
  const RADIUS = 80;
  const STROKE = 16;
  const normalizedRadius = RADIUS - STROKE / 2;
  const circumference = 2 * Math.PI * normalizedRadius;

  const ARC_RATIO = 0.80;
  const arcLength = circumference * ARC_RATIO;
  const gapLength = circumference - arcLength;
  const trackDasharray = `${arcLength} ${gapLength}`;

  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const progress = Math.min(current / goal, 1);
    const targetOffset = arcLength - progress * arcLength;

    Animated.timing(animatedValue, {
      toValue: targetOffset,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [current, goal]);

  const size = RADIUS * 2;
  const svgRotationDeg = 180 * ARC_RATIO - 17.85;
  const svgRotation = `${svgRotationDeg}deg`;

  return (
    <View style={{ width: size, height: size }}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: [{ rotate: svgRotation }] }}
      >
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#22C55E" />
            <Stop offset="100%" stopColor="#16A34A" />
          </LinearGradient>
        </Defs>

        <Circle
          stroke="#E8EEF4"
          fill="transparent"
          strokeWidth={STROKE}
          strokeDasharray={trackDasharray}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={RADIUS}
          cy={RADIUS}
        />

        <AnimatedCircle
          stroke="url(#grad)"
          fill="transparent"
          strokeWidth={STROKE}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={animatedValue}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={RADIUS}
          cy={RADIUS}
        />
      </Svg>

      <View style={styles.circleCenter}>
        <Text style={styles.circleNumber}>{current}</Text>
        <Text style={styles.circleSubtitle}>of {goal} min</Text>
      </View>
    </View>
  );
}

// ─── DayDot ───────────────────────────────────────────────────────────────────

interface DayDotProps {
  day: string;
  index: number;
  data: { read: boolean; mins: number };
}

function DayDot({ day, index, data }: DayDotProps) {
  const isToday = index === TODAY_INDEX;
  const label = data.mins > 0 ? String(data.mins) : String(index + 7);

  const dotBg = data.read ? '#3cb371' : isToday ? '#FEF3C7' : '#F1F5F9';
  const dotColor = data.read ? '#FFFFFF' : isToday ? '#D97706' : '#CBD5E1';

  return (
    <View style={styles.dayCol}>
      <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
        {day}
      </Text>
      <View style={[styles.dayDot, { backgroundColor: dotBg }, data.read && styles.dayDotShadow]}>
        <Text style={[styles.dayDotText, { color: dotColor }]}>{label}</Text>
      </View>
    </View>
  );
}

// ─── StreakInfoItem ───────────────────────────────────────────────────────────

interface StreakInfoItemProps {
  item: typeof STREAK_DATA[number];
}

function StreakInfoItem({ item }: StreakInfoItemProps) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoDesc}>
        <MaterialIcons name={item.icon} size={28} color={item.color} />
        <Text style={styles.infoLabel}>{item.label}</Text>
      </View>
      <View style={styles.infoValue}>
        <Text style={styles.infoText}>{item.value}</Text>
        <Text style={styles.infoDay}>{item.unit}</Text>
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StreakCard() {
  const [minutes, setMinutes] = useState(0);

  const handleAdjust = () => {
    setMinutes(prev => (prev < GOAL_MINUTES ? prev + 1 : prev));
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleAdjust} activeOpacity={0.7}>
            <MaterialIcons name="settings" size={16} color="#3B82F6" style={styles.actionIcon} />
            <Text style={styles.actionText}>Adjust</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Reading Goal</Text>

          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
            <MaterialIcons name="calendar-today" size={16} color="#3B82F6" style={styles.actionIcon} />
            <Text style={styles.actionText}>Daily</Text>
          </TouchableOpacity>
        </View>

        {/* ── Content ── */}
        <View style={styles.cardContent}>
          <View style={styles.circleWrapper}>
            <CircularProgress current={minutes} goal={GOAL_MINUTES} />
            <Text style={styles.todayLabel}>Today</Text>
          </View>

          <View style={styles.weekRow}>
            {DAYS.map((day, i) => (
              <DayDot key={day} day={day} index={i} data={WEEK_DATA[i]} />
            ))}
          </View>
        </View>
      </View>

      {/* ── Streak Info FlatList ── */}
      <View style={styles.infoContainer}>
        <FlatList
          data={STREAK_DATA}
          keyExtractor={item => item.id}
          numColumns={3}
          scrollEnabled={false}
          style={styles.infoList}
          columnWrapperStyle={styles.infoRow}
          renderItem={({ item }) => <StreakInfoItem item={item} />}
        />
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },

  // Card
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8EEF4',
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 28,
    alignItems: 'center',
  },

  // Header
  header: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
  },

  // Circle
  circleWrapper: {
    marginBottom: 8,
  },
  circleCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleNumber: {
    fontSize: 38,
    fontWeight: '800',
    color: '#1A1A2E',
    lineHeight: 44,
  },
  circleSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },

  // Today label
  todayLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 4,
    marginBottom: 20,
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
    textAlign: 'center',
  },

  // Action buttons
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 5,
    color: '#3B82F6',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
  },

  // Week row
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  dayCol: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dayLabelToday: {
    color: '#1A1A2E',
  },
  dayDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotShadow: {
    shadowColor: '#3cb371',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  dayDotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Streak Info FlatList
  infoContainer: {  
    width: '100%',
    marginTop: 16,
  },
  infoList: {},
  infoRow: {
    flex: 1,
    gap: 16,
  },
  infoItem: {
    flex: 1,                   // ← tiap item dapat lebar yang sama
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EEF4',
  },
  infoLabel: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 2,
  },
  infoValue: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  infoText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  infoDesc: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 4,
  },
  infoDay: {
    fontSize: 10,
    fontWeight: '600',
    color: '#5e5e61',
    textTransform: 'uppercase',
    marginTop: 3,
  },
});