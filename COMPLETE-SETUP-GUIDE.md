# Complete Setup Guide - AI Art Arena

## 🎯 What We've Accomplished

### ✅ Authentication System
- **Passwordless email authentication** - Users only need email to vote
- **Magic links** - No passwords, no verification required
- **Resend functionality** - Users can request new links

### ✅ Environment Configuration
- **Local dev**: `http://localhost:3000`
- **Production**: `https://olliedoesis.dev`
- **Auto-detection**: Works everywhere automatically

### ✅ Database Structure
- **Proper schema separation**: Public vs Admin
- **Security**: Row Level Security (RLS) policies
- **Blog system**: Full blog management

## 📋 Setup Checklist

### Step 1: Configure Supabase Authentication

**REQUIRED before testing!**

1. Go to https://supabase.com/dashboard
2. Navigate to **Authentication** → **Settings**
3. **Disable email confirmations**:
   - Find "Enable email confirmations"
   - Toggle it **OFF**
   - Save changes

4. **Add redirect URLs**:
   - Go to **Authentication** → **URL Configuration**
   - Add these URLs:
     ```
     http://localhost:3000/auth/callback
     https://olliedoesis.dev/auth/callback
     https://*.vercel.app/auth/callback
     ```

5. **Set site URL**:
   - Production: `https://olliedoesis.dev`

### Step 2: Restructure Database

**Follow this guide**: [DATABASE-RESTRUCTURE.md](DATABASE-RESTRUCTURE.md)

**Quick steps**:
1. Backup your database
2. Run SQL scripts in order:
   - `01-drop-old-tables.sql`
   - `02-create-admin-schema.sql`
   - `03-seed-admin-data.sql`
   - `04-create-admin-user.sql` (after editing with your email)

### Step 3: Test Locally

```bash
# Start dev server
npm run dev

# Open http://localhost:3000
# Try the voting flow:
# 1. Click on an artwork
# 2. Enter your email (no password!)
# 3. Check email for magic link
# 4. Click link
# 5. Should be logged in and able to vote
```

### Step 4: Configure Vercel

**Before deploying to production**:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these for **Production**:

```env
NEXT_PUBLIC_SITE_URL=https://olliedoesis.dev
NEXT_PUBLIC_SUPABASE_URL=https://qolctvveygnhxbjxzzkb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[from .env.local]
SUPABASE_SERVICE_ROLE_KEY=[from .env.local]
NEXTAUTH_URL=https://olliedoesis.dev
NEXTAUTH_SECRET=[from .env.local]
GITHUB_ID=[from .env.local]
GITHUB_SECRET=[from .env.local]
CRON_SECRET=[from .env.local]
IP_SALT=[from .env.local]
```

5. **Set up domain**:
   - Go to **Settings** → **Domains**
   - Add `olliedoesis.dev`
   - Configure DNS as instructed

### Step 5: Deploy

```bash
# Commit all changes
git add .
git commit -m "Implement passwordless auth and restructure database"
git push origin main

# Vercel will auto-deploy to https://olliedoesis.dev
```

## 📁 File Reference

### Documentation
- **[QUICK-START.md](QUICK-START.md)** - Quick reference guide
- **[AUTH-SETUP.md](AUTH-SETUP.md)** - Authentication setup details
- **[ENVIRONMENT-SETUP.md](ENVIRONMENT-SETUP.md)** - Environment configuration
- **[DATABASE-RESTRUCTURE.md](DATABASE-RESTRUCTURE.md)** - Database migration guide
- **[IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md)** - Technical details

### Database Scripts
- **[01-drop-old-tables.sql](database/01-drop-old-tables.sql)** - Remove old tables
- **[02-create-admin-schema.sql](database/02-create-admin-schema.sql)** - Create admin schema
- **[03-seed-admin-data.sql](database/03-seed-admin-data.sql)** - Seed initial data
- **[04-create-admin-user.sql](database/04-create-admin-user.sql)** - Add your admin account

### Code Files
- **[src/components/auth/VoterAuthModal.tsx](src/components/auth/VoterAuthModal.tsx)** - Auth modal
- **[src/app/api/auth/register/route.ts](src/app/api/auth/register/route.ts)** - Registration API
- **[src/app/api/auth/login/route.ts](src/app/api/auth/login/route.ts)** - Login API
- **[src/app/auth/callback/route.ts](src/app/auth/callback/route.ts)** - Magic link callback
- **[src/lib/env.ts](src/lib/env.ts)** - Environment utilities

### Environment Files
- **[.env.local](.env.local)** - Local development config
- **[.env.production](.env.production)** - Production config

## 🎯 How It Works

### User Authentication Flow

