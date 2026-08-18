CREATE TABLE IF NOT EXISTS source_assessments (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL UNIQUE REFERENCES sources(id),
  status TEXT NOT NULL CHECK(status IN ('unassessed', 'reviewed', 'disputed')) DEFAULT 'unassessed',
  rationale TEXT,
  evidence_url TEXT,
  method_version TEXT NOT NULL,
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;

CREATE TABLE IF NOT EXISTS ownership_assertions (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES sources(id),
  owner_name TEXT NOT NULL,
  evidence_url TEXT NOT NULL,
  asserted_at TEXT,
  confidence REAL NOT NULL CHECK(confidence >= 0 AND confidence <= 1),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;

CREATE INDEX IF NOT EXISTS ownership_assertions_source_idx ON ownership_assertions(source_id);

CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL REFERENCES stories(id),
  text TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('well_supported', 'contested', 'unverified', 'contradicted', 'opinion')),
  analysis_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;

CREATE INDEX IF NOT EXISTS claims_story_idx ON claims(story_id, created_at DESC);

CREATE TABLE IF NOT EXISTS claim_evidence (
  id TEXT PRIMARY KEY,
  claim_id TEXT NOT NULL REFERENCES claims(id),
  article_id TEXT NOT NULL REFERENCES articles(id),
  stance TEXT NOT NULL CHECK(stance IN ('supports', 'contradicts', 'context')),
  note TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;

CREATE INDEX IF NOT EXISTS claim_evidence_claim_idx ON claim_evidence(claim_id);
