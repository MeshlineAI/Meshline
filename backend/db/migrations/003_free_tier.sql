CREATE TABLE IF NOT EXISTS free_scan_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('contract', 'wallet', 'app')),
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_free_scan_lookup
  ON free_scan_usage (identifier, scan_type, scanned_at DESC);