1. **User wants to vote** → Clicks artwork
2. **Modal opens** → Enter email (optional name for signup)
3. **Magic link sent** → Check email
4. **Click link** → Redirects to `/auth/callback`
5. **Callback handler** → Exchanges code for session
6. **Redirects back** → User logged in, can vote

### Environment Detection

```typescript
import { getBaseUrl } from '@/lib/env';

// Automatically returns:
// - http://localhost:3000 (local dev)
// - https://olliedoesis.dev (production)
// - https://[app]-[hash].vercel.app (preview)
const url = getBaseUrl();
```

### Database Structure

```
┌─────────────────────────────────────┐
│         Public Schema               │
│  (User-facing, public access)       │
├─────────────────────────────────────┤
│  • artworks                         │
│  • contests                         │
│  • votes                            │
│  • audit_logs                       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         Admin Schema                │
│  (Private, admin-only)              │
├─────────────────────────────────────┤
│  • users (admin accounts)           │
│  • blog_posts                       │
│  • blog_categories                  │
│  • blog_tags                        │
│  • blog_post_tags                   │
│  • blog_media                       │
│  • blog_post_revisions              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         Auth Schema                 │
│  (Managed by Supabase)              │
├─────────────────────────────────────┤
│  • users (Supabase Auth)            │
└─────────────────────────────────────┘
```

## ✅ Testing Checklist

### Authentication Tests
- [ ] Can open vote modal
- [ ] Can enter email and request magic link
- [ ] Magic link email received
- [ ] Clicking link logs in successfully
- [ ] Can vote after logging in
- [ ] "Resend Email" button works
- [ ] Can switch between signup/login modes

### Environment Tests
- [ ] Local dev runs on localhost:3000
- [ ] Magic links use correct redirect URL
- [ ] Production deployment works
- [ ] Preview deployments work

### Database Tests
- [ ] Admin schema exists
- [ ] Can access admin dashboard
- [ ] Can create blog posts
- [ ] Can manage categories/tags
- [ ] Public tables still work
- [ ] Voting still works

## 🐛 Troubleshooting

### Magic Links Not Working

**Issue**: Click magic link, nothing happens

**Solutions**:
- Check Supabase has redirect URLs configured
- Verify email confirmation is disabled
- Check browser console for errors
- Try "Resend Email"

### Wrong URL in Emails

**Issue**: Magic links point to wrong domain

**Solutions**:
- Check `NEXT_PUBLIC_SITE_URL` in environment
- Restart dev server
- Clear browser cache
- Verify Vercel environment variables

### Database Errors

**Issue**: "relation does not exist"

**Solutions**:
- Check you ran all SQL scripts
- Verify admin schema was created
- Check table names use `admin.` prefix
- Regenerate TypeScript types

### Admin Access Denied

**Issue**: Can't access admin dashboard

**Solutions**:
- Check you ran `04-create-admin-user.sql`
- Verify your email in the script
- Check admin user exists: `SELECT * FROM admin.users`
- Verify RLS policies are set up

## 🚀 Deployment

### Pre-Deployment Checklist
- [ ] Supabase configured (email settings)
- [ ] Database restructured (admin schema)
- [ ] Local testing passed
- [ ] Vercel environment variables set
- [ ] Domain configured (olliedoesis.dev)

### Deploy Command
```bash
git add .
git commit -m "Complete passwordless auth and database restructure"
git push origin main
```

### Post-Deployment Tests
- [ ] Visit https://olliedoesis.dev
- [ ] Test magic link signup
- [ ] Test voting
- [ ] Test admin login
- [ ] Check blog functionality

## 📊 Summary

### What Changed
- ✅ Authentication: Password → Magic Links
- ✅ Database: Public → Admin Schema Separation
- ✅ Environment: Manual URLs → Auto-Detection
- ✅ Security: Basic → RLS Policies
- ✅ Documentation: Scattered → Comprehensive

### Benefits
- ✅ **Easier signup** - Just email, no password
- ✅ **Better security** - Admin data is private
- ✅ **Cleaner code** - Environment auto-detection
- ✅ **Scalable** - Proper schema structure
- ✅ **Maintainable** - Clear documentation

## 🎉 You're Ready!

Everything is configured and documented. Follow the steps in order:

1. Configure Supabase (Step 1)
2. Restructure Database (Step 2)
3. Test Locally (Step 3)
4. Configure Vercel (Step 4)
5. Deploy (Step 5)

Your AI Art Arena is now ready for production with passwordless authentication and proper database structure! 🎨✨

## 📞 Need Help?

Refer to these guides:
- Quick start: [QUICK-START.md](QUICK-START.md)
- Auth setup: [AUTH-SETUP.md](AUTH-SETUP.md)
- Database: [DATABASE-RESTRUCTURE.md](DATABASE-RESTRUCTURE.md)
- Environment: [ENVIRONMENT-SETUP.md](ENVIRONMENT-SETUP.md)
