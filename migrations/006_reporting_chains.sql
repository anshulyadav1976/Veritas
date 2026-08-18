CREATE TABLE IF NOT EXISTS reporting_chains (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL REFERENCES stories(id),
  label TEXT NOT NULL,
  basis TEXT NOT NULL,
  evidence_article_id TEXT REFERENCES articles(id),
  confidence REAL NOT NULL CHECK(confidence >= 0 AND confidence <= 1),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;

CREATE TABLE IF NOT EXISTS reporting_chain_articles (
  reporting_chain_id TEXT NOT NULL REFERENCES reporting_chains(id),
  article_id TEXT NOT NULL REFERENCES articles(id),
  PRIMARY KEY(reporting_chain_id, article_id)
) STRICT;

CREATE INDEX IF NOT EXISTS reporting_chains_story_idx ON reporting_chains(story_id);
