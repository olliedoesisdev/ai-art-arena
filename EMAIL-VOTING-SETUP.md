# Email-Based Voting System Setup Guide

This guide will help you migrate from IP-based voting to email-based voting, where users must register with their email to vote.

## Overview

**What Changed:**
- ❌ **Before**: Anonymous voting based on IP address (1 vote per day per IP)
- ✅ **Now**: Registered voting based on email (1 vote per person per artwork per contest)

**Benefits:**
- More accurate vote tracking (1 person = 1 vote)
- No VPN bypasses
- Build a user community
- Better analytics

---

## Step 1: Run Database Migration

1. Open Supabase Dashboard → **SQL Editor**
2. Open [migrate-to-email-voting.sql](migrate-to-email-voting.sql)
3. Copy the entire file
4. Paste into SQL Editor
5. Click **Run**

**What this does:**
- Creates `public_users` table for registered voters
- Updates `votes` table schema to require `user_id`
- Updates the `can_vote()` function to check by user ID instead of IP
- Adds Row Level Security policies
- Creates helper functions

**Note:** Existing votes with null `user_id` will remain in the database but won't be counted going forward.

### Optional: Clean Slate

If you want to start fresh with no existing votes:

```sql
-- Clear all votes
TRUNCATE votes;

-- Reset vote counts
UPDATE artworks SET vote_count = 0;
```

---

## Step 2: Verify Migration

Run these verification queries in Supabase SQL Editor:

```sql
-- Check public_users table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'public_users';

-- Check votes table constraint
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'votes'
AND constraint_name = 'votes_user_artwork_contest_unique';

-- Check can_vote function
SELECT routine_name, data_type
FROM information_schema.routines
WHERE routine_name = 'can_vote';
```

Expected results:
- ✅ `public_users` table exists
- ✅ Unique constraint on votes (user_id, artwork_id, contest_id)
- ✅ `can_vote` function returns boolean

---

## Step 3: Test the New System

### 3.1 Start Your Dev Server

```bash
npm run dev
```

### 3.2 Visit the Contest Page

Go to `http://localhost:3000/contest`

You should see:
- 🔵 **Blue banner** saying "Sign in to vote — Register with your email to participate"
- **"Sign In / Sign Up" button**
- Artwork grid is visible but vote buttons won't work until signed in

### 3.3 Create a Test User

1. Click **"Sign In / Sign Up"**
2. Click **"Sign Up"** (or toggle to Sign Up mode)
3. Enter:
   - **Email**: `test@example.com` (or your real email)
   - **Password**: `password123` (or a secure password)
   - **Name**: (optional)
4. Click **"Create Account"**

You should see:
- ✅ "Account created! Logging you in..." message
- Modal closes
- 🟢 **Green banner** showing "Signed in as test@example.com"
- **"Ready to vote!"** message

### 3.4 Test Voting

1. Click **"Vote"** on any artwork
2. You should see: "Vote recorded — thank you!"
3. Try voting again on the same artwork
4. You should see: "You have already voted for this artwork in this contest"

### 3.5 Test Sign Out

1. Click **"Sign Out"** button
2. You should be signed out
3. Blue "Sign in to vote" banner appears again
4. Try clicking a vote button
5. The auth modal should appear

---

## Step 4: Configure Supabase Auth (Optional but Recommended)

### 4.1 Email Confirmation

By default, Supabase auto-confirms users. To require email verification:

1. Supabase Dashboard → **Authentication** → **Settings**
2. Scroll to **Email Settings**
3. Toggle **"Enable email confirmations"**
4. Save changes

Now users must verify their email before voting.

### 4.2 Email Templates

Customize the email templates:

1. Supabase Dashboard → **Authentication** → **Email Templates**
2. Customize:
   - **Confirm signup** - Welcome message
   - **Reset password** - Password reset email
3. Add your branding and messaging

### 4.3 Rate Limiting

Protect against spam registrations:

1. Supabase Dashboard → **Authentication** → **Settings**
2. Scroll to **Rate Limiting**
3. Recommended settings:
   - **Email signups per hour**: 10
   - **SMS signups per hour**: 5

---

## Step 5: Test in Production

### Before Deploying

