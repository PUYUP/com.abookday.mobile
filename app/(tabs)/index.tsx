import ReadingPlayer from '@/components/reading-player';
import { WorldFeelMeterStats } from '@/components/stats-world-feel-meter';
import StreakCard from '@/components/streak-card';
import { ScrollView, StyleSheet, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView nestedScrollEnabled={true}>
        <View style={styles.scrollContent}>
          {/* <View style={[styles.profileRow, { paddingHorizontal: 16 }]}>
            <WelcomeProfile />
          </View> */}

          <View style={{ marginBottom: 16, paddingHorizontal: 16 }}>
            <ReadingPlayer />
          </View>

          <View style={{ marginBottom: 16, paddingHorizontal: 16 }}>
            <StreakCard />
          </View>

          <WorldFeelMeterStats />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flex: 1,
    paddingVertical: 16,
  },
  profileRow: {
    marginBottom: 16,
  }
});
