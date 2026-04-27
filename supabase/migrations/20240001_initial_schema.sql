-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- contests
CREATE TABLE IF NOT EXISTS contests (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_number  INTEGER NOT NULL,
  start_date   TIMESTAMPTZ NOT NULL,
  end_date     TIMESTAMPTZ NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('active', 'archived')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- artworks
CREATE TABLE IF NOT EXISTS artworks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contest_id   UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  image_url    TEXT NOT NULL,
  title        TEXT NOT NULL,
  artist_prompt TEXT,
  vote_count   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- votes
CREATE TABLE IF NOT EXISTS votes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artwork_id   UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  contest_id   UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_hash      TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- system_config (business logic constants — never hard-code in app code)
CREATE TABLE IF NOT EXISTS system_config (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  description TEXT
);

-- RLS: enable on all tables
ALTER TABLE contests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- contests: public read, no direct write (managed via admin API + service role)
CREATE POLICY "contests_select_public"
  ON contests FOR SELECT USING (true);

-- artworks: public read
CREATE POLICY "artworks_select_public"
  ON artworks FOR SELECT USING (true);

-- votes: authenticated users can insert their own vote; read own votes
CREATE POLICY "votes_insert_own"
  ON votes FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "votes_select_own"
  ON votes FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- system_config: public read (constants used client-side), no public write
CREATE POLICY "system_config_select_public"
  ON system_config FOR SELECT USING (true);
