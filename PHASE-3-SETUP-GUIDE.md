# Phase 3: AI Art Contest Feature - Setup Guide

## ✅ Implementation Complete

All Phase 3 features have been successfully implemented and integrated with your Supabase database.

---

## 🗄️ Database Setup

### Step 1: Run the SQL Schema

1. Go to your Supabase Dashboard: https://uatmvggpkdsfdtjebcfs.supabase.co
2. Navigate to the **SQL Editor**
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click **Run** to create all tables, functions, and policies

This will create:
- ✅ `contests` table
- ✅ `artworks` table
- ✅ `votes` table
- ✅ Database functions (get_active_contest, can_vote, archive_contest, etc.)
- ✅ Row Level Security (RLS) policies
- ✅ Performance indexes

### Step 2: Verify the Schema

Run this query to verify tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('contests', 'artworks', 'votes');
```

You should see all 3 tables listed.

---

## 🔐 Environment Variables

### Required Variables (Already Configured)

Your `env.local` already has:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `CRON_SECRET`
- ✅ `NEXT_PUBLIC_SITE_URL`

### Optional: Add IP Salt for Vote Hashing

Add this to your `env.local` for better security:

```bash
IP_SALT=your_random_secret_salt_here_123456
```

Generate a random salt:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🎨 Testing Locally

### 1. Install Dependencies (if needed)

```bash
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

### 3. Create Test Data

Run this SQL in Supabase SQL Editor to create a test contest:

```sql
-- Create a test contest (active for next 7 days)
INSERT INTO contests (title, week_number, year, start_date, end_date, status)
VALUES (
  'AI Art Arena - Week 1',
  1,
  2025,
  NOW(),
  NOW() + INTERVAL '7 days',
  'active'
)
RETURNING id;

-- Copy the returned ID and use it in the next query
-- Replace 'YOUR_CONTEST_ID' with the actual ID

-- Create 5 test artworks
INSERT INTO artworks (contest_id, title, description, image_url, prompt, style)
VALUES
(
  'YOUR_CONTEST_ID',
  'Neon Cyberpunk City',
  'A vibrant cyberpunk cityscape at night',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
  'A futuristic neon-lit cyberpunk city at night, flying cars, holographic advertisements',
  'Cyberpunk'
),
(
  'YOUR_CONTEST_ID',
  'Ethereal Forest',
  'A mystical forest with glowing mushrooms',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800',
  'Magical forest with bioluminescent mushrooms and fairy lights',
  'Fantasy'
),
(
  'YOUR_CONTEST_ID',
  'Abstract Waves',
  'Colorful abstract wave patterns',
  'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800',
  'Abstract fluid art with vibrant colors and wave patterns',
  'Abstract'
),
(
  'YOUR_CONTEST_ID',
  'Space Exploration',
  'Astronaut floating in deep space',
  'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800',
  'Lone astronaut floating in the vastness of space with colorful nebula',
  'Sci-Fi'
),
(
  'YOUR_CONTEST_ID',
  'Ancient Ruins',
  'Overgrown temple ruins in a jungle',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
  'Ancient stone temple covered in vines and vegetation, jungle setting',
  'Adventure'
);
```

### 4. Test the Features

Visit these URLs:

- **Current Contest:** http://localhost:3000/contest
- **Archive:** http://localhost:3000/archive
- **Specific Contest:** http://localhost:3000/archive/[contest-id]

### 5. Test Voting

1. Go to http://localhost:3000/contest
2. Click a vote button on any artwork
3. You should see the vote count increment
4. Try voting again - should say "Already voted today"
5. Check the database:

```sql
SELECT * FROM votes ORDER BY voted_at DESC LIMIT 10;
SELECT id, title, vote_count FROM artworks ORDER BY vote_count DESC;
```

---

## 🚀 Deployment to Vercel

### Step 1: Deploy to Vercel

```bash
git add .
git commit -m "Add Phase 3: AI Art Contest feature with Supabase integration"
git push
```

Or manually deploy via Vercel dashboard.

### Step 2: Add Environment Variables in Vercel

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add all variables from `env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CRON_SECRET`
   - `NEXT_PUBLIC_SITE_URL` (set to your production URL)
   - `IP_SALT` (optional but recommended)

### Step 3: Verify Cron Job

The `vercel.json` is already configured to run the archive cron job:
- **Schedule:** Every Monday at midnight UTC (`0 0 * * 1`)
- **Endpoint:** `/api/cron/archive-contest`

To test the cron job manually:

