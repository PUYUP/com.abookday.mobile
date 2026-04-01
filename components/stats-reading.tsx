import React, { useEffect, useRef } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    View
} from "react-native";

const DEFAULT_DATA = {
  dateRange: "Jan 1, 2025 — Mar 31, 2025",
  period: "Q1 2025",
  total: 18,
  reading: 3,
  finished: 15,
  pages: 4320,
  minutes: 2160,
  days: 72,
  activeBooks: [
    { title: "Atomic Habits", progress: 68 },
    { title: "Deep Work", progress: 40 },
    { title: "Thinking, Fast and Slow", progress: 15 },
  ],
};

type Book = { title: string; progress: number };
type ReadingData = {
  dateRange: string;
  period: string;
  total: number;
  reading: number;
  finished: number;
  pages: number;
  minutes: number;
  days: number;
  activeBooks: Book[];
};

type StatCardProps = {
  label: string;
  value: number | string;
  variant?: "default" | "blue" | "green";
};

function StatCard({ label, value, variant = "default" }: StatCardProps) {
  const cardStyle = {
    default: {
      bg: "#F5F4F0",
      labelColor: "#888780",
      valueColor: "#2C2C2A",
    },
    blue: {
      bg: "#E6F1FB",
      labelColor: "#185FA5",
      valueColor: "#0C447C",
    },
    green: {
      bg: "#EAF3DE",
      labelColor: "#3B6D11",
      valueColor: "#27500A",
    },
  }[variant];

  const displayValue =
    typeof value === "number" ? value.toLocaleString("en-US") : value;

  return (
    <View style={[styles.statCard, { backgroundColor: cardStyle.bg }]}>
      <Text style={[styles.statLabel, { color: cardStyle.labelColor }]}>
        {label}
      </Text>
      <Text style={[styles.statValue, { color: cardStyle.valueColor }]}>
        {displayValue}
      </Text>
    </View>
  );
}

type ProgressBarProps = { title: string; progress: number };

function ProgressBar({ title, progress }: ProgressBarProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 700,
      delay: 200,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={styles.progressItem}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>{title}</Text>
        <Text style={styles.progressPercent}>{progress}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

type ReadingStatsProps = { data?: ReadingData };

export default function ReadingStats({ data = DEFAULT_DATA }: ReadingStatsProps) {
    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Reading Statistics</Text>
                    <Text style={styles.dateRange}>{data.dateRange}</Text>
                </View>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{data.period}</Text>
                </View>
            </View>

            {/* Row 1: Status buku */}
            <View style={styles.row}>
                <StatCard label="Total books" value={data.total} />
                <StatCard label="Currently reading" value={data.reading} variant="blue" />
                <StatCard label="Finished" value={data.finished} variant="green" />
            </View>

            {/* Row 2: Metrik */}
            <View style={[styles.row, styles.rowGap]}>
                <StatCard label="Total pages" value={data.pages} />
                <StatCard label="Total minutes" value={data.minutes} />
                <StatCard label="Reading days" value={data.days} />
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Progress buku aktif */}
            <View style={styles.progressSection}>
                <Text style={styles.progressSectionLabel}>Active books progress</Text>
                {data.activeBooks.map((book) => (
                    <ProgressBar key={book.title} title={book.title} progress={book.progress} />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.1)",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2C2C2A",
  },
  dateRange: {
    fontSize: 13,
    color: "#888780",
    marginTop: 4,
  },
  badge: {
    backgroundColor: "#F5F4F0",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.08)",
  },
  badgeText: {
    fontSize: 12,
    color: "#5F5E5A",
  },

  // Grid rows
  row: {
    flexDirection: "row",
    gap: 10,
  },
  rowGap: {
    marginTop: 10,
  },

  // Stat card
  statCard: {
    flex: 1,
    borderRadius: 8,
    padding: 14,
    gap: 6,
  },
  statLabel: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "500",
    lineHeight: 28,
  },

  // Divider
  divider: {
    height: 0.5,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginTop: 20,
    marginBottom: 16,
  },

  // Progress section
  progressSection: {
    gap: 12,
  },
  progressSectionLabel: {
    fontSize: 12,
    color: "#888780",
  },
  progressItem: {
    gap: 4,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  progressTitle: {
    fontSize: 13,
    color: "#2C2C2A",
    flex: 1,
    marginRight: 8,
  },
  progressPercent: {
    fontSize: 12,
    color: "#888780",
  },
  progressTrack: {
    height: 5,
    backgroundColor: "rgba(0,0,0,0.08)",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#378ADD",
    borderRadius: 99,
  },
});