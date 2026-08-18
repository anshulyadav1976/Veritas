import { randomUUID } from "node:crypto";

import { z } from "zod";

import { db } from "./db";
import { runMigrations } from "./migrations";

export const claimStatuses = ["well_supported", "contested", "unverified", "contradicted", "opinion"] as const;
export const claimInput = z.object({
  storyId: z.string().uuid(), articleId: z.string().min(1).max(100), text: z.string().trim().min(8).max(500),
  status: z.enum(claimStatuses), stance: z.enum(["supports", "contradicts", "context"]), note: z.string().trim().min(8).max(500),
});
export const claimPrimaryMaterialInput = z.object({ claimId: z.string().uuid(), primaryMaterialId: z.string().uuid(), stance: z.enum(["supports","contradicts","context"]), note: z.string().trim().min(8).max(500) });

export function createClaim(input: unknown) {
  const value = claimInput.parse(input);
  runMigrations();
  return db.transaction(() => {
    const article = db.prepare("SELECT 1 FROM story_articles WHERE story_id = ? AND article_id = ? AND decision != 'rejected'").get(value.storyId, value.articleId);
    if (!article) throw new Error("Evidence must belong to this story");
    const claimId = randomUUID();
    db.prepare("INSERT INTO claims (id, story_id, text, status, analysis_version) VALUES (?, ?, ?, ?, 'operator-evidence-v1')").run(claimId, value.storyId, value.text, value.status);
    db.prepare("INSERT INTO claim_evidence (id, claim_id, article_id, stance, note) VALUES (?, ?, ?, ?, ?)").run(randomUUID(), claimId, value.articleId, value.stance, value.note);
    return claimId;
  })();
}
export function addClaimPrimaryMaterial(input: unknown) { const value=claimPrimaryMaterialInput.parse(input); runMigrations(); db.transaction(()=>{const row=db.prepare("SELECT claims.story_id AS claimStory, primary_materials.story_id AS materialStory FROM claims JOIN primary_materials ON primary_materials.id=? WHERE claims.id=?").get(value.primaryMaterialId,value.claimId) as {claimStory:string;materialStory:string}|undefined;if(!row||row.claimStory!==row.materialStory) throw new Error("Primary material must belong to this claim story");db.prepare("INSERT INTO claim_primary_materials (id,claim_id,primary_material_id,stance,note) VALUES (?,?,?,?,?)").run(randomUUID(),value.claimId,value.primaryMaterialId,value.stance,value.note);})(); }
