/**
 * StreakCard.tsx
 *
 * Dependencies to install:
 *   npm install react-native-svg
 *   npx pod-install  (iOS)
 */

import { generateDays } from '@/utils/days-generator';
import { generateMonths } from '@/utils/months-generator';
import { generateWeeks } from '@/utils/weeks-generator';
import { generateYears } from '@/utils/years-generator';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
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
import { Menu } from 'react-native-paper';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

// ─── Constants ────────────────────────────────────────────────────────────────

const GOAL_MINUTES = 30;
const MODE_LIST = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

// ─── Streak Info Data ─────────────────────────────────────────────────────────

interface StreakInfo {
  id: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  color: string;
  label: string;
  value: string;
  unit: string;
  num: number;
  isCurrent: boolean;
  isStreaked: boolean;
};

interface GoalInfo {
  id: string;
  label: string;
  value: string;
  unit: string;
}

const STREAK_DATA = [
  { id: 'current',  icon: 'whatshot' as const,      color: '#EF4444', label: 'Current Streak',  value: '5',     unit: 'days' },
  { id: 'longest',  icon: 'star' as const,           color: '#03C430', label: 'Longest Streak',  value: '1.321', unit: 'days' },
  { id: 'failed',   icon: 'cancel' as const,         color: '#F59E0B', label: 'Failed Streak',   value: '24',    unit: 'days' },
];

const GOAL_DATA: GoalInfo[] = [
  { id: 'daily',   label: 'Day',   value: '30', unit: 'min' },
  { id: 'weekly',  label: 'Week',  value: '2', unit: 'book' },
  { id: 'monthly', label: 'Month', value: '4', unit: 'book' },
  { id: 'yearly',  label: 'Year',  value: '26', unit: 'book' },
];

// ─── Animated Circle ──────────────────────────────────────────────────────────

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── CircularProgress ─────────────────────────────────────────────────────────

interface CircularProgressProps {
  current: number;
  goal: GoalInfo;
}

function CircularProgress({ current, goal }: CircularProgressProps) {
  const RADIUS = 70;
  const STROKE = 12;
  const normalizedRadius = RADIUS - STROKE / 2;
  const circumference = 2 * Math.PI * normalizedRadius;

  const ARC_RATIO = 0.80;
  const arcLength = circumference * ARC_RATIO;
  const gapLength = circumference - arcLength;
  const trackDasharray = `${arcLength} ${gapLength}`;

  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const progress = Math.min(current / Number(goal.value), 1);
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
        <Text style={styles.circleSubtitle}>of {goal.value} {goal.unit}</Text>
      </View>
    </View>
  );
}

// ─── DayDot ───────────────────────────────────────────────────────────────────

interface DayDotProps {
  index: number;
  data: StreakInfo;
}

function DayDot({ index, data }: DayDotProps) {
  const dotBg = data.isCurrent ? '#FEF3C7' : '#F1F5F9';
  const streakedBg = data.isStreaked ? '#cff0cf' : 'transparent';
  const dotColor = data.isCurrent ? '#D97706' : '#949eac';
  const streakColor = data.isStreaked ? (data.isCurrent ? dotColor : '#2e8b57') : '#94A3B8';

  return (
    <View style={styles.dayCol}>
      <Text style={[styles.dayLabel, data.isCurrent && styles.dayLabelToday]}>
        {data.label}
      </Text>
      <View style={[styles.dayDot, { backgroundColor: data.isCurrent ? dotBg : (data.isStreaked ? streakedBg : dotBg) }]}>
        <Text style={[styles.dayDotText, { color: data.isStreaked ? streakColor : dotColor }]}>{data.value}</Text>
      </View>
    </View>
  );
}

// ─── StreakInfoItem ───────────────────────────────────────────────────────────

interface StreakInfoItemProps {
  item: typeof STREAK_DATA[number];
  goal: GoalInfo;
}

