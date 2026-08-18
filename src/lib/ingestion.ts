import { createHash, randomUUID } from "node:crypto";
import { canAutoJoinStory, headlineSimilarity } from "@/lib/clustering";
import { db } from "@/lib/db";
import { runMigrations } from "@/lib/migrations";
import type { ArticleCandidate } from "@/lib/providers/types";

const idFor = (prefix: string, value: string) => `${prefix}_${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;

export function ingestCandidate(candidate: ArticleCandidate) {
  runMigrations();
  return db.transaction(() => {
    const sourceId = idFor("source", candidate.source.domain);
    db.prepare("INSERT INTO sources (id, domain, name, country_code, language_tag, source_type) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(domain) DO UPDATE SET name = excluded.name, updated_at = CURRENT_TIMESTAMP")
      .run(sourceId, candidate.source.domain, candidate.source.name, candidate.source.countryCode ?? null, candidate.source.languageTag ?? null, candidate.source.sourceType ?? null);
    const articleId = idFor("article", candidate.url);
    const inserted = db.prepare("INSERT INTO articles (id, source_id, canonical_url, title, author, published_at, language_tag, excerpt, content_hash, acquisition_provider, acquisition_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(canonical_url) DO NOTHING")
      .run(articleId, sourceId, candidate.url, candidate.title, candidate.author ?? null, candidate.publishedAt ?? null, candidate.languageTag ?? null, candidate.excerpt ?? null, createHash("sha256").update(`${candidate.title}\n${candidate.excerpt ?? ""}`).digest("hex"), candidate.provider, candidate.providerId);
    if (inserted.changes === 0) return { articleId, storyId: null, duplicate: true };
    const stories = db.prepare("SELECT id, headline FROM stories WHERE state IN ('developing', 'active') ORDER BY updated_at DESC LIMIT 200").all() as Array<{ id: string; headline: string }>;
    const matching = stories.find((story) => canAutoJoinStory(story.headline, candidate.title));
    const storyId = matching?.id ?? randomUUID();
    if (!matching) db.prepare("INSERT INTO stories (id, headline, summary, state, importance) VALUES (?, ?, ?, 'developing', 0)").run(storyId, candidate.title, candidate.excerpt ?? null);
    const score = matching ? headlineSimilarity(matching.headline, candidate.title) : 1;
    db.prepare("INSERT INTO story_articles (story_id, article_id, decision, score, reason_json, algorithm_version) VALUES (?, ?, 'automatic', ?, ?, 'headline-jaccard-v1')")
      .run(storyId, articleId, score, JSON.stringify({ score, signal: "headline token overlap" }));
    db.prepare("UPDATE stories SET importance = importance + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(storyId);
    return { articleId, storyId, duplicate: false };
  })();
}
