CREATE TABLE IF NOT EXISTS story_topics (
  story_id TEXT PRIMARY KEY REFERENCES stories(id),
  topic TEXT NOT NULL CHECK(topic IN ('world','politics','business','science_technology','health','climate','culture','sport','other')),
  method_version TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;
CREATE TABLE IF NOT EXISTS article_coverage_records (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL REFERENCES stories(id),
  article_id TEXT NOT NULL REFERENCES articles(id),
  coverage_form TEXT NOT NULL CHECK(coverage_form IN ('direct_reporting','analysis','opinion','unknown')),
  focus_note TEXT NOT NULL,
  method_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(story_id, article_id)
) STRICT;
CREATE INDEX IF NOT EXISTS article_coverage_records_story_idx ON article_coverage_records(story_id);
