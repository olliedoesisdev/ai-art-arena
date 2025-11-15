# 🚀 Phase 3: Quick Start Guide

Get your AI Art Contest up and running in 5 minutes!

---

## ⚡ Quick Setup Steps

### 1️⃣ Run the Database Schema (2 minutes)

1. Open **Supabase Dashboard**: https://uatmvggpkdsfdtjebcfs.supabase.co
2. Click **SQL Editor** in the sidebar
3. Copy **ALL** contents from `supabase-schema.sql`
4. Paste into SQL Editor
5. Click **Run** (or press Ctrl+Enter)
6. ✅ You should see "Success. No rows returned"

### 2️⃣ Add IP Salt to Environment (30 seconds)

Generate a random salt:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to your `env.local`:
```bash
IP_SALT=<paste_the_generated_salt_here>
```

### 3️⃣ Create Test Contest (2 minutes)

1. Open `create-test-contest.sql`
2. Run the first query to create a contest - **copy the returned ID**
3. Replace `PASTE_CONTEST_ID_HERE` in the second query with the ID
4. Run the second query to create 5 sample artworks
5. ✅ Done!

### 4️⃣ Test Locally (1 minute)

```bash
npm run dev
```

Visit: http://localhost:3000/contest

You should see:
- ✅ Contest title and timer
- ✅ 5 artwork cards
- ✅ Vote buttons

Click a vote button - the count should increment!

---

## 🎯 What You Can Do Now

### Test Voting
- Click any vote button
- Vote count increases
- Try voting again → "Already voted today"
- Open in incognito window → Can vote again (different IP simulation)

### Check the Archive
- Visit http://localhost:3000/archive
- Should show archived contests (none yet)
- After contest ends, cron job will archive it automatically

### View Contest Details
- When you archive a contest, visit `/archive/[contest-id]`
- See winner, all entries, vote counts

---

## 📋 Verification Checklist

Run these SQL queries in Supabase to verify:

### Check Tables Exist
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('contests', 'artworks', 'votes');
```
✅ Should return 3 rows

### Check Active Contest
```sql
SELECT * FROM get_active_contest();
```
✅ Should return your test contest

### Check Artworks
```sql
SELECT id, title, vote_count FROM artworks
WHERE contest_id = (SELECT id FROM get_active_contest());
```
✅ Should return 5 artworks

### Check Votes (after testing)
```sql
SELECT COUNT(*) FROM votes;
```
✅ Should show vote count

---

## 🚀 Deploy to Production

### 1. Add to Vercel Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://uatmvggpkdsfdtjebcfs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = <your_anon_key>
SUPABASE_SERVICE_ROLE_KEY = <your_service_role_key>
CRON_SECRET = <your_cron_secret>
NEXT_PUBLIC_SITE_URL = https://yourdomain.com
IP_SALT = <your_generated_salt>
```

### 2. Deploy

```bash
git add .
git commit -m "Add Phase 3: AI Art Contest with Supabase"
git push
```

Vercel will auto-deploy!

### 3. Test Production

- Visit https://yourdomain.com/contest
- Test voting
- Check cron job runs every Monday at midnight

### 4. Manual Cron Test (Optional)

```bash
curl -X POST https://yourdomain.com/api/cron/archive-contest \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 🎨 Create Your First Real Contest

### Option A: Manual SQL

```sql
INSERT INTO contests (title, week_number, year, start_date, end_date, status)
VALUES (
  'AI Art Arena - Week 1',
  1,
  2025,
  '2025-11-14 00:00:00+00',  -- Start date
  '2025-11-21 00:00:00+00',  -- End date (1 week later)
  'active'
)
RETURNING id;
```

Then add your artworks using the returned ID.

### Option B: Use the Test SQL

Edit `create-test-contest.sql` with:
- Real artwork URLs (upload to Supabase Storage)
- Real prompts you used
- Real titles and descriptions

---

## 📊 Monitor Your Contest

### Real-time Stats

```sql
-- Leaderboard
SELECT
  a.title,
  a.vote_count,
  a.style
FROM artworks a
JOIN contests c ON a.contest_id = c.id
WHERE c.status = 'active'
ORDER BY a.vote_count DESC;

-- Daily vote activity
SELECT
  DATE(voted_at) as date,
  COUNT(*) as votes
FROM votes
GROUP BY DATE(voted_at)
ORDER BY date DESC;

-- Most popular style
SELECT
  a.style,
  COUNT(v.id) as total_votes
FROM artworks a
LEFT JOIN votes v ON v.artwork_id = a.id
JOIN contests c ON a.contest_id = c.id
WHERE c.status = 'active'
GROUP BY a.style
ORDER BY total_votes DESC;
```

---

## 🛠️ Troubleshooting

### "No Active Contest" showing
**Fix:** Check your contest dates
```sql
SELECT title, start_date, end_date, status
FROM contests
WHERE status = 'active';
```
Ensure `start_date <= NOW()` and `end_date > NOW()`

### Vote button not working
1. Check browser console for errors
2. Verify API is reachable: http://localhost:3000/api/contests/active
3. Check Supabase RLS policies are enabled

### "Already voted" but I haven't
- Your IP might be cached
- Try incognito mode
- Clear browser cookies
- Check if someone else on your network voted

### Cron job not running
1. Check Vercel logs
2. Verify `vercel.json` has the cron configuration
3. Test manually with curl (see command above)

---

## 📚 Files You Created

```
Phase 3 Implementation:
├── src/
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts         ✅ Browser client
│   │       ├── server.ts         ✅ Server client
│   │       ├── middleware.ts     ✅ Middleware helper
│   │       └── index.ts          ✅ Exports
│   └── app/
│       ├── api/
│       │   ├── contests/
│       │   │   ├── active/route.ts    ✅ Get current contest
│       │   │   └── archived/route.ts  ✅ Get past contests
│       │   ├── vote/route.ts          ✅ Vote endpoint
│       │   └── cron/
│       │       └── archive-contest/route.ts  ✅ Weekly archiving
│       ├── contest/page.tsx      ✅ Current contest page
│       └── archive/
│           ├── page.tsx          ✅ Archive listing
│           └── [weekId]/page.tsx ✅ Contest details
├── supabase-schema.sql           ✅ Database schema
├── create-test-contest.sql       ✅ Quick test data
├── middleware.ts                 ✅ Supabase middleware
├── .env.local.example            ✅ Updated with new vars
├── PHASE-3-SETUP-GUIDE.md        ✅ Comprehensive guide
└── PHASE-3-QUICK-START.md        ✅ This file!
```

---

## ✅ You're Done!

Your AI Art Contest is now fully functional with:
- ✅ Supabase database integration
- ✅ Voting system (1 vote/day/IP)
- ✅ Automatic weekly archiving
- ✅ Winner selection
- ✅ Archive browsing
- ✅ Beautiful UI components
- ✅ Production-ready deployment

**Next Steps:**
1. Create your first real contest
2. Share the link!
3. Watch the votes roll in
4. Announce the winner every week

---

Need help? Check the comprehensive guide: `PHASE-3-SETUP-GUIDE.md`

**Happy voting! 🎨✨**
