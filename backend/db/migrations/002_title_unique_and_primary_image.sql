-- Add primary_image column and unique constraint on title
-- primary_image stores the filename of the main image to display in listings

ALTER TABLE artworks ADD COLUMN IF NOT EXISTS primary_image TEXT NOT NULL DEFAULT '';

-- Create unique index on title (only for non-empty titles to allow migration)
CREATE UNIQUE INDEX IF NOT EXISTS artworks_title_unique_idx ON artworks (title) WHERE title != '';

-- Index for ordering by start_date
CREATE INDEX IF NOT EXISTS artworks_start_date_idx ON artworks (start_date NULLS LAST);
