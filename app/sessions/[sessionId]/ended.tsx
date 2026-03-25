import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SessionEnded() {
    return (
        <SafeAreaView style={styles.safeArea}>
            
        </SafeAreaView>
    )
}

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    }
});