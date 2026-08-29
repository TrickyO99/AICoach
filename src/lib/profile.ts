import AsyncStorage from '@react-native-async-storage/async-storage';

export type Sex = 'male' | 'female';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export interface Profile {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  trainingDaysPerWeek: number;
  constraints: string;
}

export interface Targets {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
}

export const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; hint: string }[] = [
  { value: 'sedentary', label: 'Sedentary', hint: 'Desk job, little exercise' },
  { value: 'light', label: 'Light', hint: '1-3 workouts/week' },
  { value: 'moderate', label: 'Moderate', hint: '3-5 workouts/week' },
  { value: 'active', label: 'Active', hint: '6-7 workouts/week' },
  { value: 'very_active', label: 'Very active', hint: 'Physical job + training' },
];

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Mifflin-St Jeor equation.
export function calculateTargets(profile: Profile): Targets {
  const { sex, age, heightCm, weightKg, activityLevel } = profile;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = sex === 'male' ? base + 5 : base - 161;
  const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];

  // Moderate deficit for fat loss while preserving muscle (recomposition).
  const targetCalories = Math.round(tdee * 0.8);
  const proteinGrams = Math.round(weightKg * 2);
  const fatGrams = Math.round((targetCalories * 0.25) / 9);
  const carbCalories = targetCalories - proteinGrams * 4 - fatGrams * 9;
  const carbGrams = Math.max(0, Math.round(carbCalories / 4));

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories,
    proteinGrams,
    fatGrams,
    carbGrams,
  };
}

const PROFILE_KEY = 'aicoach.profile.v1';

export async function loadProfile(): Promise<Profile | null> {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  return raw ? (JSON.parse(raw) as Profile) : null;
}

export async function saveProfile(profile: Profile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function clearProfile(): Promise<void> {
  await AsyncStorage.removeItem(PROFILE_KEY);
}
