import ReadingPlayer from '@/components/reading-player';
import StreakCard from '@/components/streak-card';
import WelcomeProfile from '@/components/welcome-profile';
import { ScrollView, StyleSheet, View } from 'react-native';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView nestedScrollEnabled={true}>
        <View style={styles.topSection}>
          <View style={styles.profileRow}>
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
  container: {
    justifyContent: 'space-between',
  },
  topSection: {
    flex: 1,
    padding: 16,
  },
  bottomSection: {
    paddingHorizontal: 16,
    justifyContent: 'flex-end',
  },

  profileRow: {
    marginBottom: 16,
  }
});
