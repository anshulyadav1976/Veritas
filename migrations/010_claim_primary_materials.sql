CREATE TABLE IF NOT EXISTS claim_primary_materials (
  id TEXT PRIMARY KEY,
  claim_id TEXT NOT NULL REFERENCES claims(id),
  primary_material_id TEXT NOT NULL REFERENCES primary_materials(id),
  stance TEXT NOT NULL CHECK(stance IN ('supports','contradicts','context')),
  note TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(claim_id, primary_material_id)
) STRICT;
