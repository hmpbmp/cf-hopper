import Database from "better-sqlite3";
import path from "path";
import { initializeSchema } from "./schema";

const DB_PATH = path.resolve(__dirname, "../../data/hopper.db");

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initializeSchema(db);
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
  }
}
