import { MOOD_OPTIONS } from '@/state/reading/reading-slice';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MoodData {
  [key: string]: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_TODAY_DATA: MoodData = {
  sleepy:     12,
  emotional:  8,
  inspired:   15,
  thoughtful: 22,
  calm:       18,
  happy:      25,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getTotalVotes = (data: MoodData) =>
  Object.values(data).reduce((a, b) => a + b, 0);

const getPercentage = (count: number, total: number) =>
  total === 0 ? 0 : Math.round((count / total) * 100);

// ─── Component ────────────────────────────────────────────────────────────────

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_PADDING = 20;
const BAR_WIDTH = 36;
const BAR_COUNT = MOOD_OPTIONS.length;
const Y_AXIS_LABEL_WIDTH = 0;
const CHART_WIDTH = (SCREEN_W - CARD_PADDING * 2 - Y_AXIS_LABEL_WIDTH) - 32; // 32 is wrapper paddingHorizontal in this component, to give some space on the sides of the chart
const BAR_SPACING = Math.floor((CHART_WIDTH - BAR_WIDTH * BAR_COUNT) / (BAR_COUNT - 1));
const CHART_HEIGHT = 140;

export const WorldFeelMeterStats: React.FC = () => {
  const [moodData] = useState<MoodData>(MOCK_TODAY_DATA);
  const total = getTotalVotes(moodData);
  const [chartKey, setChartKey] = useState(0);

  const barData = MOOD_OPTIONS.map(mood => {
    const value = getPercentage(moodData[mood.id] ?? 0, total);
    return {
        value: value,
        frontColor: mood.color,
        gradientColor: mood.color + '55',
        topLabelComponent: () => (
            <Text style={{ 
                color: mood.color, 
                fontSize: 10, 
                fontWeight: '700', 
                marginBottom: value > 0 ? 4 : 10
            }}>
                {value}%
            </Text>
        ),
    }
  });

  const refresh = () => setChartKey(k => k + 1);

  return (
    <View style={{ paddingHorizontal: 16 }}>
      <View style={styles.chartCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 }}>
            <Text style={styles.sectionLabel}>Today's World Reader Feel</Text>
            <TouchableOpacity onPress={refresh}>
                <Text style={{ color: '#007AFF', fontSize: 14 }}>Refresh</Text>
            </TouchableOpacity>
        </View>

        <View style={{ height: CHART_HEIGHT, overflow: 'hidden' }}>
          {/* Manual background tracks — rendered behind the chart */}
          <View style={styles.trackRow}>
            {MOOD_OPTIONS.map(mood => (
              <View
                key={mood.id}
                style={[styles.track, { width: BAR_WIDTH, height: CHART_HEIGHT - 20 }]}
              />
            ))}
          </View>

          <View style={StyleSheet.absoluteFill}>
            <BarChart
              key={chartKey}
              data={barData}
              width={CHART_WIDTH}
              barWidth={BAR_WIDTH}
              spacing={BAR_SPACING}
              initialSpacing={0}
              height={CHART_HEIGHT}
              endSpacing={0}
              yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
              roundedTop
              hideRules
              hideAxesAndRules
              disableScroll
              isAnimated
              animationDuration={900}
              showGradient
              barBorderRadius={8}
              noOfSections={4}
              yAxisThickness={0}
              xAxisThickness={0}
              labelWidth={BAR_WIDTH}
              cappedBars
              capColor={'transparent'}
              capThickness={0}
            />
          </View>
        </View>

        <View style={styles.emojiRow}>
          {MOOD_OPTIONS.map(mood => (
            <View key={mood.id} style={styles.emojiCell}>
              <Text style={styles.emojiAxisLabel}>{mood.emoji}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  chartCard: {
    paddingHorizontal: CARD_PADDING,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#dcdcdc',
  },
  sectionLabel: {
    fontSize: 17,
    color: '#6B6B8A',
    textAlign: 'center',
    fontWeight: '600',
  },
  trackRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  track: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  emojiRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emojiCell: {
    alignItems: 'center',
    width: BAR_WIDTH,
  },
  emojiAxisLabel: {
    fontSize: 28,
  },
});

export default WorldFeelMeterStats;