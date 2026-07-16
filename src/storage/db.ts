import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function openDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('fuel-tracker.db');
  }
  return dbPromise;
}

let readyPromise: Promise<void> | null = null;

export function ensureReady(): Promise<void> {
  if (!readyPromise) {
    readyPromise = (async () => {
      const db = await openDb();
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS meals (
          id TEXT PRIMARY KEY NOT NULL,
          date TEXT NOT NULL,
          mealType TEXT NOT NULL,
          description TEXT NOT NULL,
          photoUri TEXT NOT NULL,
          calories INTEGER NOT NULL,
          protein_g INTEGER NOT NULL,
          carbs_g INTEGER NOT NULL,
          fat_g INTEGER NOT NULL,
          confidence TEXT NOT NULL,
          createdAt INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_meals_date ON meals (date);
        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          calTarget INTEGER NOT NULL,
          proteinTarget INTEGER NOT NULL,
          carbTarget INTEGER NOT NULL,
          fatTarget INTEGER NOT NULL,
          raceName TEXT NOT NULL,
          raceDate TEXT NOT NULL
        );
      `);
    })();
  }
  return readyPromise;
}

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  await ensureReady();
  return openDb();
}
