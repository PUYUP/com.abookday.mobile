import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DayData {
  day: string;       // e.g. 'Sen'
  minutes: number;   // waktu membaca dalam menit
  pages: number;     // jumlah halaman
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const WEEKLY_DATA: DayData[] = [
  { day: 'Sun', minutes: 45, pages: 22 },
  { day: 'Mon', minutes: 30, pages: 14 },
  { day: 'Tue', minutes: 60, pages: 31 },
  { day: 'Wed', minutes: 20, pages: 9  },
  { day: 'Thu', minutes: 75, pages: 38 },
  { day: 'Fri', minutes: 90, pages: 47 },
  { day: 'Sat', minutes: 50, pages: 25 },
];

// ─── Design Tokens ────────────────────────────────────────────────────────────

const COLORS = {
  bg: '#fff',
  card: '#fff',
  border: '#dcdcdc',
  minutes: '#E8A857',   // amber — waktu
  minutesDim: '#E8A85740',
  pages: '#5B9CF6',     // blue — halaman
  pagesDim: '#5B9CF640',
  textPrimary: '#F0EFE8',
  textMuted: '#6E6E82',
  textLabel: '#A0A0B8',
  accent: '#E8A857',
};

const CHART_HEIGHT = 100;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32; // 16px padding each side

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converts DayData array into gifted-charts bar data (grouped / side-by-side) */
function buildBarData(data: DayData[]) {
  return data.flatMap((d, i) => [
    {
      value: d.minutes,
      label: d.day,
      frontColor: COLORS.minutes,
      gradientColor: COLORS.minutesDim,
      spacing: 4,
      labelTextStyle: styles.barLabel,
      topLabelComponent: () => (
        <Text style={{ 
          color: COLORS.minutes, 
          fontSize: 10, 
          marginBottom: d.minutes > 0 ? 4 : 10
        }}>
          {d.minutes}
        </Text>
      ),
    },
    {
      value: d.pages,
      frontColor: COLORS.pages,
      gradientColor: COLORS.pagesDim,
      spacing: 18,    // gap between day-groups
      labelTextStyle: styles.barLabel,
      topLabelComponent: () => (
        <Text style={{ 
          color: COLORS.pages, 
          fontSize: 10, 
          marginBottom: d.pages > 0 ? 4 : 10
        }}>
          {d.pages}
        </Text>
      ),
    },
  ]);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function StatPill({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string | null;
  color: string;
}) {
  return (
    <View style={[styles.statPill, { borderColor: color + '40', backgroundColor: color + '20' }]}>
      <View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>
          {value}
          {unit && <Text style={styles.statUnit}> {unit}</Text>}
        </Text>        
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PagesOverTimeStats() {
  const [activeDay, setActiveDay] = useState<number | null>(null);

  const totalMinutes = WEEKLY_DATA.reduce((s, d) => s + d.minutes, 0);
  const totalPages   = WEEKLY_DATA.reduce((s, d) => s + d.pages, 0);
  const avgMinutes   = Math.round(totalMinutes / WEEKLY_DATA.length);
  const avgPages     = Math.round(totalPages   / WEEKLY_DATA.length);

  const selected = activeDay !== null ? WEEKLY_DATA[activeDay] : null;

  const barData = buildBarData(WEEKLY_DATA);

  // max values for yAxis
  const maxMinutes = Math.max(...WEEKLY_DATA.map(d => d.minutes));
  const maxPages   = Math.max(...WEEKLY_DATA.map(d => d.pages));
  const yMax       = Math.ceil(Math.max(maxMinutes, maxPages) / 10) * 10 + 10;

  return (
    <View style={{ paddingHorizontal: 16 }}>
        <View style={styles.container}>
            {/* ── Header ─────────────────────────────────────── */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Pages Over Time</Text>
                    <Text style={styles.subtitle}>2 Jan - 8 Jan</Text>
                </View>
                <View style={styles.legendRow}>
                    <LegendDot color={COLORS.minutes} label="Minutes" />
                    <LegendDot color={COLORS.pages}   label="Pages" />
                </View>
                <View>
                    <TouchableOpacity style={styles.filterButton}>
                        <MaterialIcons name="calendar-month" size={20} color={COLORS.textMuted} />
                        <Text style={styles.filterText}>Change</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Chart ──────────────────────────────────────── */}
            <View style={styles.chartWrapper}>
                <BarChart
                    data={barData}
                    width={CHART_WIDTH - 40}  // leave room for yAxis labels
                    height={CHART_HEIGHT}
                    barWidth={14}
                    labelWidth={32}
                    isAnimated
                    animationDuration={600}
                    noOfSections={5}
                    maxValue={yMax}
                    yAxisThickness={0}
                    xAxisThickness={0}
                    xAxisColor={COLORS.border}
                    yAxisTextStyle={styles.yAxisText}
                    hideRules={true}
                    showGradient
                    roundedTop
                    backgroundColor={COLORS.bg}
                />
            </View>

            {/* ── Summary stats ──────────────────────────────── */}
            <View style={styles.statsRow}>
                <StatPill label="Minutes Total"   value={totalMinutes} unit={null} color={COLORS.minutes} />
                <StatPill label="Total Pages" value={totalPages}   unit={null} color={COLORS.pages}   />
                <StatPill label="Average/Day" value={avgMinutes}  unit="min" color={COLORS.minutes} />
                <StatPill label="Average/Day" value={avgPages}    unit="pages" color={COLORS.pages}   />
            </View>
        </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#dcdcdc',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#6B6B8A',
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  legendRow: {
    flexDirection: 'column',
    gap: 0,
    alignItems: 'flex-start',
    marginTop: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.textLabel,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 8,
    flex: 1,
    minWidth: '44%',
  },
  statAccent: {
    width: 3,
    height: 28,
    borderRadius: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statUnit: {
    fontSize: 11,
    fontWeight: '400',
    color: COLORS.textMuted,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },

  // Chart
  chartWrapper: {
    paddingTop: 12,
    paddingBottom: 4,
    overflow: 'hidden',
  },
  barLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  yAxisText: {
    color: COLORS.textMuted,
    fontSize: 10,
  },

  // Tooltip
  tooltip: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  tooltipDay: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  tooltipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tooltipDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  tooltipText: {
    fontSize: 13,
    color: COLORS.textLabel,
  },
  tooltipClose: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },

  // Filter
  filterButton: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
});