-- Migration: Add settings table for database-driven configuration
-- Date: 2025-11-25
-- Description: Create settings table and helper functions for dynamic configuration

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to settings
CREATE POLICY "Allow public read access to settings"
  ON settings
  FOR SELECT
  TO public
  USING (true);

-- Only service role can modify settings
CREATE POLICY "Allow service role to modify settings"
  ON settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
  ('contest.min_artworks', '6', 'Minimum artworks required to start a contest'),
  ('contest.max_artworks', '12', 'Maximum artworks allowed per contest'),
  ('contest.duration_hours', '168', 'Contest duration in hours (7 days default)'),
  ('voting.cooldown_hours', '24', 'Hours between votes for the same artwork'),
  ('voting.votes_per_user_per_day', '1', 'Number of votes allowed per user per day'),
  ('features.voting_enabled', 'true', 'Enable/disable voting functionality'),
  ('features.archive_enabled', 'true', 'Enable/disable archive page'),
  ('features.blog_enabled', 'true', 'Enable/disable blog functionality')
ON CONFLICT (key) DO NOTHING;

-- Create helper function to get a setting value
CREATE OR REPLACE FUNCTION get_setting(p_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  setting_value JSONB;
BEGIN
  SELECT value INTO setting_value
  FROM settings
  WHERE key = p_key;

  IF setting_value IS NULL THEN
    RAISE EXCEPTION 'Setting % not found', p_key;
  END IF;

  RETURN setting_value;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- Create helper function to update a setting
CREATE OR REPLACE FUNCTION update_setting(p_key TEXT, p_value JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update the setting
  INSERT INTO settings (key, value, updated_at)
  VALUES (p_key, p_value, NOW())
  ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      updated_at = NOW();
END;
$$;

-- Create helper function to get setting as integer
CREATE OR REPLACE FUNCTION get_setting_int(p_key TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  setting_value JSONB;
BEGIN
  setting_value := get_setting(p_key);
  RETURN (setting_value #>> '{}')::INTEGER;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to convert setting % to integer', p_key;
END;
$$;

-- Create helper function to get setting as boolean
CREATE OR REPLACE FUNCTION get_setting_bool(p_key TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  setting_value JSONB;
BEGIN
  setting_value := get_setting(p_key);
  RETURN (setting_value #>> '{}')::BOOLEAN;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to convert setting % to boolean', p_key;
END;
$$;

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE settings IS 'Application configuration settings stored in database';
COMMENT ON FUNCTION get_setting(TEXT) IS 'Get a setting value by key';
COMMENT ON FUNCTION update_setting(TEXT, JSONB) IS 'Insert or update a setting value';
COMMENT ON FUNCTION get_setting_int(TEXT) IS 'Get a setting value as an integer';
COMMENT ON FUNCTION get_setting_bool(TEXT) IS 'Get a setting value as a boolean';
