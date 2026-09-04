import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '@/components/chip';
import { LabeledInput } from '@/components/labeled-input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  ACTIVITY_LEVELS,
  calculateTargets,
  clearProfile,
  loadProfile,
  saveProfile,
  type ActivityLevel,
  type Profile,
  type Sex,
} from '@/lib/profile';

type Draft = {
  sex: Sex;
  age: string;
  heightCm: string;
  weightKg: string;
  activityLevel: ActivityLevel;
  trainingDaysPerWeek: string;
  constraints: string;
};

const EMPTY_DRAFT: Draft = {
  sex: 'male',
  age: '',
  heightCm: '',
  weightKg: '',
  activityLevel: 'moderate',
  trainingDaysPerWeek: '4',
  constraints: '',
};

function profileToDraft(profile: Profile): Draft {
  return {
    sex: profile.sex,
    age: String(profile.age),
    heightCm: String(profile.heightCm),
    weightKg: String(profile.weightKg),
    activityLevel: profile.activityLevel,
    trainingDaysPerWeek: String(profile.trainingDaysPerWeek),
    constraints: profile.constraints,
  };
}

function draftToProfile(draft: Draft): Profile | null {
  const age = parseInt(draft.age, 10);
  const heightCm = parseInt(draft.heightCm, 10);
  const weightKg = parseFloat(draft.weightKg);
  const trainingDaysPerWeek = parseInt(draft.trainingDaysPerWeek, 10);

  if (!age || !heightCm || !weightKg || !trainingDaysPerWeek) return null;

  return {
    sex: draft.sex,
    age,
    heightCm,
    weightKg,
    activityLevel: draft.activityLevel,
    trainingDaysPerWeek,
    constraints: draft.constraints.trim(),
  };
}

