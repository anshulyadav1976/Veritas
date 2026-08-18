CREATE TABLE IF NOT EXISTS article_aliases (
  alias_url TEXT PRIMARY KEY,
  article_id TEXT NOT NULL REFERENCES articles(id),
  normalization_reason TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;

CREATE INDEX IF NOT EXISTS article_aliases_article_idx ON article_aliases(article_id);
