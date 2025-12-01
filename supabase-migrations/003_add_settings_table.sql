-- Migration 003: Add settings table for database-driven configuration
-- This enables runtime configuration changes without code deploys

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
  ('contest.min_artworks', '6', 'Minimum number of artworks required to start a contest'),
  ('contest.max_artworks', '12', 'Maximum number of artworks allowed per contest'),
  ('contest.duration_hours', '168', 'Contest duration in hours (168 = 7 days)'),
  ('voting.cooldown_hours', '24', 'Hours between votes for the same artwork'),
  ('voting.enabled', 'true', 'Global voting enable/disable flag'),
  ('archive.enabled', 'true', 'Archive feature enable/disable flag')
ON CONFLICT (key) DO NOTHING;

-- Add updated_at trigger
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can read settings)
CREATE POLICY "Public read access to settings" ON settings
  FOR SELECT USING (true);

-- Only service role can update settings
-- (This is enforced by using service role key in admin operations)

-- Helper function to get a setting value
CREATE OR REPLACE FUNCTION get_setting(p_key TEXT)
RETURNS JSONB AS $$
DECLARE
  setting_value JSONB;
BEGIN
  SELECT value INTO setting_value
  FROM settings
  WHERE key = p_key;

  RETURN setting_value;
END;
$$ LANGUAGE plpgsql;

-- Helper function to update a setting
CREATE OR REPLACE FUNCTION update_setting(p_key TEXT, p_value JSONB)
RETURNS VOID AS $$
BEGIN
  INSERT INTO settings (key, value, updated_at)
  VALUES (p_key, p_value, NOW())
  ON CONFLICT (key) DO UPDATE
  SET value = p_value, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get setting as integer
CREATE OR REPLACE FUNCTION get_setting_int(p_key TEXT)
RETURNS INTEGER AS $$
DECLARE
  setting_value JSONB;
BEGIN
  SELECT value INTO setting_value
  FROM settings
  WHERE key = p_key;

  RETURN (setting_value)::integer;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get setting as boolean
CREATE OR REPLACE FUNCTION get_setting_bool(p_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  setting_value JSONB;
BEGIN
  SELECT value INTO setting_value
  FROM settings
  WHERE key = p_key;

  RETURN (setting_value)::boolean;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE settings IS 'Runtime configuration settings for the application';
COMMENT ON FUNCTION get_setting(TEXT) IS 'Get a configuration setting value by key';
COMMENT ON FUNCTION update_setting(TEXT, JSONB) IS 'Update a configuration setting (requires service role)';
COMMENT ON FUNCTION get_setting_int(TEXT) IS 'Get a configuration setting as an integer';
COMMENT ON FUNCTION get_setting_bool(TEXT) IS 'Get a configuration setting as a boolean';
