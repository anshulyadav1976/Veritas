import { randomUUID } from "node:crypto";

import { db } from "../src/lib/db";
import { runMigrations } from "../src/lib/migrations";

runMigrations();

const workerId = `worker-${process.pid}-${randomUUID()}`;
const now = new Date().toISOString();
const job = db.transaction(() => {
  const candidate = db.prepare(`
    SELECT id, kind, payload_json FROM jobs
    WHERE status = 'queued' AND run_after <= ?
    ORDER BY created_at
    LIMIT 1
  `).get(now) as { id: string; kind: string; payload_json: string } | undefined;

  if (!candidate) return undefined;
  const result = db.prepare(`
    UPDATE jobs
    SET status = 'running', attempts = attempts + 1, locked_at = ?, locked_by = ?, updated_at = ?
    WHERE id = ? AND status = 'queued'
  `).run(now, workerId, now, candidate.id);
  return result.changes === 1 ? candidate : undefined;
})();

if (!job) {
  console.log("No queued jobs.");
  process.exit(0);
}

// ponytail: one worker and one job per invocation; add a long-running loop only when measured ingestion volume needs it.
console.log(`Claimed ${job.kind} job ${job.id}. Provider work is added in the ingestion milestone.`);
db.prepare("UPDATE jobs SET status = 'completed', updated_at = ? WHERE id = ?").run(new Date().toISOString(), job.id);
