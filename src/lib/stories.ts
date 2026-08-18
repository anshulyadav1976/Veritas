import "server-only";

import { db } from "@/lib/db";
import { runMigrations } from "@/lib/migrations";

export type StoryPreview = {
  id: string;
  headline: string;
  summary: string | null;
  state: string;
  importance: number;
  sourceCount: number;
  articleCount: number;
  updatedAt: string;
};

export type StoryArticle = {
  id: string;
  title: string;
  canonicalUrl: string;
  excerpt: string | null;
  publishedAt: string | null;
  sourceName: string;
  sourceDomain: string;
  sourceCountry: string | null;
  sourceLanguage: string | null;
  decision: string;
  score: number | null;
  reasonJson: string;
  algorithmVersion: string;
};

export type StoryClaim = { id: string; text: string; status: string; analysisVersion: string; createdAt: string; articleTitle: string; articleUrl: string; sourceName: string; stance: string; note: string };
export type StoryDetail = StoryPreview & { articles: StoryArticle[]; claims: StoryClaim[] };

export function listStories(): StoryPreview[] {
  runMigrations();
  return db.prepare(`
    SELECT stories.id, stories.headline, stories.summary, stories.state, stories.importance,
      stories.updated_at AS updatedAt, COUNT(DISTINCT articles.source_id) AS sourceCount,
      COUNT(story_articles.article_id) AS articleCount
    FROM stories
    LEFT JOIN story_articles ON story_articles.story_id = stories.id AND story_articles.decision != 'rejected'
    LEFT JOIN articles ON articles.id = story_articles.article_id
    WHERE stories.state != 'superseded'
    GROUP BY stories.id
    ORDER BY stories.importance DESC, stories.updated_at DESC
    LIMIT 30
  `).all() as StoryPreview[];
}

export function getStory(id: string): StoryDetail | null {
  runMigrations();
  const story = db.prepare(`
    SELECT stories.id, stories.headline, stories.summary, stories.state, stories.importance,
      stories.updated_at AS updatedAt, COUNT(DISTINCT articles.source_id) AS sourceCount,
      COUNT(story_articles.article_id) AS articleCount
    FROM stories
    LEFT JOIN story_articles ON story_articles.story_id = stories.id AND story_articles.decision != 'rejected'
    LEFT JOIN articles ON articles.id = story_articles.article_id
    WHERE stories.id = ? AND stories.state != 'superseded'
    GROUP BY stories.id
  `).get(id) as StoryPreview | undefined;
  if (!story) return null;
  const articles = db.prepare(`
    SELECT articles.id, articles.title, articles.canonical_url AS canonicalUrl, articles.excerpt,
      articles.published_at AS publishedAt, sources.name AS sourceName, sources.domain AS sourceDomain,
      sources.country_code AS sourceCountry, sources.language_tag AS sourceLanguage,
      story_articles.decision, story_articles.score, story_articles.reason_json AS reasonJson,
      story_articles.algorithm_version AS algorithmVersion
    FROM story_articles
    JOIN articles ON articles.id = story_articles.article_id
    JOIN sources ON sources.id = articles.source_id
    WHERE story_articles.story_id = ? AND story_articles.decision != 'rejected'
    ORDER BY articles.published_at DESC, articles.discovered_at DESC
  `).all(id) as StoryArticle[];
  const claims = db.prepare(`
    SELECT claims.id, claims.text, claims.status, claims.analysis_version AS analysisVersion, claims.created_at AS createdAt,
      articles.title AS articleTitle, articles.canonical_url AS articleUrl, sources.name AS sourceName,
      claim_evidence.stance, claim_evidence.note
    FROM claims
    JOIN claim_evidence ON claim_evidence.claim_id = claims.id
    JOIN articles ON articles.id = claim_evidence.article_id
    JOIN sources ON sources.id = articles.source_id
    WHERE claims.story_id = ?
    ORDER BY claims.created_at DESC, claim_evidence.created_at ASC
  `).all(id) as StoryClaim[];
  return { ...story, articles, claims };
}
