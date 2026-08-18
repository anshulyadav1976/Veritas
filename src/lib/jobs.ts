import { randomUUID } from "node:crypto";

import { db } from "./db";
import { runMigrations } from "./migrations";

export type Job = { id: string; kind: string; payloadJson: string; attempts: number };
export const retryDelayMs = (attempt: number) => Math.min(15 * 60_000, 30_000 * 2 ** Math.max(0, attempt - 1));

export function enqueueJob(kind: string, payload: unknown, idempotencyKey: string) {
  runMigrations();
  const id = randomUUID();
  const result = db.prepare("INSERT INTO jobs (id, kind, payload_json, idempotency_key) VALUES (?, ?, ?, ?) ON CONFLICT(idempotency_key) DO NOTHING").run(id, kind, JSON.stringify(payload), idempotencyKey);
  return { id, queued: result.changes === 1 };
}

export function claimJob(workerId: string): Job | null {
  runMigrations();
  const now = new Date().toISOString();
  return db.transaction(() => {
    const candidate = db.prepare("SELECT id, kind, payload_json AS payloadJson, attempts FROM jobs WHERE status = 'queued' AND run_after <= ? ORDER BY created_at LIMIT 1").get(now) as Job | undefined;
    if (!candidate) return null;
    const updated = db.prepare("UPDATE jobs SET status = 'running', attempts = attempts + 1, locked_at = ?, locked_by = ?, updated_at = ? WHERE id = ? AND status = 'queued'").run(now, workerId, now, candidate.id);
    return updated.changes === 1 ? { ...candidate, attempts: candidate.attempts + 1 } : null;
  })();
}

export function completeJob(id: string) { db.prepare("UPDATE jobs SET status = 'completed', updated_at = ? WHERE id = ?").run(new Date().toISOString(), id); }
export function failJob(job: Job, message: string) {
  const terminal = job.attempts >= 3;
  const runAfter = new Date(Date.now() + retryDelayMs(job.attempts)).toISOString();
  db.prepare("UPDATE jobs SET status = ?, run_after = ?, last_error = ?, locked_at = NULL, locked_by = NULL, updated_at = ? WHERE id = ?").run(terminal ? "failed" : "queued", runAfter, message.slice(0, 500), new Date().toISOString(), job.id);
}
