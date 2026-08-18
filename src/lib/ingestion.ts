import { createHash, randomUUID } from "node:crypto";
import { clusterDecision } from "@/lib/clustering";
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
    if (candidate.rawUrl && candidate.rawUrl !== candidate.url) {
      db.prepare("INSERT INTO article_aliases (alias_url, article_id, normalization_reason) VALUES (?, ?, 'feed-url-canonicalization') ON CONFLICT(alias_url) DO NOTHING")
        .run(candidate.rawUrl, articleId);
    }
    if (inserted.changes === 0) return { articleId, storyId: null, duplicate: true };
    const stories = db.prepare("SELECT stories.id, stories.headline, MAX(articles.published_at) AS publishedAt FROM stories LEFT JOIN story_articles ON story_articles.story_id=stories.id AND story_articles.decision!='rejected' LEFT JOIN articles ON articles.id=story_articles.article_id WHERE stories.state IN ('developing', 'active') GROUP BY stories.id ORDER BY stories.updated_at DESC LIMIT 200").all() as Array<{ id: string; headline: string; publishedAt: string | null }>;
    const match = stories.map((story)=>({story,decision:clusterDecision({headline:story.headline,publishedAt:story.publishedAt},{headline:candidate.title,publishedAt:candidate.publishedAt})})).find(({decision})=>decision.join);
    const matching = match?.story;
    const storyId = matching?.id ?? randomUUID();
    if (!matching) db.prepare("INSERT INTO stories (id, headline, summary, state, importance) VALUES (?, ?, ?, 'developing', 0)").run(storyId, candidate.title, candidate.excerpt ?? null);
    const decision = match?.decision;
    const score = decision?.score ?? 1;
    db.prepare("INSERT INTO story_articles (story_id, article_id, decision, score, reason_json, algorithm_version) VALUES (?, ?, 'automatic', ?, ?, ?)")
      .run(storyId, articleId, score, JSON.stringify(decision ?? { score: 1, signal: "new story" }), decision?.algorithmVersion ?? "headline-time-conflict-v2");
    db.prepare("UPDATE stories SET importance = importance + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(storyId);
    return { articleId, storyId, duplicate: false };
  })();
}
