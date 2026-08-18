import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db } from "./db";
import { runMigrations } from "./migrations";

export const mergeInput = z.object({ targetStoryId: z.string().uuid(), sourceStoryId: z.string().uuid(), reason: z.string().trim().min(8).max(500) }).refine((value) => value.targetStoryId !== value.sourceStoryId, { message: "Stories must differ" });
export const splitInput = z.object({ sourceStoryId: z.string().uuid(), articleId: z.string().min(1).max(100), headline: z.string().trim().min(8).max(300), reason: z.string().trim().min(8).max(500) });

export function mergeStories(input: unknown) {
  const value = mergeInput.parse(input); runMigrations();
  return db.transaction(() => {
    const stories = db.prepare("SELECT id, importance FROM stories WHERE id IN (?, ?) AND state != 'superseded'").all(value.targetStoryId, value.sourceStoryId) as Array<{ id: string; importance: number }>;
    if (stories.length !== 2) throw new Error("Both active stories are required");
    db.prepare("INSERT INTO story_articles (story_id, article_id, decision, score, reason_json, algorithm_version) SELECT ?, article_id, 'reviewed', score, ?, 'operator-merge-v1' FROM story_articles WHERE story_id = ? AND decision != 'rejected' ON CONFLICT(story_id, article_id) DO NOTHING").run(value.targetStoryId, JSON.stringify({ reason: value.reason, sourceStoryId: value.sourceStoryId }), value.sourceStoryId);
    const source = stories.find((story) => story.id === value.sourceStoryId)!;
    db.prepare("UPDATE stories SET state = 'superseded', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(value.sourceStoryId);
    db.prepare("UPDATE stories SET importance = importance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(source.importance, value.targetStoryId);
    db.prepare("INSERT INTO story_operations (id, story_id, related_story_id, action, reason, details_json) VALUES (?, ?, ?, 'merge', ?, ?)").run(randomUUID(), value.targetStoryId, value.sourceStoryId, value.reason, JSON.stringify({ sourceStoryId: value.sourceStoryId }));
  })();
}

export function splitStoryArticle(input: unknown) {
  const value = splitInput.parse(input); runMigrations();
  return db.transaction(() => {
    const article = db.prepare("SELECT articles.excerpt FROM story_articles JOIN articles ON articles.id = story_articles.article_id WHERE story_articles.story_id = ? AND story_articles.article_id = ? AND story_articles.decision != 'rejected'").get(value.sourceStoryId, value.articleId) as { excerpt: string | null } | undefined;
    if (!article) throw new Error("Article is not an active member of this story");
    const storyId = randomUUID();
    db.prepare("INSERT INTO stories (id, headline, summary, state, importance) VALUES (?, ?, ?, 'developing', 1)").run(storyId, value.headline, article.excerpt);
    db.prepare("UPDATE story_articles SET decision = 'rejected', reason_json = ?, algorithm_version = 'operator-split-v1' WHERE story_id = ? AND article_id = ?").run(JSON.stringify({ reason: value.reason, splitStoryId: storyId }), value.sourceStoryId, value.articleId);
    db.prepare("INSERT INTO story_articles (story_id, article_id, decision, score, reason_json, algorithm_version) VALUES (?, ?, 'reviewed', 1, ?, 'operator-split-v1')").run(storyId, value.articleId, JSON.stringify({ reason: value.reason, sourceStoryId: value.sourceStoryId }));
    db.prepare("INSERT INTO story_operations (id, story_id, related_story_id, action, reason, details_json) VALUES (?, ?, ?, 'split', ?, ?)").run(randomUUID(), value.sourceStoryId, storyId, value.reason, JSON.stringify({ articleId: value.articleId, splitStoryId: storyId }));
    return storyId;
  })();
}
