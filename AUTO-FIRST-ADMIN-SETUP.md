# Auto First Admin Setup Guide

This guide explains how to set up automatic admin access for the first user to sign up.

## Overview

The auto-first-admin feature automatically grants admin privileges to the very first user who signs up for the AI Art Arena admin portal. This eliminates the need to manually create the first admin user in the database.

## How It Works

1. **Database Trigger**: When a new user signs up via Supabase Auth, a trigger automatically checks if any admin users exist
2. **First User Check**: If no admin users exist (count = 0), the new user is automatically added to the `admin_users` table with the `admin` role
3. **Subsequent Users**: All users after the first one require manual approval by an existing admin

## Installation Steps

### Step 1: Ensure Admin Schema Is Set Up

First, make sure you've already run the admin schema setup:

```bash
# In Supabase SQL Editor, run:
supabase-admin-schema.sql
```

### Step 2: Run Auto First Admin Migration

In your Supabase SQL Editor, run the migration:

```bash
# In Supabase SQL Editor, run:
auto-first-admin.sql
```

This will:
- Create the `auto_create_first_admin()` function
- Add a trigger on the `auth.users` table
- Update RLS policies to allow automatic admin creation

### Step 3: Verify Installation

Check that the trigger was created successfully:

```sql
-- Check the trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created_auto_admin';

-- Check the function exists
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'auto_create_first_admin';
```

### Step 4: Test the Flow

1. **Clear existing admin users** (if testing in a dev environment):
   ```sql
   -- ONLY FOR TESTING - DO NOT RUN IN PRODUCTION IF YOU HAVE REAL ADMINS
   TRUNCATE admin_users CASCADE;
   ```

2. **Navigate to signup page**:
   ```
   http://localhost:3000/admin/signup
   ```

3. **Create first account**:
   - Fill in your details
   - Submit the form
   - You should see: "🎉 Welcome, First Admin!"

4. **Verify email**:
   - Check your email for the verification link
   - Click to verify

5. **Sign in**:
   - Go to `/admin/login`
   - Sign in with your credentials
   - You should have full admin access

6. **Verify in database**:
   ```sql
   SELECT * FROM admin_users;
   -- Should show your user with role = 'admin'
   ```

## What Happens After First User

After the first user signs up and becomes admin:

1. **Subsequent signups** will create accounts in `auth.users` but NOT in `admin_users`
2. **The first admin** must manually grant access to new users via the admin panel
3. **New users** will see a message: "Admin access must be granted by an administrator"

## Granting Access to Additional Users

As an admin, you can grant access to new users:

### Option 1: Via SQL (Manual)

```sql
-- After a user signs up and verifies their email, find their ID:
SELECT id, email FROM auth.users WHERE email = 'newuser@example.com';

-- Add them to admin_users:
INSERT INTO admin_users (id, email, name, role, is_active)
VALUES (
  'USER_ID_FROM_ABOVE',
  'newuser@example.com',
  'New User Name',
  'editor',  -- or 'moderator' or 'admin'
  true
);
```

### Option 2: Via Admin UI (Future Feature)

A user management interface can be built at `/admin/users` to:
- View pending signup requests
- Approve/reject users
- Assign roles
- Deactivate users

## Security Notes

### Why This Is Safe

1. **Only the FIRST user** gets auto-admin access
2. **All subsequent users** require manual approval
3. **The trigger checks** the admin_users count BEFORE creating the record
4. **RLS policies** still protect the admin_users table
5. **The function** uses `SECURITY DEFINER` to bypass RLS only for this specific operation

### Production Recommendations

1. **Sign up the first admin immediately** after deployment
2. **Verify the first admin account** is correct
3. **Monitor the admin_users table** to ensure no unauthorized access
4. **Consider disabling public signup** after the first admin:
   ```sql
   -- Optional: Drop the trigger after first admin is created
   DROP TRIGGER IF EXISTS on_auth_user_created_auto_admin ON auth.users;
   ```

## Troubleshooting

### First User Not Becoming Admin

**Check the trigger:**
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created_auto_admin';
```

**Check for errors in Supabase logs:**
- Go to Supabase Dashboard → Database → Logs
- Look for errors related to `auto_create_first_admin`

**Verify admin_users is empty:**
```sql
SELECT COUNT(*) FROM admin_users;
-- Should be 0 before first signup
```

### User Can't Sign In After Verification

**Check they're in admin_users:**
```sql
SELECT * FROM admin_users WHERE email = 'user@example.com';
```

**Check they're active:**
```sql
SELECT is_active FROM admin_users WHERE email = 'user@example.com';
-- Should be true
```

**Check their email is verified:**
```sql
SELECT email_confirmed_at FROM auth.users WHERE email = 'user@example.com';
-- Should have a timestamp
```

## Files Modified

- **Database Migration**: `auto-first-admin.sql`
- **Signup Page**: `src/app/admin/signup/page.tsx`
- **Login Page**: `src/app/admin/login/page.tsx`

## Related Documentation

- [Admin Setup Guide](./ADMIN-SETUP-GUIDE.md)
- [Supabase Admin Schema](./supabase-admin-schema.sql)
- [Phase 3 Documentation](./PHASE-3-README.md)
