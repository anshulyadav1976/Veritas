import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db } from "./db";
import { runMigrations } from "./migrations";

export const chainInput = z.object({ storyId: z.string().uuid(), articleId: z.string().min(1).max(100), label: z.string().trim().min(3).max(160), basis: z.string().trim().min(8).max(500), confidence: z.coerce.number().min(0).max(1) });
export function createReportingChain(input: unknown) {
  const value = chainInput.parse(input); runMigrations();
  return db.transaction(() => {
    const member = db.prepare("SELECT 1 FROM story_articles WHERE story_id = ? AND article_id = ? AND decision != 'rejected'").get(value.storyId, value.articleId);
    if (!member) throw new Error("Chain evidence must belong to this story");
    const id = randomUUID();
    db.prepare("INSERT INTO reporting_chains (id, story_id, label, basis, evidence_article_id, confidence) VALUES (?, ?, ?, ?, ?, ?)").run(id, value.storyId, value.label, value.basis, value.articleId, value.confidence);
    db.prepare("INSERT INTO reporting_chain_articles (reporting_chain_id, article_id) VALUES (?, ?)").run(id, value.articleId);
    return id;
  })();
}
