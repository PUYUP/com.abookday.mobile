import ReadingPlayer from '@/components/reading-player';
import StreakCard from '@/components/streak-card';
import WelcomeProfile from '@/components/welcome-profile';
import { ScrollView, StyleSheet, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView nestedScrollEnabled={true}>
        <View style={styles.scrollContent}>
          <View style={[styles.profileRow, { paddingLeft: 6 }]}>
            <WelcomeProfile />
          </View>

          <View style={{ marginBottom: 16 }}>
            <ReadingPlayer />
          </View>
          <StreakCard />
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
    padding: 16,
  },
  profileRow: {
    marginBottom: 16,
  }
});
