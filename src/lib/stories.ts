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
