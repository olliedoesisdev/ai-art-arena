# Database Migrations Guide

This document tracks all database migrations for the AI Art Arena project and provides instructions for running them.

---

## Migration Files

All migration files are located in `/supabase-migrations/` directory.

### Migration Order

| # | File | Description | Status |
|---|------|-------------|--------|
| 001 | `supabase-schema.sql` | Initial schema (contests, artworks, votes, functions, RLS) | ✅ Run |
| 002 | `002_fix_can_vote_function.sql` | Fix can_vote() function signature | ⏳ Pending |
| 003 | `003_add_settings_table.sql` | Add settings table + helper functions | ⏳ Pending |
| 004 | `004_add_position_and_indexes.sql` | Add position column, contest config, indexes | ⏳ Pending |

---

## How to Run Migrations

### Prerequisites
- Supabase project created
- Access to Supabase SQL Editor
- Project URL and keys configured in `.env.local`

### Step-by-Step Instructions

1. **Open Supabase SQL Editor**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Navigate to **SQL Editor** in the left sidebar

2. **Run Initial Schema (if not already done)**
   - Open `/supabase-schema.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click **Run** (or press Cmd/Ctrl + Enter)
   - Verify tables created: `contests`, `artworks`, `votes`

3. **Run Migration 002: Fix can_vote Function**
   - Open `/supabase-migrations/002_fix_can_vote_function.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click **Run**
   - Verify function updated: `SELECT can_vote(uuid_generate_v4(), uuid_generate_v4(), uuid_generate_v4());`

4. **Run Migration 003: Add Settings Table**
   - Open `/supabase-migrations/003_add_settings_table.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click **Run**
   - Verify table created and settings inserted: `SELECT * FROM settings;`
   - You should see 6 default settings

5. **Run Migration 004: Add Position and Indexes**
   - Open `/supabase-migrations/004_add_position_and_indexes.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click **Run**
   - Verify columns added: `SELECT position FROM artworks LIMIT 1;`
   - Verify indexes created: Check "Database" → "Indexes" in Supabase

---

## Verification Checklist

After running all migrations, verify the following:

### Tables
- [ ] `contests` table exists with `config` column (JSONB)
- [ ] `artworks` table exists with `position` column (INTEGER)
- [ ] `votes` table exists
- [ ] `settings` table exists with 6 rows

### Functions
- [ ] `can_vote(UUID, UUID, UUID)` exists (3 parameters)
- [ ] `get_setting(TEXT)` exists
- [ ] `update_setting(TEXT, JSONB)` exists
- [ ] `get_setting_int(TEXT)` exists
- [ ] `get_setting_bool(TEXT)` exists
- [ ] `get_active_contest()` returns contest config
- [ ] `archive_contest(UUID)` exists
- [ ] `get_contest_winner(UUID)` exists

### Indexes
- [ ] `idx_artworks_contest_position` exists
- [ ] `idx_votes_user_id` exists
- [ ] `idx_votes_user_identifier` exists
- [ ] `idx_votes_ip_hash` exists
- [ ] `idx_artworks_position` exists

### Triggers
- [ ] `validate_position_before_insert_update` exists on artworks
- [ ] `update_settings_updated_at` exists on settings

### RLS Policies
- [ ] Settings table has "Public read access to settings" policy

---

## Testing Migrations

After running migrations, test with these SQL queries:

### Test Settings Table
```sql
-- Get all settings
SELECT * FROM settings ORDER BY key;

-- Get specific setting
SELECT get_setting('contest.max_artworks');

-- Get setting as integer
SELECT get_setting_int('contest.max_artworks');

-- Update setting (requires service role key)
SELECT update_setting('contest.max_artworks', '8');
```

### Test can_vote Function
```sql
-- Should return true (no vote exists)
SELECT can_vote(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'::uuid,
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'::uuid
);
```

