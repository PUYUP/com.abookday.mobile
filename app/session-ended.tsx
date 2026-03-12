import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

const MOOD_OPTIONS = [
  { id: 'happy', label: 'Happy', emoji: '😊', color: '#C9A84C' },
  { id: 'calm', label: 'Calm', emoji: '😌', color: '#4A8C75' },
  { id: 'thoughtful', label: 'Thoughtful', emoji: '🤔', color: '#4A7A8C' },
  { id: 'inspired', label: 'Inspired', emoji: '😮', color: '#8C4A6E' },
  { id: 'emotional', label: 'Emotional', emoji: '😢', color: '#6B5FA0' },
  { id: 'sleepy', label: 'Sleepy', emoji: '😴', color: '#7A8C9E' },
];

type MoodOption = typeof MOOD_OPTIONS[number];

export interface SessionData {
    mood: MoodOption['id'];
    lastPage: string;
    timer: TimerData[];
    note?: string;
}

export interface TimerData {
    action: 'start' | 'pause' | 'resume' | 'finish';
    time: Date;
    timerAtPause?: Date;
    timerAtResume?: Date;
}

export default function SessionEndedScreen() {
    const router = useRouter();
    const [selectedMood, setSelectedMood] = useState<MoodOption['id'] | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const navigation = useNavigation();
    const hasUnsavedChanges = true; // Replace with your actual logic

    // ----- Form submission and unsaved changes handling -----
    const { control, handleSubmit, setValue, formState } = useForm<SessionData>({
        defaultValues: {
            mood: '',
            lastPage: '',
            note: '',
            timer: [], // You can populate this with actual timer data if needed
        }
    });

    useEffect(() => {
        setValue('mood', selectedMood || '');
    }, [selectedMood, setValue]);

    useEffect(() => {
        if (submitted) return; // Don't prompt if the form has already been submitted

        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // Prevent default behavior of leaving the screen
            if (!hasUnsavedChanges) {
                return;
            }

            e.preventDefault(); // Stop the screen from going back

            // Prompt the user to confirm
            Alert.alert(
                'Discard changes?',
                'You have unsaved changes. Are you sure you want to discard them and leave the screen?',
                [
                    { text: "Stay", style: 'cancel', onPress: () => {} },
                    {
                        text: "Discard",
                        style: 'destructive',
                        // If the user confirms, we can then dispatch the original action
                        // using `navigation.dispatch(e.data.action)`
                        onPress: () => navigation.dispatch(e.data.action),
                    },
                ]
            );
        });

        return unsubscribe; // Clean up the listener
    }, [navigation, hasUnsavedChanges, submitted]);

    const saveHandler = handleSubmit((data) => {
        // check mood, lastPage
        if (!data.mood) {
            Alert.alert('Validation Error', 'Please select how you felt during the session.');
            return;
        }

        if (!data.lastPage.trim()) {
            Alert.alert('Validation Error', 'Please enter the last page you read.');
            return;
        }

        // Save the session data (e.g., send to backend or store locally)
        console.log('Session Data:', data);
        setSubmitted(true);
        router.back(); // Go back to the previous screen after saving
    });

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAwareScrollView 
                bottomOffset={80} 
                scrollToOverflowEnabled={false} 
                ScrollViewComponent={ScrollView}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.inner}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Session Complete 🎉</Text>
                        <View style={styles.durationPill}>
                        <Text style={styles.durationDot}>●</Text>
                        <Text style={styles.durationText}>24 minutes read</Text>
                        </View>
                    </View>
            
                    <View style={styles.divider} />

                    <View style={{ flexDirection: 'row', gap: 16, justifyContent: 'space-between' }}>
                        {/* Mood */}
                        <View style={[styles.section, { flex: 0 }]}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>How did this session feel?*</Text>
                            </View>
                
                            {selectedMood === null && submitted && (
                                <Text style={styles.errorText}>Please select how you feel</Text>
                            )}
                        
                            <FlatList 
                                scrollEnabled={false}
                                keyboardShouldPersistTaps="handled"
                                numColumns={3}
                                data={MOOD_OPTIONS}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={styles.moodGrid}
                                columnWrapperStyle={{ justifyContent: 'space-between' }}
                                renderItem={({ item: mood }) => {
                                    const isSelected = selectedMood === mood.id;
                                    return (
                                        <TouchableOpacity
                                            key={mood.id}
                                            style={[
                                                styles.moodCard,
                                                isSelected && { borderColor: mood.color, backgroundColor: `${mood.color}18` },
                                            ]}
                                            onPress={() => setSelectedMood(mood.id)}
                                            activeOpacity={0.75}
                                        >
                                            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>

                        {/* Last Page */}
                        <View style={[styles.section, { width: 130 }]}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Last read page*</Text>
                            </View>
                            <Controller
                                control={control}
                                name='lastPage'
                                rules={{ required: true }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <React.Fragment>
                                        <TextInput
                                            style={[
                                                styles.pageInput,
                                                value.trim() === '' && submitted ? styles.inputError : null,
                                            ]}
                                            placeholder="e.g. 142"
                                            placeholderTextColor="#B0B8C1"
                                            keyboardType="number-pad"
                                            value={value}
                                            onChangeText={onChange}
                                            maxLength={5}
                                        />

                                        {value.trim() === '' && submitted && (
                                            <Text style={styles.errorText}>Please enter the last page you read</Text>
                                        )}
                                    </React.Fragment>
                                )}
                            />
                        </View>
                    </View>

                    {/* Note */}
                    <View style={[styles.section, { marginBottom: 0 }]}>
                        <Controller
                                control={control}
                                name='note'
                                rules={{ required: false }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <React.Fragment>
                                        <TextInput
                                            style={styles.noteInput}
                                            placeholder="Thoughts, quotes, reflections… (optional)"
                                            placeholderTextColor="#B0B8C1"
                                            multiline
                                            value={value}
                                            onChangeText={onChange}
                                            textAlignVertical="top"
                                        />
                                        {value && <Text style={styles.charCount}>{value.length} / 300</Text>}
                                    </React.Fragment>
                                )}
                            />
                    </View>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={[styles.button, !formState.isValid && { opacity: 0.6 }]} 
                        onPress={saveHandler}
                        disabled={formState.isSubmitting || !formState.isValid}
                    >
                        <Text style={styles.text}>Save Session</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    inner: {
        padding: 16,
        paddingTop: 32,
        paddingBottom: 0,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#007BFF',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 25,
    },
    text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    /* Header */
    header: {
        alignItems: 'center',
        marginBottom: 28,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#2D3748',
        letterSpacing: -0.5,
        marginBottom: 10,
    },
    durationPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#E2E8F0',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 100,
    },
    durationDot: {
        fontSize: 8,
        color: '#68D391',
    },
    durationText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#4A5568',
        letterSpacing: 0.2,
    },

    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginBottom: 28,
    },

    /* Sections */
    section: {
        marginBottom: 28,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A5568',
    },

    /* Mood grid */
    moodGrid: {
        gap: 8,
    },
    moodCard: {
        width: 56,
        height: 56,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    moodEmoji: {
        fontSize: 30,
        position: 'relative',
    },

    /* Page input */
    pageInput: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 14,
        fontSize: 22,
        fontWeight: '600',
        color: '#2D3748',
        flex: 1,
        width: '100%',
        textAlign: 'center',
    },
    inputError: {
        borderColor: '#FC8181',
    },
    errorText: {
        fontSize: 12,
        color: '#E53E3E',
        marginTop: 6,
    },

    /* Note */
    noteInput: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 10,
        fontSize: 15,
        color: '#2D3748',
        minHeight: 100,
    },
    charCount: {
        fontSize: 11,
        color: '#CBD5E0',
        textAlign: 'right',
        marginTop: 6,
    },

    /* Footer */
    footer: {
        padding: 16,
    }
});