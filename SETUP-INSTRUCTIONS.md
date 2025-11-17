# AI Art Arena - Setup Instructions

This guide will help you fix the admin login and contest issues in your AI Art Arena application.

## Issues Identified

1. **Database Schema Not Applied**: The contest and admin tables need to be created/updated in Supabase
2. **Type Mismatches**: Database types didn't match the actual schema
3. **No Admin User**: You need to create your first admin user

## Setup Steps

### Step 1: Apply Database Schemas

You need to run two SQL scripts in your Supabase SQL Editor:

#### 1.1 Apply Contest Schema

1. Go to your Supabase Dashboard: https://qolctvveygnhxbjxzzkb.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `supabase-schema.sql`
5. Click **Run** (or press Ctrl+Enter)

This will create/update:
- `contests` table with correct status values (draft, active, ended, archived)
- `artworks` table with all required fields
- `votes` table for email-based voting
- All necessary database functions and triggers

#### 1.2 Apply Admin Schema

1. In Supabase SQL Editor, click **New Query** again
2. Copy and paste the entire contents of `supabase-admin-schema.sql`
3. Click **Run**

This will create:
- `admin_users` table
- `audit_logs` table
- Row Level Security (RLS) policies
- Helper functions for admin authentication

### Step 2: Create Your First Admin User

You have two options:

#### Option A: Using the Signup Page (Recommended)

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to: http://localhost:3000/admin/signup

3. Enter your email: `olliedoesis.dev@gmail.com`

4. Create a strong password

5. Click **Sign Up**

6. After signup, you'll be redirected but won't have access yet

7. Go to Supabase Dashboard > SQL Editor and run:
   ```sql
   -- First, get your user ID
   SELECT id, email FROM auth.users WHERE email = 'olliedoesis.dev@gmail.com';
   ```

8. Copy the `id` (UUID) from the result

9. Run this INSERT statement (replace YOUR_USER_ID_HERE with the UUID you copied):
   ```sql
   INSERT INTO admin_users (id, email, name, role, is_active)
   VALUES (
     'YOUR_USER_ID_HERE',
     'olliedoesis.dev@gmail.com',
     'Oliver White',
     'admin',
     true
   );
   ```

#### Option B: Using Supabase Dashboard

1. Go to Supabase Dashboard > **Authentication** > **Users**

2. Click **Add User** > **Create new user**

3. Enter:
   - Email: `olliedoesis.dev@gmail.com`
   - Password: (choose a strong password)
   - Auto Confirm User: ✓ (check this)

4. Click **Create user**

5. Copy the User ID (UUID) that appears

6. Go to **SQL Editor** and run:
   ```sql
   INSERT INTO admin_users (id, email, name, role, is_active)
   VALUES (
     'YOUR_USER_ID_HERE',  -- Replace with the UUID from step 5
     'olliedoesis.dev@gmail.com',
     'Oliver White',
     'admin',
     true
   );
   ```

### Step 3: Verify Setup

#### 3.1 Verify Admin User

Run this query in Supabase SQL Editor:

```sql
SELECT
  au.id,
  au.email,
  au.name,
  au.role,
  au.is_active,
  au.created_at,
  u.email as auth_email
FROM admin_users au
JOIN auth.users u ON u.id = au.id
WHERE au.email = 'olliedoesis.dev@gmail.com';
```

Expected result:
- One row with your user details
- `role` should be 'admin'
- `is_active` should be 'true'
- `auth_email` should match your email

#### 3.2 Verify Contest Schema

