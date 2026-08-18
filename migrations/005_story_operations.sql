CREATE TABLE IF NOT EXISTS story_operations (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL REFERENCES stories(id),
  related_story_id TEXT REFERENCES stories(id),
  action TEXT NOT NULL CHECK(action IN ('merge', 'split')),
  reason TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;

CREATE INDEX IF NOT EXISTS story_operations_story_idx ON story_operations(story_id, created_at DESC);
