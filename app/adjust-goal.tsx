import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Theme ───────────────────────────────────────────────────────────────────
const C = {
  blue:       '#1E90FF',
  blueLight:  '#E8F4FF',
  blueDark:   '#1270CC',
  bg:         '#F5F5F5',
  white:      '#FFFFFF',
  text:       '#1A2332',
  muted:      '#7A8EA0',
  border:     '#DDE8F0',
  success:    '#3DBA8C',
  daily:      '#FFF3E0',
  weekly:     '#E8F5E9',
  monthly:    '#EDE7F6',
  yearly:     '#E3F2FD',
};

// ─── Config ───────────────────────────────────────────────────────────────────
const GOALS_CONFIG = [
  {
    id: 'daily',
    period: 'Daily',
    unit: 'minutes',
    unitLabel: 'min / day',
    icon: '☀️',
    iconBg: C.daily,
    min: 5, max: 480, step: 5, defaultVal: 30,
    hint: (v: number) => `Target ${Math.round(v / 5)} pages per day`,
  },
  {
    id: 'weekly',
    period: 'Weekly',
    unit: 'hours',
    unitLabel: 'hrs / week',
    icon: '📅',
    iconBg: C.weekly,
    min: 1, max: 40, step: 1, defaultVal: 5,
    hint: (v: number) => `Target ${Math.round((v * 60) / 20)} pages per week`,
  },
  {
    id: 'monthly',
    period: 'Monthly',
    unit: 'books',
    unitLabel: 'books / month',
    icon: '🗓️',
    iconBg: C.monthly,
    min: 1, max: 20, step: 1, defaultVal: 2,
    hint: (v: number) => `${v} books × 12 months = ${v * 12} books / year`,
  },
  {
    id: 'yearly',
    period: 'Yearly',
    unit: 'books',
    unitLabel: 'books / year',
    icon: '🏆',
    iconBg: C.yearly,
    min: 1, max: 200, step: 1, defaultVal: 24,
    hint: (v: number) => `Average ${(v / 12).toFixed(1)} books per month`,
  },
];

// --- Constants ---
interface GoalConfig {
  year: number;
  values: GoalValue[];
}

interface GoalValue {
  id: string;
  value: number;
  unit: string;
}

