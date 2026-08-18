CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  domain TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  country_code TEXT,
  language_tag TEXT,
  source_type TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES sources(id),
  canonical_url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  author TEXT,
  published_at TEXT,
  discovered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  language_tag TEXT,
  excerpt TEXT,
  content_hash TEXT,
  acquisition_provider TEXT NOT NULL,
  acquisition_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;

CREATE INDEX IF NOT EXISTS articles_source_published_at_idx ON articles(source_id, published_at DESC);
CREATE INDEX IF NOT EXISTS articles_discovered_at_idx ON articles(discovered_at DESC);

CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  headline TEXT NOT NULL,
  summary TEXT,
  state TEXT NOT NULL CHECK(state IN ('developing', 'active', 'settled', 'archived', 'superseded')) DEFAULT 'developing',
  importance REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;

CREATE INDEX IF NOT EXISTS stories_feed_idx ON stories(state, importance DESC, updated_at DESC);

CREATE TABLE IF NOT EXISTS story_articles (
  story_id TEXT NOT NULL REFERENCES stories(id),
  article_id TEXT NOT NULL REFERENCES articles(id),
  decision TEXT NOT NULL CHECK(decision IN ('automatic', 'reviewed', 'rejected')),
  score REAL,
  reason_json TEXT NOT NULL,
  algorithm_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(story_id, article_id)
) STRICT;

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  idempotency_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK(status IN ('queued', 'running', 'completed', 'failed')) DEFAULT 'queued',
  attempts INTEGER NOT NULL DEFAULT 0,
  run_after TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  locked_at TEXT,
  locked_by TEXT,
  last_error TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;

CREATE INDEX IF NOT EXISTS jobs_claim_idx ON jobs(status, run_after, created_at);
