import PagesOverTimeStats from '@/components/stats-pages-over-time';
import ReadingStats from '@/components/stats-reading';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InsightScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scoll}>
        <View style={{ marginTop: 16 }}>
          <PagesOverTimeStats />
        </View>

        <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
          <ReadingStats />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scoll: {
    paddingTop: 10,
  },
});
