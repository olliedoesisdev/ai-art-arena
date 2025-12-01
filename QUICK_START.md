# AI Art Arena - Quick Start Guide

Get your AI Art Arena instance up and running in under 15 minutes.

---

## 📋 Prerequisites

- Node.js 18+ and npm installed
- A Supabase account (free tier is fine)
- Git (for deployment)

---

## 🚀 Setup Steps

### 1. Install Dependencies (2 minutes)

```bash
cd ai-art-arena
npm install
```

### 2. Set Up Supabase (5 minutes)

#### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Click **New Project**
3. Name it "AI Art Arena"
4. Set database password (save it!)
5. Wait for project to initialize

#### Run Database Migrations
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy contents of `supabase-schema.sql`
4. Paste and click **Run**
5. Repeat for migrations in `/supabase-migrations/`:
   - `002_fix_can_vote_function.sql`
   - `003_add_settings_table.sql`
   - `004_add_position_and_indexes.sql`

#### Get Credentials
1. Go to **Settings** → **API**
2. Copy:
   - `Project URL`
   - `anon/public` key
   - `service_role` key (click "Reveal" and copy)

### 3. Configure Environment (3 minutes)

#### Create .env.local
```bash
cp .env.local.example .env.local
```

#### Edit .env.local
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx...

# Generate secrets:
# Cron: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Salt: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
CRON_SECRET=your_generated_cron_secret
IP_SALT=your_generated_salt

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Generate Secrets
```bash
# Generate cron secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate IP salt
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy and paste the outputs into your `.env.local`.

### 4. Run Development Server (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000/contest](http://localhost:3000/contest)

---

## ✅ Verify Installation

You should see:
- [ ] Contest page loads
- [ ] "No Active Contest" message (no contests yet)
- [ ] No console errors

### Create Test Contest

In Supabase SQL Editor:

```sql
-- Create a test contest
INSERT INTO contests (id, title, week_number, year, start_date, end_date, status)
VALUES (
  uuid_generate_v4(),
  'Test Contest - Week 1',
  1,
  2025,
  NOW(),
  NOW() + INTERVAL '7 days',
  'active'
);

-- Get the contest ID
SELECT id, title FROM contests WHERE status = 'active';

-- Create 6 sample artworks (replace <contest-id> with ID from above)
INSERT INTO artworks (contest_id, title, image_url, prompt, position) VALUES
('<contest-id>', 'Sunset Dreams', 'https://picsum.photos/800/800?random=1', 'A dreamy sunset over mountains', 1),
('<contest-id>', 'Cyber City', 'https://picsum.photos/800/800?random=2', 'Futuristic cityscape at night', 2),
('<contest-id>', 'Ocean Waves', 'https://picsum.photos/800/800?random=3', 'Powerful ocean waves crashing', 3),
('<contest-id>', 'Forest Magic', 'https://picsum.photos/800/800?random=4', 'Enchanted forest with glowing trees', 4),
('<contest-id>', 'Desert Bloom', 'https://picsum.photos/800/800?random=5', 'Desert flowers after rain', 5),
('<contest-id>', 'Mountain Peak', 'https://picsum.photos/800/800?random=6', 'Snow-covered mountain summit', 6);
```

Refresh the contest page - you should see 6 artworks in a grid!

---

## 🎨 Test Voting

1. Sign up for an account (click **Sign Up** in header)
2. Click **Vote** on any artwork
3. Verify vote count increases
4. Try voting again - should show cooldown message

---

## 🔧 Configuration

### Feature Flags

Add to `.env.local` to disable features:

```env
NEXT_PUBLIC_FEATURE_VOTING=false      # Disable voting
NEXT_PUBLIC_FEATURE_ARCHIVE=false     # Disable archive
NEXT_PUBLIC_FEATURE_BLOG=false        # Disable blog
```

### Contest Settings

Modify in Supabase (Settings → Database → SQL Editor):

```sql
-- Change max artworks per contest
UPDATE settings SET value = '8' WHERE key = 'contest.max_artworks';

-- Change vote cooldown to 12 hours
UPDATE settings SET value = '12' WHERE key = 'voting.cooldown_hours';

-- View all settings
SELECT * FROM settings ORDER BY key;
```

---

## 📱 Deploy to Vercel (5 minutes)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/ai-art-arena.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **New Project**
3. Import your GitHub repository
4. Add environment variables (copy from `.env.local`)
5. Click **Deploy**

### 3. Set Up Cron Job

Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/archive-contest",
      "schedule": "0 0 * * 0"
    }
  ]
}
```

This runs every Sunday at midnight to archive contests.

Push changes:
```bash
git add vercel.json
git commit -m "Add cron job config"
git push
```

---

## 🐛 Troubleshooting

### "Failed to fetch active contest"
- Check Supabase URL and keys in `.env.local`
- Verify migrations ran successfully
- Check Supabase logs for errors

### "IP_SALT environment variable is required"
- Generate salt: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Add to `.env.local` as `IP_SALT=...`

### Votes not working
- Ensure user is signed up/logged in
- Check browser console for errors
- Verify `can_vote()` function exists in Supabase
- Run migration 002 if not done

### Skeleton shows wrong number of items
- Check `CONTEST_CONFIG.max_artworks_per_contest` in `src/lib/constants.ts`
- Should match `contest.max_artworks` setting in database

---

## 📚 Next Steps

1. **Customize Design**
   - Update logo in `src/components/layout/Header.tsx`
   - Change colors in `tailwind.config.ts`
   - Update metadata in `src/app/layout.tsx`

2. **Add Real Artworks**
   - Upload images to Supabase Storage or external CDN
   - Update `image_url` in artworks table
   - Set appropriate alt text

3. **Set Up Analytics** (Optional)
   - Enable `NEXT_PUBLIC_FEATURE_ANALYTICS=true`
   - Visit `/admin/analytics` after creating contests

4. **Configure Admin Access**
   - Set up admin user in Supabase Auth
   - Implement role-based access control
   - Protect `/admin` routes

---

## 📖 Documentation

- **Full Setup:** See [README.md](README.md)
- **Architecture:** See [ARCHITECTURE_AUDIT_REPORT.md](ARCHITECTURE_AUDIT_REPORT.md)
- **Migrations:** See [MIGRATIONS.md](MIGRATIONS.md)
- **Improvements:** See [ARCHITECTURE_IMPROVEMENTS_COMPLETED.md](ARCHITECTURE_IMPROVEMENTS_COMPLETED.md)

---

## 🆘 Support

- Check [Troubleshooting](#-troubleshooting) section above
- Review existing GitHub issues
- Create new issue with error details

---

## ✨ You're All Set!

Your AI Art Arena is now running with:
- ✅ Secure authentication
- ✅ Rate limiting
- ✅ Feature flags
- ✅ Database-driven configuration
- ✅ Comprehensive documentation

**Happy voting! 🎨**
