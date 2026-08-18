import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { db } from "./db";

const migrationsDirectory = resolve(process.cwd(), "migrations");

export function runMigrations() {
  db.exec("CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP) STRICT");
  const applied = new Set(db.prepare("SELECT id FROM schema_migrations").all().map((row) => (row as { id: string }).id));

  for (const file of readdirSync(migrationsDirectory).filter((name) => name.endsWith(".sql")).sort()) {
    if (applied.has(file)) continue;
    const migration = db.transaction(() => {
      db.exec(readFileSync(resolve(migrationsDirectory, file), "utf8"));
      db.prepare("INSERT INTO schema_migrations (id) VALUES (?)").run(file);
    });
    migration();
  }
}
