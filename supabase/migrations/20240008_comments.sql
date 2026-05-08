-- Comments table for per-artwork discussion
CREATE TABLE IF NOT EXISTS comments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artwork_id     UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  parent_id      UUID REFERENCES comments(id) ON DELETE CASCADE,
  author_name    TEXT NOT NULL CHECK (char_length(author_name) BETWEEN 2 AND 50),
  author_email   TEXT CHECK (author_email IS NULL OR char_length(author_email) <= 254),
  body           TEXT NOT NULL CHECK (char_length(body) BETWEEN 5 AND 500),
  is_admin_reply BOOLEAN NOT NULL DEFAULT FALSE,
  is_approved    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved comments
CREATE POLICY "comments_select_approved"
  ON comments FOR SELECT
  USING (is_approved = TRUE);

-- Anyone (including anonymous) can insert a comment; moderation gate is is_approved
CREATE POLICY "comments_insert_public"
  ON comments FOR INSERT
  WITH CHECK (TRUE);

-- Only admin JWT role can approve / mark as admin reply
CREATE POLICY "comments_update_admin"
  ON comments FOR UPDATE
  USING ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- Only admin can delete
CREATE POLICY "comments_delete_admin"
  ON comments FOR DELETE
  USING ((auth.jwt() ->> 'role') = 'admin');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comments_artwork_id
  ON comments(artwork_id);

CREATE INDEX IF NOT EXISTS idx_comments_parent_id
  ON comments(parent_id);

CREATE INDEX IF NOT EXISTS idx_comments_artwork_approved
  ON comments(artwork_id, is_approved, created_at);
