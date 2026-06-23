import type Database from "better-sqlite3";

export function initializeSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS movements (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      equipment TEXT NOT NULL,
      modality TEXT NOT NULL,
      is_weighted INTEGER NOT NULL,
      default_load TEXT,
      scaling_options TEXT NOT NULL,
      description TEXT NOT NULL,
      seconds_per_rep REAL NOT NULL,
      unit TEXT NOT NULL,
      default_value REAL NOT NULL,
      typical_range TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS movement_overrides (
      movement_id TEXT PRIMARY KEY REFERENCES movements(id),
      seconds_per_rep REAL,
      default_value REAL,
      typical_range TEXT,
      unit TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS workouts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      format TEXT NOT NULL,
      format_params TEXT NOT NULL,
      movements TEXT NOT NULL,
      rounds INTEGER,
      estimated_duration TEXT NOT NULL,
      equipment TEXT NOT NULL,
      modality_breakdown TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      is_favorite INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS presets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      config TEXT NOT NULL,
      is_built_in INTEGER NOT NULL DEFAULT 0
    );
  `);
}
