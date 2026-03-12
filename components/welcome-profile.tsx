import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

export default function WelcomeProfile() {
    return (
        <View style={styles.profileRow}>
            <View style={styles.avatar}>
                <MaterialIcons name='account-circle' size={24} color="#fff" />
            </View>
            <View style={{ flexDirection: 'column' }}>
                <Text style={styles.profileName}>Muhammad Rahman</Text>
                <Text style={styles.fansBadge}>Supporter</Text>
            </View>
        </View>
    )
}

export const styles = StyleSheet.create({
    /* profile */
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#2f4f4f',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileName: {
        fontSize: 15,
        color: '#333',
        fontFamily: 'Inter_500Medium',
        fontWeight: '600',
        marginBottom: 1,
    },
    fansBadge: {
        fontSize: 13,
        color: '#666',
        fontFamily: 'Inter_400Regular',
    },
});