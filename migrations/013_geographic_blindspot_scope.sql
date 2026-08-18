CREATE TABLE IF NOT EXISTS story_geographic_blindspot_scopes (
  story_id TEXT PRIMARY KEY REFERENCES stories(id),
  expected_country_code TEXT NOT NULL CHECK(length(expected_country_code) = 2),
  rationale TEXT NOT NULL,
  method_version TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;
