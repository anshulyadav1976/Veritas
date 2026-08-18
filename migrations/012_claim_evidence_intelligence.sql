ALTER TABLE claims ADD COLUMN claim_type TEXT NOT NULL DEFAULT 'factual' CHECK(claim_type IN ('factual', 'statistical', 'causal'));
ALTER TABLE claim_evidence ADD COLUMN evidence_span TEXT;

CREATE TABLE IF NOT EXISTS claim_assessments (
  id TEXT PRIMARY KEY,
  claim_id TEXT NOT NULL REFERENCES claims(id),
  status TEXT NOT NULL CHECK(status IN ('confirmed', 'well_supported', 'contested', 'unverified', 'contradicted', 'opinion')),
  rationale TEXT NOT NULL,
  analysis_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;

CREATE INDEX IF NOT EXISTS claim_assessments_claim_created_idx ON claim_assessments(claim_id, created_at DESC);
