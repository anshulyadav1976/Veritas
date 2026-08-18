CREATE TABLE IF NOT EXISTS evidence_corrections (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL REFERENCES stories(id),
  target_type TEXT NOT NULL CHECK(target_type IN ('claim', 'claim_evidence', 'primary_material', 'coverage_record', 'summary')),
  target_id TEXT NOT NULL,
  note TEXT NOT NULL,
  method_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;

CREATE INDEX IF NOT EXISTS evidence_corrections_story_created_idx ON evidence_corrections(story_id, created_at DESC);

CREATE TABLE IF NOT EXISTS story_recomputations (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL REFERENCES stories(id),
  reason TEXT NOT NULL,
  details_json TEXT NOT NULL,
  method_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;

CREATE INDEX IF NOT EXISTS story_recomputations_story_created_idx ON story_recomputations(story_id, created_at DESC);
