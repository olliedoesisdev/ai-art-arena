# Daily Voting Setup Guide

## What Changed

Your voting system now allows **one vote per day per artwork** (instead of one vote per contest).

### Before
- ❌ Could only vote once per artwork for the entire contest
- ❌ Votes stored in localStorage (lost on sign out)
- ❌ Vote state didn't persist across sessions

### After
- ✅ Can vote once per day for each artwork
- ✅ Votes stored in database (persist forever)
- ✅ Vote state loads automatically on sign in
- ✅ Tomorrow users can vote again

## Setup Required

### Step 1: Run SQL Script (CRITICAL)

1. **Open Supabase Dashboard** → SQL Editor
2. **Open** [enable-daily-voting.sql](enable-daily-voting.sql)
3. **Copy all** contents
4. **Paste** into SQL Editor
5. **Click "Run"**

This will:
- Add `vote_date` column to votes table
- Change constraint from "per contest" to "per day"
- Update `can_vote()` function to check daily votes
- Create `get_user_votes_today()` function

### Step 2: Test Daily Voting

1. Go to http://localhost:3001/contest
2. Sign in
3. Vote for an artwork → See "Vote recorded — thank you! You can vote again tomorrow."
4. Try voting again → See "You've already voted for this artwork today!"
5. Refresh page → Vote button should still show "Voted" (gray)
6. Sign out and back in → Vote state persists
7. Tomorrow → Can vote again for the same artwork

## How It Works

### Database Schema
```sql
-- Old constraint (one per contest)
UNIQUE(user_id, artwork_id, contest_id)

-- New constraint (one per day)
UNIQUE(user_id, artwork_id, vote_date)
```

### Functions Created

#### `can_vote(artwork_id, user_id, contest_id)`
Checks if user has voted for this artwork **today**

#### `get_user_votes_today(user_id, contest_id)`
Returns all artworks user voted for **today**

### Frontend Flow

1. **On Sign In**:
   - Fetches user's votes from database
   - Displays "Voted" buttons for today's votes

2. **On Vote**:
   - Sends vote to API
   - Updates local state
   - Shows success message

3. **On Refresh**:
   - Fetches votes again from database
   - Restores "Voted" state

4. **Next Day**:
   - Previous votes don't apply (different `vote_date`)
   - User can vote again

## Technical Details

### Vote Table Changes
```sql
-- Added column
vote_date DATE NOT NULL DEFAULT CURRENT_DATE

-- Updated constraint
ALTER TABLE votes ADD CONSTRAINT votes_user_artwork_date_unique
  UNIQUE(user_id, artwork_id, vote_date);
```

### Frontend Changes
- Removed localStorage persistence
- Added `fetchUserVotes()` function
- Calls database on auth state change
- Updates vote state from database

## Troubleshooting

### "Function get_user_votes_today does not exist"
Run [enable-daily-voting.sql](enable-daily-voting.sql)

### Votes not persisting
1. Check you ran the SQL script
2. Verify function exists:
   ```sql
   SELECT routine_name FROM information_schema.routines
   WHERE routine_name = 'get_user_votes_today';
   ```

### Can't vote multiple times per day
Check the constraint:
```sql
SELECT constraint_name FROM information_schema.table_constraints
WHERE table_name = 'votes' AND constraint_name = 'votes_user_artwork_date_unique';
```

Should show `votes_user_artwork_date_unique` (not `votes_user_artwork_contest_unique`)

### Old votes breaking
If you have old votes without `vote_date`, the script handles it:
```sql
UPDATE votes
SET vote_date = CURRENT_DATE
WHERE vote_date IS NULL;
```

Note: All existing votes will be set to today's date. This means users can't vote again for those artworks until tomorrow.

## SQL Scripts to Run (In Order)

1. **[extend-contest.sql](extend-contest.sql)** - Make contest active
2. **[fix-vote-trigger.sql](fix-vote-trigger.sql)** - Fix vote_date trigger error
3. **[enable-daily-voting.sql](enable-daily-voting.sql)** - Enable daily voting ← **RUN THIS**

## Verification

After running the SQL script, test:

```bash
npx tsx check-database-config.ts
```

Should show all ✓ green checkmarks.

In Supabase SQL Editor:
```sql
-- Check today's votes
SELECT
  u.email,
  a.title,
  v.vote_date,
  v.created_at
FROM votes v
JOIN public_users u ON u.id = v.user_id
JOIN artworks a ON a.id = v.artwork_id
WHERE v.vote_date = CURRENT_DATE
ORDER BY v.created_at DESC;
```

## Success Criteria

- ✅ Can vote for multiple artworks (one per artwork per day)
- ✅ Trying to vote again shows "already voted today"
- ✅ Refreshing page shows "Voted" button (gray)
- ✅ Signing out and back in restores voted state
- ✅ Tomorrow can vote again for same artworks
- ✅ Vote counts increment correctly

## Notes

- **Daily reset**: Happens at midnight UTC (database `CURRENT_DATE`)
- **Vote count**: Total votes across all days (doesn't reset)
- **Old votes**: Migrated to have `vote_date = DATE(created_at)`
- **Timezone**: Uses database server time (UTC by default)

## Summary

Run one SQL script and daily voting works:
**[enable-daily-voting.sql](enable-daily-voting.sql)**

That's it! 🎉
