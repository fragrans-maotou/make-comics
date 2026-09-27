import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  __comicSqlite?: Database.Database;
  __comicDb?: ReturnType<typeof drizzle<typeof schema>>;
};

function databaseFile() {
  const configured = process.env.SQLITE_PATH?.trim();
  return path.resolve(process.cwd(), configured || "data/comics.db");
}

function ensureSchema(sqlite: Database.Database) {
  sqlite.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS stories (
      id text PRIMARY KEY,
      title text NOT NULL,
      slug text NOT NULL UNIQUE,
      description text,
      idea text NOT NULL,
      style text NOT NULL DEFAULT 'xiyou-chibi',
      layout text NOT NULL DEFAULT 'vertical',
      user_id text NOT NULL DEFAULT 'local',
      script_json text,
      composed_image_url text,
      status text NOT NULL DEFAULT 'script',
      created_at integer NOT NULL,
      updated_at integer NOT NULL
    );
    CREATE TABLE IF NOT EXISTS panels (
      id text PRIMARY KEY,
      story_id text NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
      panel_index integer NOT NULL,
      role text NOT NULL,
      scene text NOT NULL,
      shot text NOT NULL,
      characters_json text NOT NULL,
      dialogue_json text NOT NULL,
      image_url text,
      created_at integer NOT NULL,
      updated_at integer NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS panels_story_index ON panels(story_id, panel_index);
    CREATE TABLE IF NOT EXISTS feedback (
      id integer PRIMARY KEY AUTOINCREMENT,
      message text NOT NULL,
      user_id text,
      created_at integer NOT NULL
    );
  `);
}

function open() {
  if (globalForDb.__comicDb && globalForDb.__comicSqlite) {
    return globalForDb.__comicDb;
  }
  const file = databaseFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const sqlite = new Database(file);
  sqlite.pragma("journal_mode = WAL");
  ensureSchema(sqlite);
  const db = drizzle(sqlite, { schema });
  globalForDb.__comicSqlite = sqlite;
  globalForDb.__comicDb = db;
  return db;
}

export const db = open();
