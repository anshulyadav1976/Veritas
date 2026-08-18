import { randomUUID } from "node:crypto";

import { z } from "zod";

import { db } from "./db";
import { runMigrations } from "./migrations";

export const claimStatuses = ["confirmed", "well_supported", "contested", "unverified", "contradicted", "opinion"] as const;
const initialClaimStatuses = ["well_supported", "contested", "unverified", "contradicted", "opinion"] as const;
export const claimTypes = ["factual", "statistical", "causal"] as const;
export const claimInput = z.object({
  storyId: z.string().uuid(), articleId: z.string().min(1).max(100), text: z.string().trim().min(8).max(500),
  claimType: z.enum(claimTypes), status: z.enum(initialClaimStatuses), stance: z.enum(["supports", "contradicts", "context"]), note: z.string().trim().min(8).max(500), evidenceSpan: z.string().trim().min(8).max(500),
});
export const claimPrimaryMaterialInput = z.object({ claimId: z.string().uuid(), primaryMaterialId: z.string().uuid(), stance: z.enum(["supports","contradicts","context"]), note: z.string().trim().min(8).max(500) });
export const claimEvidenceInput = z.object({ claimId: z.string().uuid(), articleId: z.string().min(1).max(100), stance: z.enum(["supports", "contradicts", "context"]), note: z.string().trim().min(8).max(500), evidenceSpan: z.string().trim().min(8).max(500) });
export const claimAssessmentInput = z.object({ claimId: z.string().uuid(), status: z.enum(claimStatuses), rationale: z.string().trim().min(8).max(500) });

export function createClaim(input: unknown) {
  const value = claimInput.parse(input);
  runMigrations();
  return db.transaction(() => {
    const article = db.prepare("SELECT 1 FROM story_articles WHERE story_id = ? AND article_id = ? AND decision != 'rejected'").get(value.storyId, value.articleId);
    if (!article) throw new Error("Evidence must belong to this story");
    const claimId = randomUUID();
    db.prepare("INSERT INTO claims (id, story_id, text, status, claim_type, analysis_version) VALUES (?, ?, ?, ?, ?, 'operator-evidence-v2')").run(claimId, value.storyId, value.text, value.status, value.claimType);
    db.prepare("INSERT INTO claim_evidence (id, claim_id, article_id, stance, note, evidence_span) VALUES (?, ?, ?, ?, ?, ?)").run(randomUUID(), claimId, value.articleId, value.stance, value.note, value.evidenceSpan);
    return claimId;
  })();
}
export function addClaimPrimaryMaterial(input: unknown) { const value=claimPrimaryMaterialInput.parse(input); runMigrations(); db.transaction(()=>{const row=db.prepare("SELECT claims.story_id AS claimStory, primary_materials.story_id AS materialStory FROM claims JOIN primary_materials ON primary_materials.id=? WHERE claims.id=?").get(value.primaryMaterialId,value.claimId) as {claimStory:string;materialStory:string}|undefined;if(!row||row.claimStory!==row.materialStory) throw new Error("Primary material must belong to this claim story");db.prepare("INSERT INTO claim_primary_materials (id,claim_id,primary_material_id,stance,note) VALUES (?,?,?,?,?)").run(randomUUID(),value.claimId,value.primaryMaterialId,value.stance,value.note);})(); }

export function addClaimEvidence(input: unknown) {
  const value = claimEvidenceInput.parse(input);
  runMigrations();
  db.transaction(() => {
    const row = db.prepare("SELECT claims.story_id AS claimStory, story_articles.story_id AS articleStory FROM claims JOIN story_articles ON story_articles.article_id = ? AND story_articles.decision != 'rejected' WHERE claims.id = ?").get(value.articleId, value.claimId) as { claimStory: string; articleStory: string } | undefined;
    if (!row || row.claimStory !== row.articleStory) throw new Error("Evidence must belong to this claim story");
    db.prepare("INSERT INTO claim_evidence (id, claim_id, article_id, stance, note, evidence_span) VALUES (?, ?, ?, ?, ?, ?)").run(randomUUID(), value.claimId, value.articleId, value.stance, value.note, value.evidenceSpan);
  })();
}

export function assessClaim(input: unknown) {
  const value = claimAssessmentInput.parse(input);
  runMigrations();
  db.transaction(() => {
    const claim = db.prepare("SELECT id FROM claims WHERE id = ?").get(value.claimId);
    if (!claim) throw new Error("Claim does not exist");
    if (value.status === "confirmed" && !db.prepare("SELECT 1 FROM claim_primary_materials WHERE claim_id = ? AND stance = 'supports'").get(value.claimId)) throw new Error("Confirmed status requires linked supporting primary material or fact check");
    db.prepare("INSERT INTO claim_assessments (id, claim_id, status, rationale, analysis_version) VALUES (?, ?, ?, ?, 'operator-assessment-v1')").run(randomUUID(), value.claimId, value.status, value.rationale);
  })();
}
