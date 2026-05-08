CREATE TYPE reaction_emoji AS ENUM ('like', 'love', 'laugh', 'wow');

CREATE TABLE IF NOT EXISTS comment_reactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id  UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  emoji       reaction_emoji NOT NULL,
  ip_hash     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (comment_id, emoji, ip_hash)
);

ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

-- Anyone can read reaction counts
CREATE POLICY "reactions_select_public"
  ON comment_reactions FOR SELECT
  USING (TRUE);

-- Anyone can react (one per emoji per IP enforced by unique constraint)
CREATE POLICY "reactions_insert_public"
  ON comment_reactions FOR INSERT
  WITH CHECK (TRUE);

-- IP owner can un-react (delete their own row)
CREATE POLICY "reactions_delete_own"
  ON comment_reactions FOR DELETE
  USING (TRUE);

CREATE INDEX IF NOT EXISTS idx_reactions_comment_id
  ON comment_reactions(comment_id);

CREATE INDEX IF NOT EXISTS idx_reactions_comment_emoji
  ON comment_reactions(comment_id, emoji);
