-- Initial schema for Alexis Art (Postgres)
-- Stores editable fields: meta, detalle, bitacora, in_progress.
-- Media files (images/videos) remain in filesystem.

CREATE TABLE IF NOT EXISTS artworks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',

  painted_location TEXT NOT NULL DEFAULT '',
  start_date DATE NULL,
  end_date DATE NULL,
  in_progress BOOLEAN NOT NULL DEFAULT FALSE,

  detalle TEXT NOT NULL DEFAULT '',
  bitacora TEXT NOT NULL DEFAULT '',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS artworks_in_progress_idx ON artworks (in_progress);


