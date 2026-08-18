import { randomUUID } from "node:crypto";

import { z } from "zod";

import { db } from "./db";
import { runMigrations } from "./migrations";

export const sourceRecordInput = z.object({ sourceId: z.string().min(1).max(100), status: z.enum(["unassessed", "reviewed", "disputed"]), rationale: z.string().trim().max(1_000), evidenceUrl: z.union([z.url(), z.literal("")]), ownerName: z.string().trim().max(200), ownerEvidenceUrl: z.union([z.url(), z.literal("")]), confidence: z.coerce.number().min(0).max(1) });
export function saveSourceRecords(input: unknown) {
  const value = sourceRecordInput.parse(input); runMigrations();
  return db.transaction(() => {
    if (value.status !== "unassessed" || value.rationale || value.evidenceUrl) db.prepare("INSERT INTO source_assessments (id, source_id, status, rationale, evidence_url, method_version, reviewed_at) VALUES (?, ?, ?, ?, ?, 'operator-source-v1', CURRENT_TIMESTAMP) ON CONFLICT(source_id) DO UPDATE SET status = excluded.status, rationale = excluded.rationale, evidence_url = excluded.evidence_url, method_version = excluded.method_version, reviewed_at = excluded.reviewed_at, updated_at = CURRENT_TIMESTAMP").run(randomUUID(), value.sourceId, value.status, value.rationale || null, value.evidenceUrl || null);
    if (value.ownerName || value.ownerEvidenceUrl) {
      if (!value.ownerName || !value.ownerEvidenceUrl) throw new Error("Ownership name and evidence URL are both required");
      db.prepare("INSERT INTO ownership_assertions (id, source_id, owner_name, evidence_url, asserted_at, confidence) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)").run(randomUUID(), value.sourceId, value.ownerName, value.ownerEvidenceUrl, value.confidence);
    }
  })();
}
