-- Seed required system_config rows.
-- App code must always read from this table — never hard-code 24, 6, or 7.

INSERT INTO system_config (key, value, description) VALUES
  ('voting_cooldown_hours',    '24', 'Hours before a voter can vote again on the same contest'),
  ('artworks_per_contest',     '6',  'Number of artworks shown per contest'),
  ('contest_duration_days',    '7',  'Default contest duration in days'),
  ('max_votes_per_ip_per_day', '1',  'Maximum votes allowed per IP address per contest')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description;
