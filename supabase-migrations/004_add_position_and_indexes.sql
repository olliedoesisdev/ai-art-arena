-- Migration 004: Add position column and additional indexes for scaling

-- Add position column to artworks
ALTER TABLE artworks
  ADD COLUMN IF NOT EXISTS position INTEGER;

-- Add unique constraint on contest_id + position
CREATE UNIQUE INDEX IF NOT EXISTS idx_artworks_contest_position
  ON artworks(contest_id, position)
  WHERE position IS NOT NULL;

-- Add config column to contests for per-contest configuration
ALTER TABLE contests
  ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::jsonb;

-- Add additional indexes for scaling
CREATE INDEX IF NOT EXISTS idx_votes_user_id
  ON votes(user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_votes_user_identifier
  ON votes(user_identifier);

CREATE INDEX IF NOT EXISTS idx_votes_ip_hash
  ON votes(ip_hash);

CREATE INDEX IF NOT EXISTS idx_artworks_position
  ON artworks(position)
  WHERE position IS NOT NULL;

-- Trigger to validate position is within allowed range
CREATE OR REPLACE FUNCTION validate_artwork_position()
RETURNS TRIGGER AS $$
DECLARE
  max_artworks INTEGER;
BEGIN
  -- Get max artworks from settings
  SELECT get_setting_int('contest.max_artworks') INTO max_artworks;

  -- If position is set, validate it
  IF NEW.position IS NOT NULL THEN
    IF NEW.position < 1 OR NEW.position > max_artworks THEN
      RAISE EXCEPTION 'Position must be between 1 and %', max_artworks;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to artworks
CREATE TRIGGER validate_position_before_insert_update
  BEFORE INSERT OR UPDATE ON artworks
  FOR EACH ROW
  EXECUTE FUNCTION validate_artwork_position();

-- Update get_active_contest to include config
DROP FUNCTION IF EXISTS get_active_contest();

CREATE OR REPLACE FUNCTION get_active_contest()
RETURNS TABLE (
  contest_id UUID,
  title TEXT,
  week_number INTEGER,
  year INTEGER,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT,
  winner_id UUID,
  config JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as contest_id,
    c.title,
    c.week_number,
    c.year,
    c.start_date,
    c.end_date,
    c.status,
    c.winner_id,
    c.config
  FROM contests c
  WHERE c.status = 'active'
    AND c.start_date <= NOW()
    AND c.end_date > NOW()
  ORDER BY c.start_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON COLUMN artworks.position IS 'Display position of artwork in contest (1-N)';
COMMENT ON COLUMN contests.config IS 'Per-contest configuration overrides (JSONB)';
COMMENT ON FUNCTION validate_artwork_position() IS 'Validates artwork position is within allowed range from settings';
