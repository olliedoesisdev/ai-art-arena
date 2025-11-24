# Setup Checklist - AI Art Arena Daily Voting

## Current Status
✅ All code changes committed (11 commits ready to push)
⏳ SQL scripts need to be run in Supabase
⏳ Testing required after SQL scripts

## Step 1: Run SQL Scripts (IN ORDER)

### 1.1 Extend Contest (Run First)
1. Open Supabase Dashboard → SQL Editor
2. Copy contents from [extend-contest.sql](extend-contest.sql)
3. Paste and click "Run"
4. Verify output shows contest extended by 7 days

### 1.2 Fix Vote Triggers (Run Second)
1. In SQL Editor, copy contents from [fix-vote-trigger.sql](fix-vote-trigger.sql)
2. Paste and click "Run"
3. Verify output shows triggers created successfully

### 1.3 Enable Daily Voting (Run Third)
1. In SQL Editor, copy contents from [enable-daily-voting.sql](enable-daily-voting.sql)
2. Paste and click "Run"
3. Verify all steps complete with ✓ status messages

## Step 2: Test the System

### 2.1 Registration Flow
- [ ] Go to http://localhost:3001/contest
- [ ] Click "Register to Vote"
- [ ] Try registering with a NEW email → Should succeed
- [ ] Try registering with SAME email → Should auto-switch to sign-in mode

### 2.2 Voting Flow
- [ ] Sign in with your account
- [ ] Vote for Artwork A → Should show "Vote recorded — thank you! You can vote again tomorrow."
- [ ] Try voting for Artwork A again → Should show "You've already voted for this artwork today!"
- [ ] Vote for Artwork B → Should succeed
- [ ] Vote for Artwork C → Should succeed
- [ ] All three artworks should show gray "Voted" button

### 2.3 Persistence Testing
- [ ] Refresh the page → All three "Voted" buttons should remain gray
- [ ] Sign out
- [ ] Sign back in → All three "Voted" buttons should still be gray
- [ ] Check vote counts incremented correctly

### 2.4 Daily Reset (Tomorrow)
- [ ] Come back tomorrow
- [ ] Sign in
- [ ] All vote buttons should be enabled again (blue)
- [ ] Should be able to vote for the same artworks again

## Step 3: Push Code Changes

```bash
git push origin main
```

This will push 11 commits:
1. Fix contest status check and vote button state
2. Create vote trigger fix SQL script
3. Update contest status handling
4. Fix vote button to check isAuthenticated
5. Create extend-contest SQL script
6. Fix enable-daily-voting script
7. Add IF EXISTS to constraint drop
8. Fix vote tracking for multiple artworks
9. Add documentation files
10. Update setup instructions
11. Fix auto-switch to sign-in for registered users

## What Changed

### Database Changes
- Added `vote_date` column to votes table
- Changed constraint from "one per contest" to "one per day per artwork"
- Created `can_vote()` function to check daily votes
- Created `get_user_votes_today()` function to fetch today's votes
- Fixed vote count triggers to work without vote_date field reference

### Frontend Changes
- Track multiple voted artworks using `Set<string>`
- Fetch votes from database on authentication
- Persist vote state across sessions
- Show vote state correctly for each artwork independently
- Auto-switch to login when user already registered
- Improved error messages

### Voting Rules
- **Before**: One vote per artwork for entire contest
- **After**: One vote per artwork per day
- Votes persist in database (not localStorage)
- Daily reset at midnight UTC

## Troubleshooting

### "Function does not exist" error
→ Run the SQL scripts in order (extend-contest.sql, fix-vote-trigger.sql, enable-daily-voting.sql)

### Votes not persisting
→ Check that enable-daily-voting.sql completed successfully
→ Verify functions exist:
```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_name IN ('get_user_votes_today', 'can_vote');
```

### Vote buttons always enabled/disabled
→ Check browser console for errors
→ Verify you're signed in
→ Check that contest is active in database

### "User already registered" error
→ Fixed! Modal now auto-switches to sign-in mode

## Success Criteria

All of these should work:
- ✅ Users can register new accounts
- ✅ Existing users auto-switch to sign-in
- ✅ Users can vote for multiple artworks (one each per day)
- ✅ Vote state persists across page refreshes
- ✅ Vote state persists across sessions
- ✅ Tomorrow users can vote again
- ✅ Vote counts increment correctly
- ✅ Clear error messages for all failure cases

## Need Help?

- Check [DAILY-VOTING-SETUP.md](DAILY-VOTING-SETUP.md) for detailed explanation
- Check [enable-daily-voting.sql](enable-daily-voting.sql) for database schema
- Look at git log for commit history: `git log --oneline -15`
