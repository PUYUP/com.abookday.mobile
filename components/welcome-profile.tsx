import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

export default function WelcomeProfile() {
    const theme = useTheme();

    return (
        <View style={styles.profileRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flexDirection: 'column', maxWidth: 180 }}>
                    <Text style={styles.profileName} numberOfLines={1}>Muhammad Rahman</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={[styles.fansBadge, { color: '#424242' }]}>10 credits</Text>
                    </View>
                </View>
            </View>

            <Button
                icon={() => <MaterialIcons name="card-giftcard" size={20} color={theme.colors.primary} />}
                onPress={() => console.log('Pressed')}
            >
                Buy Credit
            </Button>
        </View>
    )
}

export const styles = StyleSheet.create({
    /* profile */
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        fontSize: 16,
        color: '#333',
        fontFamily: 'Inter_500Medium',
        fontWeight: '700',
        marginBottom: 1,
    },
    fansBadge: {
        fontSize: 15,
        color: '#666',
    },
    topUpButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
});