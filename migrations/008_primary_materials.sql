CREATE TABLE IF NOT EXISTS primary_materials (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL REFERENCES stories(id),
  title TEXT NOT NULL,
  material_type TEXT NOT NULL CHECK (material_type IN ('primary_document', 'official_record', 'official_data', 'fact_check')),
  url TEXT NOT NULL,
  relevance_note TEXT NOT NULL,
  published_at TEXT,
  method_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;

CREATE INDEX IF NOT EXISTS primary_materials_story_created_idx ON primary_materials(story_id, created_at DESC);
