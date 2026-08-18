import { randomUUID } from "node:crypto";

import { z } from "zod";

import { db } from "./db";
import { runMigrations } from "./migrations";

export const correctionTargetTypes = ["claim", "claim_evidence", "primary_material", "coverage_record", "summary"] as const;

export const correctionInput = z.object({
  storyId: z.string().uuid(),
  targetType: z.enum(correctionTargetTypes),
  targetId: z.string().uuid(),
  note: z.string().trim().min(8).max(1_000),
});
export const recomputeInput = z.object({
  storyId: z.string().uuid(),
  reason: z.string().trim().min(8).max(500),
});

function targetStoryId(type: z.infer<typeof correctionInput>["targetType"], id: string) {
  const statements = {
    claim: "SELECT story_id AS storyId FROM claims WHERE id = ?",
    claim_evidence: "SELECT claims.story_id AS storyId FROM claim_evidence JOIN claims ON claims.id = claim_evidence.claim_id WHERE claim_evidence.id = ?",
    primary_material: "SELECT story_id AS storyId FROM primary_materials WHERE id = ?",
    coverage_record: "SELECT story_id AS storyId FROM article_coverage_records WHERE id = ?",
    summary: "SELECT story_id AS storyId FROM story_summaries WHERE id = ?",
  } as const;
  return db.prepare(statements[type]).get(id) as { storyId: string } | undefined;
}

function recompute(storyId: string, reason: string) {
  const story = db.prepare("SELECT id FROM stories WHERE id = ?").get(storyId);
  if (!story) throw new Error("Story does not exist");
  const { importance } = db.prepare("SELECT COUNT(*) AS importance FROM story_articles WHERE story_id = ? AND decision != 'rejected'").get(storyId) as { importance: number };
  db.prepare("UPDATE stories SET importance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(importance, storyId);
  db.prepare("INSERT INTO story_recomputations (id, story_id, reason, details_json, method_version) VALUES (?, ?, ?, ?, 'story-derived-v1')").run(randomUUID(), storyId, reason, JSON.stringify({ importance }));
  return { importance };
}

export function recomputeStory(input: unknown) {
  const value = recomputeInput.parse(input);
  runMigrations();
  return db.transaction(() => recompute(value.storyId, value.reason))();
}

export function recordCorrection(input: unknown) {
  const value = correctionInput.parse(input);
  runMigrations();
  return db.transaction(() => {
    const target = targetStoryId(value.targetType, value.targetId);
    if (!target || target.storyId !== value.storyId) throw new Error("Correction target must belong to this story");
    db.prepare("INSERT INTO evidence_corrections (id, story_id, target_type, target_id, note, method_version) VALUES (?, ?, ?, ?, ?, 'operator-correction-v1')").run(randomUUID(), value.storyId, value.targetType, value.targetId, value.note);
    return recompute(value.storyId, `Correction: ${value.note}`);
  })();
}