Run this query:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'contests'
ORDER BY ordinal_position;
```

You should see these columns:
- id (uuid)
- title (text)
- week_number (integer)
- year (integer)
- start_date (timestamp with time zone)
- end_date (timestamp with time zone)
- status (text)
- winner_artwork_id (uuid)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)

### Step 4: Test Admin Login

1. Go to: http://localhost:3000/admin/login

2. Sign in with:
   - Email: `olliedoesis.dev@gmail.com`
   - Password: (the password you created)

3. You should be redirected to: http://localhost:3000/admin

4. You should see the admin dashboard with navigation for:
   - Dashboard
   - Contests
   - Artworks
   - Analytics
   - Audit Logs

### Step 5: Create Your First Contest

1. In the admin dashboard, click **Contests** in the sidebar

2. Click **Create New Contest**

3. Fill in the form:
   - **Title**: e.g., "Week 1: Cyberpunk Dreams"
   - **Week Number**: 1
   - **Year**: 2025
   - **Start Date**: Choose a start date/time
   - **End Date**: Choose an end date/time (must be after start date)
   - **Status**: Choose "active" to make it live immediately, or "draft" to prepare it first

4. Click **Create Contest**

5. You'll be redirected to the contests list

6. To add artworks to your contest, you can:
   - Use the admin interface (if you've built artwork management)
   - Or manually insert artworks via SQL (see `create-test-contest.sql` for examples)

### Step 6: Test Contest Functionality

1. Go to: http://localhost:3000/contest

2. You should see:
   - The active contest you created
   - Contest timer showing time remaining
   - "No artworks yet" message (if you haven't added any)

3. To test voting:
   - First add some artworks to your contest (via admin or SQL)
   - Users will need to sign in with their email to vote
   - Each user can vote once per contest

## Troubleshooting

### Admin Login Issues

**Error: "You do not have admin access"**
- Run this SQL to activate your admin account:
  ```sql
  UPDATE admin_users
  SET is_active = true
  WHERE email = 'olliedoesis.dev@gmail.com';
  ```

**Error: "Invalid login credentials"**
- Your Supabase auth user credentials are incorrect
- Try resetting your password at http://localhost:3000/admin/forgot-password

**Error: "No active contest found"**
- You haven't created a contest yet, or
- Your contest status is not "active", or
- The current time is not between start_date and end_date

### Contest Issues

**TypeScript errors about contest status**
- Make sure you've updated `src/types/database.ts` with the latest changes
- Restart your development server

**Votes not working**
- Check that users are signed in
- Verify the `can_vote` function exists in your database
- Check browser console for errors

**Contest not showing**
- Verify contest status is "active"
- Verify start_date is in the past
- Verify end_date is in the future
- Check `/api/contests/active` endpoint directly

### Database Issues

**Error: "relation 'contests' does not exist"**
- Run the `supabase-schema.sql` script in Supabase SQL Editor

**Error: "relation 'admin_users' does not exist"**
- Run the `supabase-admin-schema.sql` script in Supabase SQL Editor

**Error: "duplicate key value violates unique constraint"**
- The record already exists
- For admin users, check: `SELECT * FROM admin_users WHERE email = 'olliedoesis.dev@gmail.com';`

## Next Steps

After successful setup:

1. **Add Artworks**: Create artwork entries for your contests
2. **Test Voting**: Sign in with different email addresses to test voting
3. **Configure OAuth**: Set up GitHub and Google OAuth in Supabase Dashboard > Authentication > Providers
4. **Deploy**: Deploy your app to Vercel and update environment variables
5. **Set up Cron Job**: Configure Vercel cron to automatically archive expired contests

## Environment Variables Checklist

Make sure your `.env.local` has all required variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://qolctvveygnhxbjxzzkb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site Config
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret

# OAuth (optional)
GITHUB_ID=your-github-oauth-id
GITHUB_SECRET=your-github-oauth-secret

# Cron & Security
CRON_SECRET=your-cron-secret
IP_SALT=your-ip-salt
```

## Files Modified

The following files have been updated to fix the issues:

1. **supabase-schema.sql** - Fixed contest status values and field names
2. **src/types/database.ts** - Updated TypeScript types to match schema

## Support

If you encounter any issues:

1. Check the browser console for errors
2. Check Supabase logs in Dashboard > Logs
3. Verify all SQL scripts ran successfully
4. Ensure your environment variables are correct
5. Try clearing browser cache and restarting dev server
