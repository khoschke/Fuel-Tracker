export type MealType =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'pre-workout'
  | 'post-workout';

export type Confidence = 'high' | 'medium' | 'low';

export interface Meal {
  id: string;
  date: string; // YYYY-MM-DD, local calendar day the meal was logged for
  mealType: MealType;
  description: string;
  photoUri: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  confidence: Confidence;
  note: string; // the user's optional note, e.g. portion/brand/how cooked
  createdAt: number; // epoch ms
}

export interface Settings {
  calTarget: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  raceName: string;
  raceDate: string; // YYYY-MM-DD
}

export const DEFAULT_SETTINGS: Settings = {
  calTarget: 3371,
  proteinTarget: 211,
  carbTarget: 421,
  fatTarget: 93,
  raceName: 'Sydney Marathon',
  raceDate: '2026-08-30',
};

export const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'pre-workout', label: 'Pre-workout snack' },
  { value: 'post-workout', label: 'Post-workout snack' },
];

export interface MealEstimate {
  description: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  confidence: Confidence;
  notes: string;
}
