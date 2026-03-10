import ReadingPlayer from '@/components/reading-player';
import StreakCard from '@/components/streak-card';
import { StyleSheet, View } from 'react-native';

import { Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const windowHeight = Dimensions.get('window').height;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safe, { paddingTop: insets.top, paddingBottom: 16 }]}>
      <View style={styles.topSection}>
        <StreakCard />
      </View>

      <View style={styles.bottomSection}>
        <ReadingPlayer />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F0F7FF',
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
});
