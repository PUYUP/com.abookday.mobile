import { ScrollView, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

interface CreditItem {
  id: string;
  type: "buy" | "used";
  name: string;
  amount: number;
  date: string;
  status?: "completed" | "pending" | "failed";
  bookName?: string;
}

const DEMO_CREDITS: CreditItem[] = [
  {
    id: "1",
    type: "buy",
    name: "Pinky Jackets",
    amount: -1,
    date: "30 Dec, 10:24 am",
    status: "completed",
  },
  {
    id: "2",
    type: "buy",
    name: "Buy Credit",
    amount: 20,
    date: "30 Dec, 10:24 am",
    status: "completed",
  },
  {
    id: "3",
    type: "used",
    name: "Collar Contrast Cardigan",
    amount: -1,
    date: "30 Dec, 10:24 am",
    bookName: "The Great Gatsby",
  },
  {
    id: "4",
    type: "used",
    name: "Cow Collar Cardigan",
    amount: -1,
    date: "30 Dec, 10:24 am",
    bookName: "To Kill a Mockingbird",
  },
  {
    id: "5",
    type: "buy",
    name: "Gradient Winter Coat",
    amount: -1,
    date: "30 Dec, 10:24 am",
    status: "completed",
  },
  {
    id: "6",
    type: "used",
    name: "Patchwork Skate Shoes",
    amount: -93.72,
    date: "30 Dec, 10:24 am",
    bookName: "1984",
  },
  {
    id: "7",
    type: "buy",
    name: "Summer Collection",
    amount: 10,
    date: "29 Dec, 09:15 am",
    status: "completed",
  },
  {
    id: "8",
    type: "used",
    name: "Black Leather Jacket",
    amount: -1,
    date: "29 Dec, 08:30 am",
    bookName: "The Catcher in the Rye",
  },
  {
    id: "9",
    type: "buy",
    name: "Premium Package",
    amount: 5,
    date: "28 Dec, 14:45 pm",
    status: "pending",
  },
  {
    id: "10",
    type: "used",
    name: "Weekend Casual",
    amount: -1,
    date: "28 Dec, 11:20 am",
    bookName: "Pride and Prejudice",
  },
];

function CreditItemRow({ item }: { item: CreditItem }) {
  const isPositive = item.amount > 0;
  const amountColor = isPositive ? "#4CAF50" : "#FF6B6B";
  const amountSign = isPositive ? "+" : "-";

  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemLeft}>
        <View style={styles.itemInfo}>
          {item.type === "used" ? (
            <>
              <ThemedText style={styles.itemName}>📖 {item.bookName}</ThemedText>
              <ThemedText style={styles.itemDate}>{item.date}</ThemedText>
            </>
          ) : (
            <>
              <ThemedText style={styles.itemName}>{item.name}</ThemedText>
              <ThemedText style={styles.itemDate}>{item.date}</ThemedText>
            </>
          )}
        </View>
      </View>
      <ThemedText style={[styles.amount, { color: amountColor }]}>
        {amountSign}{Math.abs(item.amount).toFixed(0)}
      </ThemedText>
    </View>
  );
}

export default function CreditList() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.listContainer}>
        {DEMO_CREDITS.map((item) => (
          <CreditItemRow key={item.id} item={item} />
        ))}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    backgroundColor: "transparent",
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    paddingRight: 18,
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
  },
  itemDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
});