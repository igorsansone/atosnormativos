-- Migration: adiciona campo deleted_at para soft delete
ALTER TABLE acts
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_acts_deleted_at ON acts(deleted_at);
