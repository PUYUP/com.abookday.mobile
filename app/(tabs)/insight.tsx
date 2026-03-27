import MoodMeter from '@/components/mood-meter';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InsightScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scoll}>
        <MoodMeter />
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
