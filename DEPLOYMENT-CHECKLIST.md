# 📋 Phase 3 Deployment Checklist

Use this checklist to ensure everything is set up correctly.

---

## 🗄️ Database Setup

- [ ] Opened Supabase Dashboard (https://uatmvggpkdsfdtjebcfs.supabase.co)
- [ ] Navigated to SQL Editor
- [ ] Copied entire `supabase-schema.sql` file
- [ ] Ran the schema in SQL Editor
- [ ] Verified success (no errors)
- [ ] Confirmed tables exist:
  ```sql
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('contests', 'artworks', 'votes');
  ```
- [ ] Result shows 3 tables ✓

---

## 🔐 Environment Variables

### Local Development

- [ ] Generated IP salt:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Added `IP_SALT` to `env.local`
- [ ] Verified all required variables in `env.local`:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` ✓
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` ✓
  - [ ] `CRON_SECRET` ✓
  - [ ] `NEXT_PUBLIC_SITE_URL` ✓
  - [ ] `IP_SALT` (just added)

### Vercel Production

- [ ] Opened Vercel Dashboard
- [ ] Navigated to Project → Settings → Environment Variables
- [ ] Added all variables:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `CRON_SECRET`
  - [ ] `NEXT_PUBLIC_SITE_URL` (set to production domain)
  - [ ] `IP_SALT`

---

## 🧪 Test Data Creation

- [ ] Opened `create-test-contest.sql`
- [ ] Ran Step 1 (create contest)
- [ ] Copied the returned contest ID
- [ ] Pasted ID in Step 3 (replace `PASTE_CONTEST_ID_HERE`)
- [ ] Ran Step 3 (create artworks)
- [ ] Ran Step 4 (verify data)
- [ ] Verified 5 artworks created
- [ ] Ran Step 5 to see artwork list

---

## 🖥️ Local Testing

### Start Server
- [ ] Ran `npm install` (if needed)
- [ ] Ran `npm run dev`
- [ ] No errors in console
- [ ] Server running on http://localhost:3000

### Test Contest Page
- [ ] Visited http://localhost:3000/contest
- [ ] Page loads without errors
- [ ] Contest title displays
- [ ] Timer shows and counts down
- [ ] 5 artwork cards visible
- [ ] Images load correctly
- [ ] Vote buttons visible

### Test Voting
- [ ] Clicked a vote button
- [ ] Vote count incremented
- [ ] Button changes to "Voted"
- [ ] Clicked same button again
- [ ] Sees "Already voted today" message
- [ ] Opened browser DevTools
- [ ] No errors in console
- [ ] Network tab shows successful POST to `/api/vote`

### Test Archive
- [ ] Visited http://localhost:3000/archive
- [ ] Page loads (may be empty - that's OK)
- [ ] No errors in console

### Verify Database
- [ ] Opened Supabase Dashboard
- [ ] Navigated to Table Editor
- [ ] Checked `votes` table
- [ ] Sees vote records
- [ ] Checked `artworks` table
- [ ] `vote_count` incremented correctly

---

## 🚀 Deployment

### Git Commit
- [ ] Staged all files:
  ```bash
  git add .
  ```
- [ ] Committed changes:
  ```bash
  git commit -m "Phase 3: AI Art Contest with Supabase integration"
  ```
- [ ] Pushed to repository:
  ```bash
  git push
  ```

### Vercel Deployment
- [ ] Vercel auto-deployment triggered
- [ ] Checked deployment logs
- [ ] Build succeeded
- [ ] No build errors

### Production Testing
- [ ] Visited production URL
- [ ] `/contest` page loads
- [ ] Artworks display correctly
- [ ] Vote button works
- [ ] `/archive` page accessible

---

## ⏰ Cron Job Verification

### Check Configuration
- [ ] Opened `vercel.json`
- [ ] Verified cron configuration exists:
  ```json
  "crons": [{
    "path": "/api/cron/archive-contest",
    "schedule": "0 0 * * 1"
  }]
  ```

### Manual Cron Test
- [ ] Prepared curl command with your `CRON_SECRET`:
  ```bash
  curl -X POST https://your-domain.com/api/cron/archive-contest \
    -H "Authorization: Bearer YOUR_CRON_SECRET"
  ```
- [ ] Ran the command
- [ ] Received success response
- [ ] (If you had an ended contest) It was archived

### Monitor Cron
- [ ] Checked Vercel Dashboard → Your Project → Cron
- [ ] Cron job listed and scheduled
- [ ] Set a reminder to check logs next Monday

---

## 📊 Database Functions Test

Run these in Supabase SQL Editor to verify:

### Test get_active_contest()
- [ ] Ran:
  ```sql
  SELECT * FROM get_active_contest();
  ```
- [ ] Returns contest data ✓

### Test can_vote()
- [ ] Ran (replace with real IDs):
  ```sql
  SELECT can_vote(
    'ARTWORK_ID_HERE'::uuid,
    'test_ip_hash'
  );
  ```
- [ ] Returns `true` or `false` ✓

### Test get_contest_winner()
- [ ] Ran (replace with real ID):
  ```sql
  SELECT get_contest_winner('CONTEST_ID_HERE'::uuid);
  ```
- [ ] Returns artwork ID of highest voted ✓

### Test archive_contest()
**WARNING: This will archive a contest - only test on test data!**
- [ ] Created a test contest that has ended
- [ ] Ran:
  ```sql
  SELECT archive_contest('TEST_CONTEST_ID_HERE'::uuid);
  ```
- [ ] Checked contest status changed to 'archived'
- [ ] Checked winner_id was set

---

## 🔒 Security Verification

- [ ] RLS enabled on all tables:
  ```sql
  SELECT tablename, rowsecurity FROM pg_tables
  WHERE tablename IN ('contests', 'artworks', 'votes');
  ```
- [ ] All should show `rowsecurity = true`
- [ ] Verified public can read contests
- [ ] Verified public can vote (insert votes)
- [ ] Verified service role key is secure (not in git)
- [ ] Verified cron secret is secure (not in git)

---

## 📱 Cross-Browser Testing

### Desktop
- [ ] Chrome - contest page works
- [ ] Chrome - voting works
- [ ] Firefox - contest page works
- [ ] Firefox - voting works
- [ ] Safari - contest page works (if available)
- [ ] Safari - voting works (if available)

### Mobile
- [ ] Mobile Chrome - page responsive
- [ ] Mobile Chrome - voting works
- [ ] Mobile Safari - page responsive (if available)
- [ ] Mobile Safari - voting works (if available)

---

## 📈 Performance Check

- [ ] Opened Chrome DevTools
- [ ] Went to Network tab
- [ ] Loaded `/contest` page
- [ ] API response time < 1 second
- [ ] Images load efficiently
- [ ] No unnecessary requests
- [ ] Ran Lighthouse audit
- [ ] Performance score > 80

---

## 🎨 UI/UX Check

- [ ] Contest title displays correctly
- [ ] Timer counts down properly
- [ ] All 5 artworks visible
- [ ] Images load and display well
- [ ] Vote buttons are clickable
- [ ] Vote count updates instantly
- [ ] Hover effects work
- [ ] Mobile layout looks good
- [ ] No layout shifts (CLS)
- [ ] Loading states appear when needed

---

## 📝 Documentation Review

- [ ] Read `PHASE-3-QUICK-START.md`
- [ ] Read `PHASE-3-SETUP-GUIDE.md`
- [ ] Read `PHASE-3-COMPLETE.md`
- [ ] Understand how to create new contests
- [ ] Understand weekly workflow
- [ ] Know how to troubleshoot issues

---

## 🎯 Final Checks

- [ ] All pages load without errors
- [ ] Voting system works correctly
- [ ] Database records votes accurately
- [ ] Archive page ready (even if empty)
- [ ] Cron job configured and tested
- [ ] Environment variables set in Vercel
- [ ] Production deployment successful
- [ ] No sensitive data in git repository
- [ ] Documentation is clear and accessible

---

## ✅ Ready for Launch!

Once all items are checked:

- [ ] **Create your first real contest** (see `PHASE-3-SETUP-GUIDE.md`)
- [ ] **Promote the contest** on social media
- [ ] **Monitor votes** throughout the week
- [ ] **Let the cron job archive** on Monday
- [ ] **Announce the winner!**

---

## 🆘 If Something's Not Working

1. Check browser console for errors
2. Check Vercel deployment logs
3. Check Supabase logs (Dashboard → Logs)
4. Review `PHASE-3-SETUP-GUIDE.md` troubleshooting section
5. Verify all environment variables are set
6. Ensure database schema was run successfully

---

**Date Completed:** __________

**Deployed By:** __________

**Production URL:** __________

---

**🎉 Congratulations! Phase 3 is live!**
