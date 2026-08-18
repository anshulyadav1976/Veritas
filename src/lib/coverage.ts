import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db } from "./db";
import { runMigrations } from "./migrations";
export const topics = ["world","politics","business","science_technology","health","climate","culture","sport","other"] as const;
export const coverageForms = ["direct_reporting","analysis","opinion","unknown"] as const;
export const topicInput = z.object({ storyId: z.string().uuid(), topic: z.enum(topics) });
export const coverageInput = z.object({ storyId: z.string().uuid(), articleId: z.string().min(1).max(100), coverageForm: z.enum(coverageForms), focusNote: z.string().trim().min(8).max(500) });
export function saveTopic(input: unknown) { const v = topicInput.parse(input); runMigrations(); db.prepare("INSERT INTO story_topics (story_id, topic, method_version) VALUES (?, ?, 'operator-topic-v1') ON CONFLICT(story_id) DO UPDATE SET topic=excluded.topic, method_version=excluded.method_version, updated_at=CURRENT_TIMESTAMP").run(v.storyId,v.topic); }
export function saveCoverage(input: unknown) { const v = coverageInput.parse(input); runMigrations(); const member=db.prepare("SELECT 1 FROM story_articles WHERE story_id=? AND article_id=? AND decision!='rejected'").get(v.storyId,v.articleId); if(!member) throw new Error("Coverage record must belong to this story"); db.prepare("INSERT INTO article_coverage_records (id,story_id,article_id,coverage_form,focus_note,method_version) VALUES (?,?,?,?,?,'operator-coverage-v1') ON CONFLICT(story_id,article_id) DO UPDATE SET coverage_form=excluded.coverage_form,focus_note=excluded.focus_note,method_version=excluded.method_version,created_at=CURRENT_TIMESTAMP").run(randomUUID(),v.storyId,v.articleId,v.coverageForm,v.focusNote); }