export default function HomeScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile().then((stored) => {
      setProfile(stored);
      setEditing(!stored);
      setLoading(false);
    });
  }, []);

  const handleSubmit = useCallback(() => {
    const next = draftToProfile(draft);
    if (!next) return;
    saveProfile(next);
    setProfile(next);
    setEditing(false);
  }, [draft]);

  const handleEdit = useCallback(() => {
    if (profile) setDraft(profileToDraft(profile));
    setEditing(true);
  }, [profile]);

  const handleReset = useCallback(() => {
    clearProfile();
    setProfile(null);
    setDraft(EMPTY_DRAFT);
    setEditing(true);
  }, []);

  if (loading) return <ThemedView style={styles.container} />;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {editing ? (
            <IntakeForm draft={draft} onChange={setDraft} onSubmit={handleSubmit} />
          ) : profile ? (
            <ProfileSummary profile={profile} onEdit={handleEdit} onReset={handleReset} />
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function IntakeForm({
  draft,
  onChange,
  onSubmit,
}: {
  draft: Draft;
  onChange: (draft: Draft) => void;
  onSubmit: () => void;
}) {
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    onChange({ ...draft, [key]: value });

  return (
    <ThemedView style={styles.card}>
      <ThemedText type="subtitle">Your profile</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Goal: fat loss / recomposition. This shapes your calorie and macro targets.
      </ThemedText>

      <ThemedView style={styles.field}>
        <ThemedText type="small" themeColor="textSecondary">
          Sex
        </ThemedText>
        <ThemedView style={styles.row}>
          <Chip label="Male" selected={draft.sex === 'male'} onPress={() => set('sex', 'male')} />
          <Chip
            label="Female"
            selected={draft.sex === 'female'}
            onPress={() => set('sex', 'female')}
          />
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.row}>
        <ThemedView style={styles.flex1}>
          <LabeledInput
            label="Age"
            value={draft.age}
            onChangeText={(v) => set('age', v)}
            keyboardType="number-pad"
            placeholder="28"
          />
        </ThemedView>
        <ThemedView style={styles.flex1}>
          <LabeledInput
            label="Height (cm)"
            value={draft.heightCm}
            onChangeText={(v) => set('heightCm', v)}
            keyboardType="number-pad"
            placeholder="178"
          />
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.row}>
        <ThemedView style={styles.flex1}>
          <LabeledInput
            label="Weight (kg)"
            value={draft.weightKg}
            onChangeText={(v) => set('weightKg', v)}
            keyboardType="decimal-pad"
            placeholder="75"
          />
        </ThemedView>
        <ThemedView style={styles.flex1}>
          <LabeledInput
            label="Training days/week"
            value={draft.trainingDaysPerWeek}
            onChangeText={(v) => set('trainingDaysPerWeek', v)}
            keyboardType="number-pad"
            placeholder="4"
          />
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.field}>
        <ThemedText type="small" themeColor="textSecondary">
          Activity level (outside training)
        </ThemedText>
        <ThemedView style={styles.wrapRow}>
          {ACTIVITY_LEVELS.map((level) => (
            <Chip
              key={level.value}
              label={level.label}
              selected={draft.activityLevel === level.value}
              onPress={() => set('activityLevel', level.value)}
            />
          ))}
        </ThemedView>
      </ThemedView>

      <LabeledInput
        label="Injuries or constraints (optional)"
        value={draft.constraints}
        onChangeText={(v) => set('constraints', v)}
        placeholder="e.g. bad left knee, no overhead pressing"
        multiline
      />

      <ThemedView type="tint" style={styles.submitButton} onTouchEnd={onSubmit}>
        <ThemedText type="smallBold" style={styles.submitButtonText}>
          Calculate my targets
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

function ProfileSummary({
  profile,
  onEdit,
  onReset,
}: {
  profile: Profile;
  onEdit: () => void;
  onReset: () => void;
}) {
  const targets = calculateTargets(profile);

  return (
    <ThemedView style={styles.card}>
      <ThemedText type="subtitle">Your targets</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Fat loss / recomposition · {profile.trainingDaysPerWeek}x training/week
      </ThemedText>

      <ThemedView type="backgroundElement" style={styles.statGrid}>
        <Stat label="Calories" value={`${targets.targetCalories}`} unit="kcal/day" highlight />
        <Stat label="Protein" value={`${targets.proteinGrams}`} unit="g/day" />
        <Stat label="Carbs" value={`${targets.carbGrams}`} unit="g/day" />
        <Stat label="Fat" value={`${targets.fatGrams}`} unit="g/day" />
      </ThemedView>

      <ThemedText type="small" themeColor="textSecondary">
        Maintenance (TDEE) is ~{targets.tdee} kcal/day. Your target is a moderate deficit to lose
        fat while preserving muscle.
      </ThemedText>

      {profile.constraints ? (
        <ThemedView style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">
            Noted constraints
          </ThemedText>
          <ThemedText type="default">{profile.constraints}</ThemedText>
        </ThemedView>
      ) : null}

      <ThemedView style={styles.row}>
        <ThemedView
          type="backgroundElement"
          style={[styles.secondaryButton, styles.flex1]}
          onTouchEnd={onEdit}>
          <ThemedText type="smallBold">Edit profile</ThemedText>
        </ThemedView>
        <ThemedView
          type="backgroundElement"
          style={[styles.secondaryButton, styles.flex1]}
          onTouchEnd={onReset}>
          <ThemedText type="smallBold">Start over</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

function Stat({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
}) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.stat}>
      <ThemedText
        type="title"
        style={[styles.statValue, highlight && { color: theme.accent }]}>
        {value}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {unit}
      </ThemedText>
      <ThemedText type="smallBold" style={styles.statLabel}>
        {label}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  scrollContent: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  card: {
    gap: Spacing.three,
    paddingVertical: Spacing.four,
  },
  field: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  flex1: {
    flex: 1,
  },
  submitButton: {
    marginTop: Spacing.two,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
  },
  secondaryButton: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  stat: {
    width: '42%',
    flexGrow: 1,
    alignItems: 'center',
    gap: Spacing.half,
  },
  statValue: {
    fontSize: 28,
    lineHeight: 32,
  },
  statLabel: {
    marginTop: Spacing.one,
  },
});