```bash
curl -X POST https://your-domain.com/api/cron/archive-contest \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 📁 Files Created

### Supabase Client Configuration
- ✅ `src/lib/supabase/client.ts` - Browser client
- ✅ `src/lib/supabase/server.ts` - Server client
- ✅ `src/lib/supabase/middleware.ts` - Middleware helper
- ✅ `src/lib/supabase/index.ts` - Exports

### Database Schema
- ✅ `supabase-schema.sql` - Complete database schema

### API Routes
- ✅ `src/app/api/contests/active/route.ts` - Get active contest
- ✅ `src/app/api/contests/archived/route.ts` - Get archived contests
- ✅ `src/app/api/vote/route.ts` - Vote submission and checking
- ✅ `src/app/api/cron/archive-contest/route.ts` - Weekly archiving

### Pages
- ✅ `src/app/contest/page.tsx` - Current contest page
- ✅ `src/app/archive/page.tsx` - Archive listing
- ✅ `src/app/archive/[weekId]/page.tsx` - Individual contest details

### Configuration
- ✅ `vercel.json` - Already configured with cron

---

## 🎯 Features Implemented

### ✅ Contest Management
- Active contest display
- Automatic archiving via cron job
- Winner selection based on vote count
- Archive browsing with pagination

### ✅ Voting System
- One vote per IP per day per artwork
- Real-time vote count updates
- IP hashing for privacy
- Duplicate vote prevention
- Database-level vote validation

### ✅ Security
- Row Level Security (RLS) enabled
- IP address hashing (SHA-256)
- Cron job authentication
- Service role for admin operations
- Rate limiting ready

### ✅ Performance
- Database indexes on critical columns
- Pagination for archives
- ISR (Incremental Static Regeneration) for pages
- Optimized queries with Supabase RPC

---

## 🔄 Weekly Workflow

### Creating a New Contest

Run this SQL every week (or automate it):

```sql
INSERT INTO contests (title, week_number, year, start_date, end_date, status)
VALUES (
  'AI Art Arena - Week [NUMBER]',
  [WEEK_NUMBER],
  [YEAR],
  '[START_DATE]',
  '[END_DATE]',
  'active'
)
RETURNING id;
```

Then add 5 artworks using the contest ID returned.

### Automatic Archiving

Every Monday at midnight UTC:
1. Cron job runs automatically
2. Finds contests where `end_date < NOW()` and `status = 'active'`
3. Selects winner (artwork with most votes)
4. Updates contest status to 'archived'
5. Sets `winner_id` to the winning artwork

You can also manually trigger:
```bash
curl -X POST https://your-domain.com/api/cron/archive-contest \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 📊 Database Queries

### Check Active Contest
```sql
SELECT * FROM get_active_contest();
```

### Get Contest Leaderboard
```sql
SELECT a.*, c.title as contest_title
FROM artworks a
JOIN contests c ON a.contest_id = c.id
WHERE c.status = 'active'
ORDER BY a.vote_count DESC;
```

### Check Vote Counts
```sql
SELECT
  a.title,
  a.vote_count,
  COUNT(v.id) as actual_votes
FROM artworks a
LEFT JOIN votes v ON v.artwork_id = a.id
GROUP BY a.id
ORDER BY a.vote_count DESC;
```

### Get Voting Activity
```sql
SELECT
  DATE(voted_at) as vote_date,
  COUNT(*) as total_votes
FROM votes
GROUP BY DATE(voted_at)
ORDER BY vote_date DESC;
```

---

## 🐛 Troubleshooting

### No Active Contest Showing
- Check: `SELECT * FROM contests WHERE status = 'active'`
- Ensure `start_date <= NOW()` and `end_date > NOW()`

### Votes Not Incrementing
- Check trigger: `SELECT * FROM pg_trigger WHERE tgname = 'increment_artwork_votes'`
- Verify RLS policies allow inserts

### Cron Job Not Running
- Check Vercel logs: Dashboard → Your Project → Deployments → Logs
- Verify `CRON_SECRET` matches in code and request header
- Ensure `/api/cron/archive-contest/route.ts` exists

### "Already Voted" Error (but haven't voted)
- IP might be shared/VPN
- Clear cookies and try different browser
- Check: `SELECT * FROM votes WHERE ip_hash = '[YOUR_HASHED_IP]'`

---

## 🎨 Customization

### Change Contest Duration
Edit the SQL when creating contests - change `INTERVAL '7 days'` to your preferred duration.

### Change Cron Schedule
Edit `vercel.json`:
- `0 0 * * 1` = Every Monday at midnight
- `0 0 * * 0` = Every Sunday at midnight
- `0 12 * * 5` = Every Friday at noon
- [Learn more about cron syntax](https://crontab.guru)

### Add More Artworks
Just insert more rows into `artworks` table - no limit!

### Style/Theme Changes
All components are in `src/components/contest/` and `src/components/archive/` - customize freely!

---

## ✅ Next Steps

1. **Run `supabase-schema.sql`** in Supabase SQL Editor
2. **Create test contest data** using the SQL above
3. **Test locally** at http://localhost:3000/contest
4. **Deploy to Vercel** and add environment variables
5. **Test in production**
6. **Create your first real contest!**

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)

---

**🎉 Phase 3 is complete and ready to go! Let me know if you need any adjustments or have questions.**
