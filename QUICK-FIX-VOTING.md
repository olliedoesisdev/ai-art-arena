# Quick Fix Guide: Enable Voting

## The Problem
Vote buttons were disabled and votes weren't saving. Error: `record "new" has no field "vote_date"`

## The Solution (2 Steps)

### Step 1: Run SQL Script in Supabase
1. Open Supabase Dashboard → SQL Editor
2. Open [fix-vote-trigger.sql](fix-vote-trigger.sql)
3. Copy all contents
4. Paste into SQL Editor
5. Click "Run"
6. Verify you see: `✓ All fixes applied successfully!`

### Step 2: Test Voting
1. Open http://localhost:3001/contest
2. Click "Register to Vote" (if not signed in)
3. Sign up/Sign in with email
4. Click "Vote" on any artwork
5. Should see "Vote recorded — thank you!"
6. Button changes to "Voted" (gray)
7. Try voting again → Should show error: "You've already voted for this artwork in this contest!"

## What Was Fixed

### Frontend (Already Committed ✅)
- Fixed `contest.status` check (was undefined)
- Mapped `contest_id` to `id`
- Improved error messages

### Database (Need to Run SQL Script ⚠️)
- Removed old `vote_date` trigger
- Created new `update_artwork_vote_count()` trigger
- Trigger now works with email-based voting schema

## Verification

### Check if fix is applied:
```bash
npx tsx check-database-config.ts
```

Should show all ✓ green checkmarks.

### Check votes in database:
In Supabase SQL Editor:
```sql
-- See all votes
SELECT * FROM votes ORDER BY created_at DESC LIMIT 10;

-- See vote counts per artwork
SELECT
  a.title,
  a.vote_count,
  COUNT(v.id) as actual_votes
FROM artworks a
LEFT JOIN votes v ON v.artwork_id = a.id
GROUP BY a.id, a.title, a.vote_count
ORDER BY a.vote_count DESC;
```

## Files to Run in Supabase

1. **fix-vote-trigger.sql** ← **RUN THIS FIRST!** (Critical)
2. verify-and-fix-voting.sql (Optional diagnostic)
3. migrate-to-email-voting.sql (Already run if tables exist)

## Troubleshooting

### "Table public_users does not exist"
Run [migrate-to-email-voting.sql](migrate-to-email-voting.sql) first

### "Function can_vote does not exist"
Run [verify-and-fix-voting.sql](verify-and-fix-voting.sql)

### Still getting vote_date error
1. Check you ran [fix-vote-trigger.sql](fix-vote-trigger.sql) completely
2. Verify in SQL Editor:
   ```sql
   SELECT trigger_name FROM information_schema.triggers
   WHERE event_object_table = 'votes';
   ```
   Should only show: `trigger_update_artwork_vote_count`

### Votes not being limited
Check unique constraint exists:
```sql
SELECT constraint_name FROM information_schema.table_constraints
WHERE table_name = 'votes' AND constraint_type = 'UNIQUE';
```
Should show: `votes_user_artwork_contest_unique`

If missing, run:
```sql
ALTER TABLE votes ADD CONSTRAINT votes_user_artwork_contest_unique
  UNIQUE(user_id, artwork_id, contest_id);
```

## Success Criteria

- ✅ Vote buttons are enabled for authenticated users
- ✅ Clicking vote shows success message
- ✅ Vote count increments by 1
- ✅ Button changes to "Voted" (gray, disabled)
- ✅ Trying to vote again shows "already voted" error
- ✅ Refreshing page maintains voted state
- ✅ Votes are saved to database
- ✅ Different users can vote for the same artwork

## Summary

**Run this one SQL script and voting will work:**
[fix-vote-trigger.sql](fix-vote-trigger.sql)

That's it! 🎉
