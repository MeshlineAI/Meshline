CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target TEXT NOT NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('contract', 'wallet', 'app')),
  mesh_score INTEGER CHECK (mesh_score BETWEEN 0 AND 1000),
  tier TEXT CHECK (tier IN ('AAA', 'AA', 'A', 'BB', 'C')),
  report_json JSONB,
  eas_uid TEXT,
  report_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scans_target ON scans (target);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans (created_at DESC);