function StreakInfoItem({ item, goal }: StreakInfoItemProps) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoDesc}>
        <MaterialIcons name={item.icon} size={28} color={item.color} />
        <Text style={styles.infoLabel}>{item.label}</Text>
      </View>
      <View style={styles.infoValue}>
        <Text style={styles.infoText}>{item.value}</Text>
        <Text style={styles.infoDay}>{goal?.label + 's' || ''}</Text>
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StreakCard() {
  const router = useRouter();
  const [minutes, setMinutes] = useState(0);
  const [visible, setVisible] = React.useState(false);
  const [mode, setMode] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [streaks, setStreaks] = useState<StreakInfo[]>([]);
  const [streakLabel, setStreakLabel] = useState('Today');
  const [goalInfo, setGoalInfo] = useState<GoalInfo>(GOAL_DATA[0]);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleAdjust = () => {
    // setMinutes(prev => (prev < GOAL_MINUTES ? prev + 1 : prev));
    router.push('/adjust-goal');
  };

  useEffect(() => {
    // Daily
    if (mode === 'daily') {
      const days = generateDays();
      const _streaks = days.map(d => ({
        id: `${d.startDate.getTime()}`,
        icon: 'whatshot' as const,
        color: '#EF4444',
        label: format(d.startDate, 'EEE'),
        value: Math.floor(Math.random() * 60).toString(),
        unit: 'day',
        num: d.day,
        isCurrent: format(d.startDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
        isStreaked: Math.random() > 0.5, // Example logic for streaked status
      }));

      const currentDay = _streaks.find(s => s.isCurrent);
      if (currentDay) {
        setStreakLabel(`Today`);
      }
      setStreaks(_streaks);

      const goal = GOAL_DATA.find(g => g.id === 'daily');
      if (goal) {
        setGoalInfo(goal);
      }
    }
    // Weekly
    else if (mode === 'weekly') {
      const weeks = generateWeeks();
      const _streaks = weeks.map(w => ({
        id: `${w.startDate.getTime()}`,
        icon: 'whatshot' as const,
        color: '#EF4444',
        label: `W. ${w.week}`,
        value: Math.floor(Math.random() * 60).toString(),
        unit: 'week',
        num: w.week,
        isCurrent: format(w.startDate, 'yyyy-MM-dd') <= format(new Date(), 'yyyy-MM-dd') && format(w.endDate, 'yyyy-MM-dd') >= format(new Date(), 'yyyy-MM-dd'),
        isStreaked: Math.random() > 0.5, // Example logic for streaked status
      }));

      const currentWeek = _streaks.find(s => s.isCurrent);
      if (currentWeek) {
        setStreakLabel(`W. ${currentWeek.num}`);
      }
      setStreaks(_streaks);

      const goal = GOAL_DATA.find(g => g.id === 'weekly');
      if (goal) {
        setGoalInfo(goal);
      }
    }
    // Monthly
    else if (mode === 'monthly') {
      const months = generateMonths();
      const _streaks = months.map(m => ({
        id: `${m.startDate.getTime()}`,
        icon: 'whatshot' as const,
        color: '#EF4444',
        label: format(m.startDate, 'MMM'),
        value: Math.floor(Math.random() * 60).toString(),
        unit: 'month',
        num: m.month,
        isCurrent: format(m.startDate, 'yyyy-MM') === format(new Date(), 'yyyy-MM'),
        isStreaked: Math.random() > 0.5, // Example logic for streaked status
      }));

      const currentMonth = _streaks.find(s => s.isCurrent);
      if (currentMonth) {
        setStreakLabel(`${currentMonth.label}`);
      }
      setStreaks(_streaks);

      const goal = GOAL_DATA.find(g => g.id === 'monthly');
      if (goal) {
        setGoalInfo(goal);
      }
    }
    // Yearly
    else if (mode === 'yearly') {
      // For yearly, we can just generate months and group them by year
      const years = generateYears();
      const _streaks = years.map(y => ({
        id: `${y.startDate.getTime()}`,
        icon: 'whatshot' as const,
        color: '#EF4444',
        label: `${y.year}`,
        value: Math.floor(Math.random() * 60).toString(),
        unit: 'year',
        num: y.year,
        isCurrent: format(y.startDate, 'yyyy') === format(new Date(), 'yyyy'),
        isStreaked: Math.random() > 0.5, // Example logic for streaked status 
      }));

      const currentYear = _streaks.find(s => s.isCurrent);
      if (currentYear) {
        setStreakLabel(`${currentYear.label}`);
      }
      setStreaks(_streaks);

      const goal = GOAL_DATA.find(g => g.id === 'yearly');
      if (goal) {
        setGoalInfo(goal);
      }
    }
  }, [mode]);

  return (
    <React.Fragment>
      <View style={styles.container}>
        <View style={styles.card}>
          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity style={[styles.actionBtn, { width: 100, justifyContent: 'flex-start' }]} onPress={handleAdjust} activeOpacity={0.7}>
              <MaterialIcons name="settings" size={16} color="#3B82F6" style={styles.actionIcon} />
              <Text style={styles.actionText}>Adjust</Text>
            </TouchableOpacity>

            <Text style={[styles.title, { flex: 1, textAlign: 'center' }]}>Reading Goal</Text>
            
            <Menu
              visible={visible}
              onDismiss={closeMenu}
              anchor={
                <TouchableOpacity style={[styles.actionBtn, { width: 100, justifyContent: 'flex-end' }]} activeOpacity={0.7} onPress={openMenu}>
                  <MaterialIcons name="calendar-today" size={16} color="#3B82F6" style={styles.actionIcon} />
                  <Text style={styles.actionText}>{MODE_LIST.find(m => m.id === mode)?.label}</Text>
                </TouchableOpacity>
              }>
              <Menu.Item onPress={() => {setMode('daily'); closeMenu();}} title="Daily" trailingIcon={mode === 'daily' ? "check" : undefined} />
              <Menu.Item onPress={() => {setMode('weekly'); closeMenu();}} title="Weekly" trailingIcon={mode === 'weekly' ? "check" : undefined} />
              <Menu.Item onPress={() => {setMode('monthly'); closeMenu();}} title="Monthly" trailingIcon={mode === 'monthly' ? "check" : undefined} />
              <Menu.Item onPress={() => {setMode('yearly'); closeMenu();}} title="Yearly" trailingIcon={mode === 'yearly' ? "check" : undefined} />
            </Menu>
          </View>

          {/* ── Content ── */}
          <View style={styles.cardContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={styles.circleWrapper}>
                <CircularProgress current={minutes} goal={goalInfo} />
                <Text style={styles.todayLabel}>{streakLabel}</Text>
              </View>

              <View style={{ width: 180, paddingTop: mode === 'monthly' ? 0 : 6 }}>
                <FlatList 
                  scrollEnabled={false}
                  data={streaks}
                  keyExtractor={item => item.id}
                  numColumns={4}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12, alignItems: 'flex-end', justifyContent: 'center' }}
                  columnWrapperStyle={{ gap: 8 }}
                  renderItem={({ item, index }) => (
                    <DayDot index={index} data={item} />
                  )}
                />
              </View>
            </View>
          </View>
        </View>

        {/* ── Streak Info FlatList ── */}
        <View style={styles.infoContainer}>
          <FlatList
            scrollEnabled={false}
            data={STREAK_DATA}
            keyExtractor={item => item.id}
            numColumns={3}
            style={styles.infoList}
            columnWrapperStyle={styles.infoRow}
            renderItem={({ item }) => <StreakInfoItem item={item} goal={goalInfo} />}
          />
        </View>
      </View>
    </React.Fragment>
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
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#dcdcdc',
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },

  // Circle
  circleWrapper: {
    
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
    color: '#828fa1',
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
  dayCol: {
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 6,
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
    // shadowColor: '#3cb371',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.4,
    // shadowRadius: 4,
    // elevation: 4,
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dcdcdc',
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