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

      // Baseline schema for a fresh install. `note` is part of it here, so new
      // devices get the column directly; the migration below back-fills it on
      // phones that already have a `meals` table from an earlier version.
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
          note TEXT NOT NULL DEFAULT '',
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

      await runMigrations(db);
    })();
  }
  return readyPromise;
}

// Idempotent, run on every launch. Each migration checks the live schema
// before touching it, so it is safe to re-run and safe on both fresh and
// pre-existing databases.
async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  await addColumnIfMissing(db, 'meals', 'note', "TEXT NOT NULL DEFAULT ''");
}

async function addColumnIfMissing(
  db: SQLite.SQLiteDatabase,
  table: string,
  column: string,
  definition: string
): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  if (!columns.some((c) => c.name === column)) {
    await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  await ensureReady();
  return openDb();
}