// ─── GoalCard ─────────────────────────────────────────────────────────────────
function GoalCard({
  config,
  value,
  onChange,
}: {
  config: typeof GOALS_CONFIG[0];
  value: number;
  onChange: (v: number) => void;
}) {
  const [open, setOpen] = useState(true);
  const [inputText, setInputText] = useState(String(value));
  const anim = useRef(new Animated.Value(1)).current;

  const decrement = () => {
    const next = Math.max(config.min, value - config.step);
    onChange(next);
    setInputText(String(next));
  };

  const increment = () => {
    const next = Math.min(config.max, value + config.step);
    onChange(next);
    setInputText(String(next));
  };

  const handleInputChange = (text: string) => {
    setInputText(text);
    const v = parseInt(text, 10);
    if (!isNaN(v)) onChange(Math.min(config.max, Math.max(config.min, v)));
  };

  const handleInputBlur = () => {
    setInputText(String(value));
  };

  const pressIn = () => Animated.spring(anim, { toValue: 0.97, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(anim, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={[s.card, { transform: [{ scale: anim }] }]}>
      {/* Card Header */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setOpen(p => !p)}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={s.cardHeader}
      >
        <View style={[s.iconWrap, { backgroundColor: config.iconBg }]}>
          <Text style={s.iconEmoji}>{config.icon}</Text>
        </View>

        <View style={s.headerInfo}>
          <Text style={s.periodText}>{config.period}</Text>
          <View style={s.unitTag}>
            <Text style={s.unitTagText}>{inputText} {config.unitLabel}</Text>
          </View>
        </View>

        <Text style={s.hintText}>{config.hint(value)}</Text>
      </TouchableOpacity>

      {/* Card Body */}
      {open && (
        <View style={s.cardBody}>
          <View style={s.inputRow}>
            <TouchableOpacity style={s.stepperBtn} onPress={decrement} activeOpacity={0.7}>
              <MaterialIcons name="remove" size={22} color={C.blue} style={{ marginLeft: 2 }} />
            </TouchableOpacity>

            <TextInput
              style={s.goalInput}
              value={inputText}
              onChangeText={handleInputChange}
              onBlur={handleInputBlur}
              keyboardType="number-pad"
              textAlign="center"
              maxLength={4}
            />

            <TouchableOpacity style={s.stepperBtn} onPress={increment} activeOpacity={0.7}>
              <MaterialIcons name="add" size={22} color={C.blue} style={{ marginRight: 2 }} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AdjustGoalScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const [goals, setGoals] = useState<Record<string, number>>(
    GOALS_CONFIG.reduce((acc, g) => ({ ...acc, [g.id]: g.defaultVal }), {})
  );

  // -- Form state ---
  const { control, handleSubmit, register, setValue } = useForm<GoalConfig>({
    defaultValues: {
      year: 2026, 
      values: [
        { id: 'daily', value: 30, unit: 'minute' },
        { id: 'weekly', value: 5, unit: 'hour' },
        { id: 'monthly', value: 2, unit: 'book' },
        { id: 'yearly', value: 12, unit: 'book' },
      ]
    },
  });

  const handleChange = (id: string, val: number) => {
    setGoals(prev => ({ ...prev, [id]: val }));
    setValue(`values.${GOALS_CONFIG.findIndex(g => g.id === id)}.value`, val, { shouldDirty: true });
  };

  const handleSave = handleSubmit((data) => {
    Alert.alert('Save Goals', 'It may take up to 72 hours for this to take effect.', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Confirm',
        onPress: () => console.log('Confirm pressed'),
        style: 'default',
      },
    ]);
  });

  useEffect(() => {
    setValue('year', year);
  }, [year]);

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: '#fff' },
          headerRight: () => (
            <TouchableOpacity onPress={() => handleSave()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="save" size={26} color={theme.colors.primary} />
              <Text style={{ color: theme.colors.primary, fontSize: 18, fontWeight: '600' }}>Save</Text>
            </TouchableOpacity>
          )
        }}
      />

      <KeyboardAwareScrollView
        ScrollViewComponent={ScrollView}
        bottomOffset={insets.bottom}
        showsVerticalScrollIndicator={true}
      >
        
          {/* ── Year Selector ── */}
          <View style={s.yearSection}>
            <View style={s.yearSelector}>
              <TouchableOpacity
                style={s.yearBtn}
                onPress={() => setYear(y => y - 1)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="chevron-left" size={28} color={C.blue} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
              <View style={s.yearDisplayWrap}>
                <Text style={s.yearDisplay}>{year}</Text>
              </View>
              <TouchableOpacity
                style={s.yearBtn}
                onPress={() => setYear(y => y + 1)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="chevron-right" size={28} color={C.blue} style={{ marginRight: 4 }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Goal Cards ── */}
          <View style={s.goalsList}>
            {GOALS_CONFIG.map(cfg => (
              <GoalCard
                key={cfg.id}
                config={cfg}
                value={goals[cfg.id]}
                onChange={v => handleChange(cfg.id, v)}
              />
            ))}
          </View>

      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },

  // Year
  yearSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.muted,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    overflow: 'hidden',
  },
  yearBtn: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearBtnText: {
    fontSize: 22,
    color: C.blue,
    fontWeight: '400',
    lineHeight: 26,
  },
  yearDisplayWrap: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: C.border,
  },
  yearDisplay: {
    fontSize: 22,
    fontWeight: '700',
    color: C.text,
  },

  // Goals list
  goalsList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 0,
    flexDirection: 'column',
  },

  // Card
  card: {
    backgroundColor: C.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: C.border,
    marginBottom: 14,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 20,
  },
  headerInfo: {
    flex: 1,
  },
  periodText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.text,
    letterSpacing: -0.1,
  },
  unitTag: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: C.blueLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  unitTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: C.blueDark,
  },
  hintText: {
    fontSize: 12,
    color: C.muted,
    textAlign: 'right',
    maxWidth: 120,
    lineHeight: 15,
  },

  // Card body
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInput: {
    flex: 1,
    height: 42,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
    backgroundColor: C.bg,
    textAlign: 'center',
    paddingVertical: 0,
  },
});