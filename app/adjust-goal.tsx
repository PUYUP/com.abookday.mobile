import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdjustGoalScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView>
            <Text style={styles.text}>Adjust Goal Screen</Text>
        </ScrollView>
    </SafeAreaView>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
});