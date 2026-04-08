import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const DEFAULT_DATA = {
  total: 18,
  reading: 3,
  finished: 15,
};

type ReadingData = {
  total: number;
  reading: number;
  finished: number;
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
    <TouchableOpacity style={[styles.statCard, { backgroundColor: cardStyle.bg }]}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: 'space-between' }}>
        <Text style={[styles.statLabel, { color: cardStyle.labelColor }]}>
          {label}
        </Text>

        <MaterialIcons name="arrow-forward-ios" size={12} color={cardStyle.labelColor} />
      </View>
      <Text style={[styles.statValue, { color: cardStyle.valueColor }]}>
        {displayValue}
      </Text>
    </TouchableOpacity>
  );
}

type ReadingStatsProps = { data?: ReadingData };

export default function ReadingStatsBook({ data = DEFAULT_DATA }: ReadingStatsProps) {
    return (
        <View style={styles.card}>
            <View style={styles.row}>
                <StatCard label="Reading" value={data.reading} variant="blue" />
                <StatCard label="Finished" value={data.finished} variant="green" />
                <StatCard label="Total" value={data.total} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  card: {},

  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2C2C2A",
  },

  // Grid rows
  row: {
    flexDirection: "row",
    gap: 16,
  },
  rowGap: {
    marginTop: 10,
  },

  // Stat card
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    paddingVertical: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: "#E0E0DC",
  },
  statLabel: {
    fontSize: 12,
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "500",
    lineHeight: 28,
  },
});