### Test Position Validation
```sql
-- Should succeed (position within range)
INSERT INTO artworks (id, contest_id, title, image_url, prompt, position)
VALUES (
  uuid_generate_v4(),
  (SELECT id FROM contests WHERE status = 'active' LIMIT 1),
  'Test Artwork',
  'https://example.com/image.jpg',
  'Test prompt',
  5
);

-- Should fail (position > max_artworks)
INSERT INTO artworks (id, contest_id, title, image_url, prompt, position)
VALUES (
  uuid_generate_v4(),
  (SELECT id FROM contests WHERE status = 'active' LIMIT 1),
  'Test Artwork',
  'https://example.com/image.jpg',
  'Test prompt',
  99
);
-- Expected error: "Position must be between 1 and 12"
```

---

## Rollback Strategy

If you need to undo migrations:

### Rollback Migration 004
```sql
-- Remove indexes
DROP INDEX IF EXISTS idx_artworks_contest_position;
DROP INDEX IF EXISTS idx_votes_user_id;
DROP INDEX IF EXISTS idx_votes_user_identifier;
DROP INDEX IF EXISTS idx_votes_ip_hash;
DROP INDEX IF EXISTS idx_artworks_position;

-- Remove trigger
DROP TRIGGER IF EXISTS validate_position_before_insert_update ON artworks;
DROP FUNCTION IF EXISTS validate_artwork_position();

-- Remove columns
ALTER TABLE artworks DROP COLUMN IF EXISTS position;
ALTER TABLE contests DROP COLUMN IF EXISTS config;

-- Restore old get_active_contest function
-- (See supabase-schema.sql for original version)
```

### Rollback Migration 003
```sql
-- Drop helper functions
DROP FUNCTION IF EXISTS get_setting(TEXT);
DROP FUNCTION IF EXISTS update_setting(TEXT, JSONB);
DROP FUNCTION IF EXISTS get_setting_int(TEXT);
DROP FUNCTION IF EXISTS get_setting_bool(TEXT);

-- Drop table (WARNING: Deletes all settings data)
DROP TABLE IF EXISTS settings CASCADE;
```

### Rollback Migration 002
```sql
-- Restore old can_vote function
DROP FUNCTION IF EXISTS can_vote(UUID, UUID, UUID);

CREATE OR REPLACE FUNCTION can_vote(
  p_artwork_id UUID,
  p_ip_hash TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  vote_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM votes
    WHERE artwork_id = p_artwork_id
      AND ip_hash = p_ip_hash
      AND vote_date = CURRENT_DATE
  ) INTO vote_exists;

  RETURN NOT vote_exists;
END;
$$ LANGUAGE plpgsql;
```

---

## Common Issues

### Issue: "relation already exists"
**Cause:** Migration was already run
**Solution:** Safe to ignore, or check if rollback is needed

### Issue: "column does not exist"
**Cause:** Previous migration not run
**Solution:** Run migrations in order (001 → 002 → 003 → 004)

### Issue: "function does not exist"
**Cause:** Migration 002 not run yet
**Solution:** Run migration 002 before 003 and 004

### Issue: "permission denied"
**Cause:** RLS policies blocking operation
**Solution:** Use service role key or check policy configuration

---

## Migration History

### 2025-11-25: Migrations 002-004 Created
- Fixed can_vote() function signature mismatch
- Added settings table for runtime configuration
- Added position column and scaling indexes
- Added per-contest config support

### 2024-11-XX: Migration 001 (Initial Schema)
- Created contests, artworks, votes tables
- Added RLS policies
- Created core database functions
- Added indexes and triggers

---

## Next Migration

When creating the next migration:

1. Create file: `005_description.sql`
2. Add to migration table above
3. Update this document
4. Test thoroughly in development
5. Document rollback procedure

---

## Resources

- [Supabase SQL Editor Docs](https://supabase.com/docs/guides/database/sql-editor)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Migration Best Practices](https://supabase.com/docs/guides/database/migrations)

---

**Last Updated:** November 25, 2025
