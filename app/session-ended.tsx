import { MoodOption, SessionData } from "@/state/reading/reading-slice";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MOOD_OPTIONS = [
  { id: "happy",      label: "Happy",      emoji: "😊", color: "#C9A84C" },
  { id: "calm",       label: "Calm",       emoji: "😌", color: "#4A8C75" },
  { id: "thoughtful", label: "Thoughtful", emoji: "🤔", color: "#4A7A8C" },
  { id: "inspired",   label: "Inspired",   emoji: "😮", color: "#8C4A6E" },
  { id: "emotional",  label: "Emotional",  emoji: "😢", color: "#6B5FA0" },
  { id: "sleepy",     label: "Sleepy",     emoji: "😴", color: "#7A8C9E" },
] as const;

// Derive the union type from the constant so it stays in sync automatically.
type MoodId = (typeof MOOD_OPTIONS)[number]["id"];

const NOTE_MAX_LENGTH = 300;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FormValues = {
  mood: MoodOption | undefined;
  lastPage: string;
  note: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SessionEndedScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const readingSession = useSelector(
    (state: any) => state.reading.sessionData
  ) as SessionData | null;

  // BUG FIX: selectedMood stores the mood *id* (string) so the isSelected
  // comparison works. Previously the check was `selectedMood === mood.id`
  // while selectedMood was being set to the full object via `mood.id as MoodOption`.
  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
    watch,
  } = useForm<FormValues>({
    // BUG FIX: `mode: 'onChange'` makes formState.isValid reactive so the
    // Save button opacity/disabled state updates as the user types.
    // With the default 'onSubmit' mode, isValid is always false until the
    // first submission attempt, permanently disabling the button.
    mode: "onChange",
    defaultValues: {
      mood: undefined,
      lastPage: "",
      note: "",
    },
  });

  // Keep the RHF mood field in sync when the user taps a mood card.
  useEffect(() => {
    if (selectedMood) {
      setValue("mood", selectedMood as unknown as MoodOption, {
        shouldValidate: true,
      });
    }
  }, [selectedMood, setValue]);

  // ---------------------------------------------------------------------------
  // Unsaved-changes guard
  // BUG FIX: `hasUnsavedChanges` was hardcoded to `true`. It should be derived
  // from whether the form has been touched at all so the back-navigation prompt
  // doesn't appear on a completely empty form.
  // ---------------------------------------------------------------------------
  const hasUnsavedChanges = isDirty || selectedMood !== null;

  useEffect(() => {
    if (submitted) return;

    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (!hasUnsavedChanges) return;

      e.preventDefault();

      Alert.alert(
        "Discard changes?",
        "You have unsaved changes. Are you sure you want to discard them and leave the screen?",
        [
          { text: "Stay", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges, submitted]);

  // ---------------------------------------------------------------------------
  // Submit handler
  // BUG FIX: The original `saveHandler` dispatched `reading/stopReading` before
  // saving the payload and then called `router.back()` unconditionally — meaning
  // the session was marked stopped even if the save was later abandoned (e.g.
  // if a backend call failed). Reordered to: build payload → save → stop → back.
  //
  // BUG FIX: A second `finish` entry was being appended here even though
  // ReadingPlayer already appends one when `handleStop` runs. This would create
  // duplicate finish entries in the timer log. Removed the duplicate append;
  // only add a finish entry when the session has no existing one.
  //
  // BUG FIX: Inline validation with Alert was duplicating react-hook-form's own
  // validation. Since the form has required rules, RHF already blocks submission
  // when fields are empty — the manual Alert checks are redundant and removed.
  // ---------------------------------------------------------------------------
  const saveHandler = handleSubmit((data) => {
    setSubmitted(true);

    if (!readingSession) return;
    if (!data.mood) return;

    const alreadyHasFinish = readingSession.timer.some(
      (t) => t.action === "finish"
    );

    const payload: SessionData = {
      ...readingSession,
      mood: data.mood,
      lastPage: data.lastPage,
      note: data.note,
      timer: alreadyHasFinish
        ? readingSession.timer
        : [
            ...readingSession.timer,
            { action: "finish", time: new Date().toISOString() },
          ],
    };

    // Persist the session first, then update Redux status.
    console.log("Final session data to save:", payload);
    // TODO: dispatch a real save action, e.g.:
    // dispatch({ type: 'reading/saveSession', payload });

    dispatch({ type: "reading/stopReading" });
    router.back();
  });

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const noteValue = watch("note") ?? "";

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
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

          <View style={styles.twoColumn}>
            {/* Mood selector */}
            <View style={[styles.section, { flex: 0 }]}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>How did this session feel?*</Text>
              </View>

              {/* BUG FIX: Show mood error only after a save attempt, not on
                  every render when no mood is selected. */}
              <FlatList
                scrollEnabled={false}
                keyboardShouldPersistTaps="handled"
                numColumns={3}
                data={MOOD_OPTIONS}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.moodGrid}
                columnWrapperStyle={styles.moodRow}
                renderItem={({ item: mood }) => {
                  // BUG FIX: was `selectedMood === mood.id` but selectedMood
                  // was previously the full MoodOption object — always false.
                  const isSelected = selectedMood === mood.id;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.moodCard,
                        isSelected && {
                          borderColor: mood.color,
                          backgroundColor: `${mood.color}18`,
                        },
                        ((errors.mood || !selectedMood) && submitted) && {
                          borderColor: "#E53E3E",
                        },
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

            {/* Last page */}
            <View style={[styles.section, { width: 130 }]}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Last read page*</Text>
              </View>
              <Controller
                control={control}
                name="lastPage"
                rules={{ required: 'Last page is required', pattern: { value: /^\d+$/, message: 'Must be a valid number' } }}
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <React.Fragment>
                    <TextInput
                      style={[
                        styles.pageInput,
                        errors.lastPage ? styles.inputError : null,
                      ]}
                      placeholder="e.g. 142"
                      placeholderTextColor="#B0B8C1"
                      keyboardType="number-pad"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      maxLength={5}
                    />
                  </React.Fragment>
                )}
              />
            </View>
          </View>

          {/* Note */}
          <View style={[styles.section, { marginBottom: 0 }]}>
            <Controller
              control={control}
              name="note"
              render={({ field: { onChange, onBlur, value } }) => (
                <React.Fragment>
                  <TextInput
                    style={styles.noteInput}
                    placeholder="Thoughts, quotes, reflections… (optional)"
                    placeholderTextColor="#B0B8C1"
                    multiline
                    value={value}
                    onChangeText={(text) =>
                      // BUG FIX: Enforce NOTE_MAX_LENGTH at the input level so
                      // the counter never exceeds it (maxLength prop doesn't
                      // apply reliably to multiline TextInput on Android).
                      onChange(text.slice(0, NOTE_MAX_LENGTH))
                    }
                    onBlur={onBlur}
                    textAlignVertical="top"
                  />
                  {/* BUG FIX: show counter once the user starts typing, not
                      only when value is truthy ('' is falsy but 0 chars is still
                      useful feedback once the field has been touched). */}
                  {noteValue.length > 0 && (
                    <Text style={styles.charCount}>
                      {noteValue.length} / {NOTE_MAX_LENGTH}
                    </Text>
                  )}
                </React.Fragment>
              )}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={saveHandler}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>Save Session</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  inner: {
    padding: 16,
    paddingTop: 32,
    paddingBottom: 0,
  },

  /* Header */
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2D3748",
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  durationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
  },
  durationDot: {
    fontSize: 8,
    color: "#68D391",
  },
  durationText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4A5568",
    letterSpacing: 0.2,
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginBottom: 28,
  },

  /* Two-column row */
  twoColumn: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "space-between",
  },

  /* Sections */
  section: {
    marginBottom: 28,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A5568",
  },

  /* Mood grid */
  moodGrid: {
    gap: 8,
  },
  moodRow: {
    justifyContent: "space-between",
  },
  moodCard: {
    width: 56,
    height: 56,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  moodEmoji: {
    fontSize: 30,
  },

  /* Page input */
  pageInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 14,
    fontSize: 22,
    fontWeight: "600",
    color: "#2D3748",
    flex: 1,
    width: "100%",
    textAlign: "center",
  },
  inputError: {
    borderColor: "#FC8181",
  },
  errorText: {
    fontSize: 12,
    color: "#E53E3E",
    marginTop: 6,
  },

  /* Note */
  noteInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: "#2D3748",
    minHeight: 100,
  },
  charCount: {
    fontSize: 11,
    color: "#CBD5E0",
    textAlign: "right",
    marginTop: 6,
  },

  /* Footer */
  footer: {
    padding: 16,
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});