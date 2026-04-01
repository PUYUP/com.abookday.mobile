import CreditList from '@/components/credit-list';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AccountScreen() {
  const theme = useTheme();
  
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView nestedScrollEnabled={true}>
        {/* Profile */}
        <View style={styles.profileRow}>
          <Text style={styles.profileName}>Muhammad Rahman</Text>
          <Text style={styles.credits}>23 Credits Available</Text>
          <Button
            mode="contained"
            icon={() => <MaterialIcons name="card-giftcard" size={20} color={'#fff'} />}
            onPress={() => console.log('Pressed')}
            style={{ marginTop: 6 }}
          >
            Buy Credit
          </Button>
        </View>

        {/* Credit List */}
        <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
          <CreditList />
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
  profileRow: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 4,
    textAlign: 'center',
  },
  profileName: {
    fontSize: 24,
    color: '#333',
    fontFamily: 'Inter_500Medium',
    fontWeight: '700',
    textAlign: 'center',
  },
  credits: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
