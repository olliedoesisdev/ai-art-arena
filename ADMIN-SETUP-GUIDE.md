# AI Art Arena - Admin Setup Guide

Complete guide to setting up and using the admin functionality.

## Table of Contents

1. [Overview](#overview)
2. [Database Setup](#database-setup)
3. [Creating Your First Admin User](#creating-your-first-admin-user)
4. [Accessing the Admin Portal](#accessing-the-admin-portal)
5. [Admin Features](#admin-features)
6. [User Roles & Permissions](#user-roles--permissions)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The admin portal allows you to:

- ✅ Create and manage contests without writing SQL
- ✅ Add and edit artworks through a web interface
- ✅ View voting analytics and statistics
- ✅ Manage admin users and roles
- ✅ Track all admin actions through audit logs

**Admin URL:** `http://localhost:3000/admin` (or your production domain)

---

## Database Setup

### Step 1: Run the Admin Schema

1. Open your Supabase dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase-admin-schema.sql`
4. Copy the entire contents
5. Paste into the Supabase SQL Editor
6. Click **Run** to execute the script

This will create:
- `admin_users` table with role-based access control
- `audit_logs` table for tracking admin actions
- Row Level Security (RLS) policies
- Helper functions for permission checks

### Step 2: Verify the Setup

Run these queries in the SQL Editor to verify:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('admin_users', 'audit_logs');

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('admin_users', 'audit_logs');
```

---

## Creating Your First Admin User

### Method 1: Sign Up Through the App (Recommended)

1. Go to `http://localhost:3000/admin/login`
2. Since you can't log in yet, you'll need to create your Supabase user first
3. Open Supabase Dashboard > **Authentication** > **Users**
4. Click **Add User** > **Create new user**
5. Enter your email and password
6. Click **Create user**
7. Copy the User ID (UUID) from the users table

### Method 2: Use Supabase Auth API

Or create a user programmatically:

```javascript
// In your browser console at localhost:3000
const { data, error } = await supabase.auth.signUp({
  email: 'your-email@example.com',
  password: 'your-secure-password'
});
console.log('User ID:', data.user?.id);
```

### Step 3: Add User to Admin Table

Once you have your User ID, run this SQL in Supabase:

```sql
INSERT INTO admin_users (id, email, name, role)
VALUES (
  'YOUR_USER_ID_HERE',  -- Replace with your actual user ID
  'your-email@example.com',
  'Your Name',
  'admin'  -- Can be: 'admin', 'moderator', or 'editor'
);
```

Example:

```sql
INSERT INTO admin_users (id, email, name, role)
VALUES (
  '8f7e6d5c-4b3a-2198-7654-321098fedcba',
  'admin@aiartarena.com',
  'John Doe',
  'admin'
);
```

### Step 4: Verify Your Admin User

```sql
SELECT * FROM admin_users WHERE email = 'your-email@example.com';
```

---

## Accessing the Admin Portal

1. Navigate to: `http://localhost:3000/admin/login`
2. Enter your email and password
3. Click **Sign In**
4. You'll be redirected to the admin dashboard

### If Login Fails

Common issues:
- ❌ **"You do not have admin access"** - Your user isn't in the `admin_users` table
- ❌ **"Invalid login credentials"** - Wrong email/password
- ❌ **Page redirects to login** - Session expired, try logging in again

---

## Admin Features

### 1. Dashboard (`/admin`)

**Overview of your platform:**
- Total contests, artworks, votes
- Active contest count
- Recent contests list
- Quick action buttons

### 2. Contest Management (`/admin/contests`)

**Create contests without SQL:**
- Click **New Contest**
- Fill in the form:
  - Title (e.g., "AI Art Weekly Challenge")
  - Week number and year
  - Start and end dates
  - Status (draft, active, ended, archived)
- Click **Create Contest**

**Edit existing contests:**
- Click the edit icon (✏️) next to any contest
- Update fields
- Click **Update Contest**

**Delete contests:**
- Click the delete icon (🗑️)
- Confirm deletion
- **Note:** Only admins can delete

### 3. Artwork Management (`/admin/artworks`)

**Add artworks to contests:**
- Click **New Artwork**
- Select a contest from the dropdown
- Enter artwork details:
  - Title and artist name
  - Image URL (external link)
  - Description (optional)
  - AI prompt used (optional)
  - Style (optional)
  - Display position (0 = first)
- Click **Create Artwork**

**Edit artworks:**
- Click **Edit** on any artwork card
- Update fields
- Save changes

**Delete artworks:**
- Click the trash icon
- Confirm deletion

### 4. Analytics (`/admin/analytics`)

**View voting statistics:**
- Total votes across all contests
- Unique voter count (based on IP)
- Votes in the last 7 days
- Top 10 artworks by vote count
- Recent voting activity table

### 5. Admin Users (`/admin/users`)

**Manage admin access (Admin role only):**
- View all admin users
- Add new admins
- Change user roles
- Deactivate users

### 6. Audit Logs (`/admin/audit-logs`)

**Track all admin actions:**
- Who created/updated/deleted what
- Timestamp of each action
- IP address and user agent
- Changes made (JSON format)

---

## User Roles & Permissions

### Admin

**Full access to everything:**
- ✅ Create, edit, delete contests
- ✅ Create, edit, delete artworks
- ✅ View analytics
- ✅ Manage admin users
- ✅ View audit logs
- ✅ Delete any resource

### Moderator

**Manage content, no user management:**
- ✅ Create, edit contests
- ✅ Create, edit artworks
- ✅ View analytics
- ✅ View audit logs
- ❌ Cannot delete contests/artworks
- ❌ Cannot manage admin users

### Editor

**Content editing only:**
- ✅ Create, edit artworks
- ❌ Cannot manage contests
- ❌ Cannot view analytics
- ❌ Cannot manage users
- ❌ Cannot delete anything

### Changing User Roles

Only admins can change roles:

```sql
UPDATE admin_users
SET role = 'moderator'  -- or 'admin' or 'editor'
WHERE email = 'user@example.com';
```

Or use the Admin Users page (coming soon).

---

## Troubleshooting

### "Failed to parse URL from undefined/api/contests/active"

**Problem:** `NEXT_PUBLIC_SITE_URL` environment variable is missing.

**Solution:**
1. Check you have `.env.local` (not `env.local`)
2. Ensure it contains:
   ```
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
3. Restart your dev server

### "Unauthorized: Admin access required"

**Problem:** You're not authenticated or not in the admin_users table.

**Solution:**
1. Check you're logged in at `/admin/login`
2. Verify your user exists in `admin_users`:
   ```sql
   SELECT * FROM admin_users WHERE is_active = true;
   ```
3. Clear cookies and log in again

### RLS Policy Errors

**Problem:** "Row level security policy violation"

**Solution:**
1. Ensure RLS policies were created correctly
2. Re-run the admin schema SQL
3. Check your user role:
   ```sql
   SELECT * FROM admin_users WHERE id = auth.uid();
   ```

### Can't Delete Contests/Artworks

**Problem:** Only admins have delete permission.

**Solution:**
- Check your role: `SELECT role FROM admin_users WHERE id = auth.uid();`
- Only users with role = 'admin' can delete
- Moderators and editors cannot delete

### Images Not Displaying

**Problem:** Invalid or broken image URLs.

**Solution:**
1. Use publicly accessible image URLs
2. Consider using Supabase Storage:
   - Upload images to Supabase Storage
   - Get public URL
   - Use that URL in the artwork form

---

## Next Steps

### Optional: Add More Admins

```sql
-- First, create user in Supabase Auth (Dashboard > Authentication > Users)
-- Then add to admin_users table:
INSERT INTO admin_users (id, email, name, role)
VALUES (
  'NEW_USER_ID_FROM_AUTH',
  'newadmin@example.com',
  'New Admin Name',
  'moderator'
);
```

### Optional: Enable Email Confirmation

In Supabase Dashboard > **Authentication** > **Settings**:
- Toggle "Enable email confirmations"
- Users will need to verify email before accessing admin

### Optional: Setup Two-Factor Authentication

In Supabase Dashboard > **Authentication** > **Settings**:
- Enable MFA for additional security
- Admins can enable 2FA in their profile settings

---

## Security Best Practices

1. ✅ **Use strong passwords** for admin accounts
2. ✅ **Enable email confirmation** in Supabase Auth settings
3. ✅ **Limit admin access** - Only give admin role to trusted users
4. ✅ **Review audit logs** regularly
5. ✅ **Use environment variables** for secrets
6. ✅ **Enable HTTPS** in production
7. ✅ **Rotate CRON_SECRET** periodically

---

## Support

If you encounter issues:

1. Check the browser console for errors
2. Check Supabase logs (Dashboard > Logs)
3. Verify environment variables are set
4. Ensure database schema was applied correctly
5. Review the admin utility functions in `src/lib/utils/admin-auth.ts`

---

## Summary

You now have a full-featured admin panel with:

- 🔐 Secure authentication with Supabase Auth
- 🎨 Contest and artwork management UI
- 📊 Analytics dashboard
- 👥 Multi-user support with role-based access
- 📝 Audit logging for accountability
- 🚀 No more manual SQL for content management!

**Happy managing! 🎉**