1. ✅ Run database migration on production Supabase
2. ✅ Update environment variables on Vercel/hosting platform
3. ✅ Test the flow in staging first

### Environment Variables Required

Make sure these are set:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## How It Works

### User Registration Flow

1. User clicks "Sign In / Sign Up"
2. Modal appears with login/signup form
3. User enters email + password
4. API calls `/api/auth/register`
5. Supabase Auth creates user
6. User is added to `public_users` table
7. User is auto-logged in
8. Modal closes, user can vote

### Voting Flow

1. User clicks "Vote" button
2. Frontend checks if user is authenticated
3. If not: Show auth modal
4. If yes: Send vote request to `/api/vote`
5. API checks if user is authenticated via Supabase session
6. API calls `can_vote(user_id, artwork_id, contest_id)`
7. If allowed: Insert vote with `user_id`
8. Artwork `vote_count` is updated via database trigger
9. Frontend shows success message

### Vote Validation

**Database enforces:**
- One vote per user per artwork per contest
- User must exist in auth.users
- Unique constraint on (user_id, artwork_id, contest_id)

**API enforces:**
- User must be authenticated (valid session)
- Contest must be active
- Contest must not be ended

---

## Troubleshooting

### Error: "You must be logged in to vote"

**Cause:** User session expired or user isn't authenticated.

**Solution:**
1. Sign in again
2. Check cookies aren't being blocked
3. Verify Supabase URL and keys are correct

### Error: "Failed to register user"

**Cause:** Email already exists or validation failed.

**Solution:**
1. Try a different email
2. Or use "Sign In" instead of "Sign Up"
3. Check password is at least 6 characters

### Error: "insert or update on table violates foreign key constraint"

**Cause:** User exists in Supabase Auth but not in `public_users` table.

**Solution:**
```sql
-- Add missing user to public_users
INSERT INTO public_users (id, email)
SELECT id, email FROM auth.users
WHERE id = 'USER_ID_HERE';
```

### Vote doesn't save

**Cause:** Database migration not run or function has wrong signature.

**Solution:**
1. Re-run migration SQL
2. Verify `can_vote` function exists:
```sql
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_name = 'can_vote';
```

### Modal doesn't appear

**Cause:** Component import error or missing dependency.

**Solution:**
1. Check browser console for errors
2. Verify `@supabase/ssr` is installed:
```bash
npm install @supabase/ssr
```
3. Restart dev server

---

## FAQ

### Can users vote without registering?

No. With this system, all voters must register with their email.

### Can I still track IP addresses?

Yes. IP hashes are still stored in the `votes` table for analytics, but they're not used for vote validation.

### What if a user forgets their password?

They can use the "Forgot password?" link in the login modal (you'll need to implement this page at `/forgot-password`).

### Can users change their vote?

No. The current system allows one vote per artwork per contest. To allow vote changes, you'd need to:
1. Delete existing vote
2. Insert new vote
3. Update frontend to show "Change Vote" instead of "Vote"

### How do I export voters' emails?

```sql
SELECT email, created_at
FROM public_users
ORDER BY created_at DESC;
```

---

## Next Steps

### Add More Features

1. **User Profile Page**
   - Let users view their voting history
   - Update their name/email

2. **Email Notifications**
   - Notify when contest ends
   - Notify when they win

3. **Social Login**
   - Google OAuth
   - GitHub OAuth
   - Already configured in Supabase!

4. **Forgot Password Flow**
   - Create `/forgot-password` page
   - Use Supabase password reset

5. **Admin Analytics**
   - Show voter demographics
   - Export voter emails for newsletters

---

## Summary

You now have email-based voting! 🎉

**Users must:**
- ✅ Register with email and password
- ✅ Sign in to vote
- ✅ Can only vote once per artwork per contest

**Benefits:**
- More accurate vote tracking
- Build a user community
- No VPN bypasses
- Better data for analytics

**Next:** Set up your admin account and create your first contest!

See: [QUICK-ADMIN-SETUP.md](QUICK-ADMIN-SETUP.md) and [CONTEST-SETUP-INSTRUCTIONS.md](CONTEST-SETUP-INSTRUCTIONS.md)
