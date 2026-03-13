import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';

export default function WelcomeProfile() {
    const theme = useTheme();

    return (
        <View style={styles.profileRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flexDirection: 'column', maxWidth: 180 }}>
                    <Text style={styles.profileName} numberOfLines={1}>Muhammad Rahman</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <MaterialIcons name='wallet-giftcard' size={16} color={theme.colors.primary} />
                        <Text style={[styles.fansBadge, { color: theme.colors.primary }]}>10 credits</Text>
                    </View>
                </View>
            </View>

            <IconButton
                icon={() => <MaterialIcons name="settings" size={20} />}
                size={20}
                onPress={() => console.log('Pressed')}
            />
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
        fontSize: 15,
        color: '#333',
        fontFamily: 'Inter_500Medium',
        fontWeight: '600',
        marginBottom: 2,
    },
    fansBadge: {
        fontSize: 13,
        color: '#666',
    },
    topUpButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
});