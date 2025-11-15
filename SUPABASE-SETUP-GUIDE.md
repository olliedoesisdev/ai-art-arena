# 🗄️ Supabase Setup Guide

Your Supabase project needs to be created or reactivated.

---

## Option 1: Create New Supabase Project (Recommended)

### Step 1: Go to Supabase
👉 **https://supabase.com/dashboard**

### Step 2: Sign In
- Use GitHub, Google, or Email

### Step 3: Create New Project
1. Click **"New Project"**
2. Choose your organization (or create one)
3. Fill in:
   - **Name:** `ai-art-arena` (or any name)
   - **Database Password:** (save this somewhere safe!)
   - **Region:** Choose closest to you
   - **Pricing Plan:** Free

4. Click **"Create new project"**
5. Wait 2-3 minutes for setup

### Step 4: Get Your Credentials

Once the project is created:

1. Go to **Settings** (gear icon) → **API**

2. Copy these values:

   **Project URL:**
   ```
   https://YOUR_PROJECT_REF.supabase.co
   ```

   **anon/public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR...
   ```

   **service_role key:** (click "Reveal" button)
   ```
   eyJhbGciOiJIUzI1NiIsInR...
   ```

### Step 5: Update `.env.local`

Replace the values in your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 6: Run Database Schema

1. In Supabase Dashboard, click **SQL Editor** (left sidebar)
2. Open the file `supabase-schema.sql` from your project
3. Copy ALL contents
4. Paste into SQL Editor
5. Click **"Run"** (or Ctrl+Enter)
6. Should see: "Success. No rows returned"

### Step 7: Verify Tables Created

Run this query in SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('contests', 'artworks', 'votes');
```

You should see 3 tables listed.

### Step 8: Test Connection

Back in your project terminal:

```bash
node test-supabase-connection.js
```

Should see: ✅ Connection successful!

---

## Option 2: Reactivate Existing Project

If you already have a Supabase project but it's paused:

1. Go to **https://supabase.com/dashboard**
2. Sign in
3. Find your project
4. If it shows "Paused", click **"Restore"** or **"Unpause"**
5. Wait for it to become active
6. Follow Steps 4-8 above to get credentials and set up database

---

## Option 3: Fix Existing Project URL

If you think the URL is wrong:

1. Go to **https://supabase.com/dashboard**
2. Sign in
3. Open your project
4. Go to **Settings** → **API**
5. Copy the correct **Project URL**
6. Update `.env.local` with the correct URL

---

## After Setup is Complete

### 1. Restart your dev server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 2. Create Test Contest

```bash
# In Supabase SQL Editor, run:
# create-test-contest.sql
```

### 3. Visit your app

```
http://localhost:3000/contest
```

You should now see the contest page working!

---

## Troubleshooting

### "Could not resolve host"
- Your Supabase project doesn't exist or is paused
- Create a new project (see Option 1 above)

### "Invalid API key"
- Check that you copied the full key
- Make sure you used the anon key, not the service role key
- Verify no extra spaces or newlines

### "relation does not exist"
- You haven't run the database schema yet
- Run `supabase-schema.sql` in SQL Editor

### Connection works but no data
- Normal! You need to create a test contest
- Run `create-test-contest.sql` in SQL Editor

---

## Quick Start Checklist

- [ ] Create Supabase project
- [ ] Copy credentials to `.env.local`
- [ ] Run `supabase-schema.sql` in SQL Editor
- [ ] Verify 3 tables created
- [ ] Test connection: `node test-supabase-connection.js`
- [ ] Restart dev server: `npm run dev`
- [ ] Create test contest: `create-test-contest.sql`
- [ ] Visit: http://localhost:3000/contest

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs
- Create account: https://supabase.com/dashboard
