import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db } from "./db";
import { runMigrations } from "./migrations";

export const summaryInput = z.object({ storyId: z.string().uuid(), articleId: z.string().min(1).max(100), text: z.string().trim().min(20).max(1_000) });
export function saveStorySummary(input: unknown) {
  const value = summaryInput.parse(input); runMigrations();
  return db.transaction(() => {
    const article = db.prepare("SELECT 1 FROM story_articles WHERE story_id = ? AND article_id = ? AND decision != 'rejected'").get(value.storyId, value.articleId);
    if (!article) throw new Error("Summary evidence must belong to this story");
    db.prepare("INSERT INTO story_summaries (id, story_id, text, evidence_article_id, method_version) VALUES (?, ?, ?, ?, 'operator-summary-v1') ON CONFLICT(story_id) DO UPDATE SET text = excluded.text, evidence_article_id = excluded.evidence_article_id, method_version = excluded.method_version, updated_at = CURRENT_TIMESTAMP").run(randomUUID(), value.storyId, value.text, value.articleId);
    db.prepare("UPDATE stories SET summary = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(value.text, value.storyId);
  })();
}
