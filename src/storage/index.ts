// Single storage module. Every screen reads/writes data through the
// functions below. If this app ever grows a backend, only this file
// (plus apiKey.ts/db.ts it wraps) needs to change — the screens do not
// know or care that the data lives in an on-device SQLite database.
import { randomUUID } from 'expo-crypto';
import { getDb } from './db';
import { DEFAULT_SETTINGS, Meal, MealType, Confidence, Settings } from '../types';

export { getApiKey, setApiKey } from './apiKey';

export async function getSettings(): Promise<Settings> {
  const db = await getDb();
  const row = await db.getFirstAsync<{
    calTarget: number;
    proteinTarget: number;
    carbTarget: number;
    fatTarget: number;
    raceName: string;
    raceDate: string;
  }>('SELECT calTarget, proteinTarget, carbTarget, fatTarget, raceName, raceDate FROM settings WHERE id = 1');

  if (!row) {
    await db.runAsync(
      `INSERT INTO settings (id, calTarget, proteinTarget, carbTarget, fatTarget, raceName, raceDate)
       VALUES (1, ?, ?, ?, ?, ?, ?)`,
      [
        DEFAULT_SETTINGS.calTarget,
        DEFAULT_SETTINGS.proteinTarget,
        DEFAULT_SETTINGS.carbTarget,
        DEFAULT_SETTINGS.fatTarget,
        DEFAULT_SETTINGS.raceName,
        DEFAULT_SETTINGS.raceDate,
      ]
    );
    return { ...DEFAULT_SETTINGS };
  }

  return row;
}

export async function saveSettings(settings: Settings): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO settings (id, calTarget, proteinTarget, carbTarget, fatTarget, raceName, raceDate)
     VALUES (1, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       calTarget = excluded.calTarget,
       proteinTarget = excluded.proteinTarget,
       carbTarget = excluded.carbTarget,
       fatTarget = excluded.fatTarget,
       raceName = excluded.raceName,
       raceDate = excluded.raceDate`,
    [
      settings.calTarget,
      settings.proteinTarget,
      settings.carbTarget,
      settings.fatTarget,
      settings.raceName,
      settings.raceDate,
    ]
  );
}

export interface NewMeal {
  date: string;
  mealType: MealType;
  description: string;
  photoUri: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  confidence: Confidence;
}

export async function addMeal(meal: NewMeal): Promise<Meal> {
  const db = await getDb();
  const id = randomUUID();
  const createdAt = Date.now();
  await db.runAsync(
    `INSERT INTO meals (id, date, mealType, description, photoUri, calories, protein_g, carbs_g, fat_g, confidence, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      meal.date,
      meal.mealType,
      meal.description,
      meal.photoUri,
      meal.calories,
      meal.protein_g,
      meal.carbs_g,
      meal.fat_g,
      meal.confidence,
      createdAt,
    ]
  );
  return { id, createdAt, ...meal };
}

export async function getMealsForDate(date: string): Promise<Meal[]> {
  const db = await getDb();
  return db.getAllAsync<Meal>(
    'SELECT * FROM meals WHERE date = ? ORDER BY createdAt ASC',
    [date]
  );
}

export async function getCaloriesByDate(dateKeys: string[]): Promise<Record<string, number>> {
  if (dateKeys.length === 0) return {};
  const db = await getDb();
  const placeholders = dateKeys.map(() => '?').join(', ');
  const rows = await db.getAllAsync<{ date: string; total: number }>(
    `SELECT date, SUM(calories) as total FROM meals WHERE date IN (${placeholders}) GROUP BY date`,
    dateKeys
  );
  const result: Record<string, number> = {};
  for (const row of rows) {
    result[row.date] = row.total;
  }
  return result;
}

export async function deleteMeal(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM meals WHERE id = ?', [id]);
}
