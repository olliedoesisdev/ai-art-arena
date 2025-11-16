# Quick Admin Setup Guide

Get your admin account working in 5 minutes!

## Prerequisites

- Supabase project is set up and connected
- Admin schema has been run (if not, see below)

## Step 1: Run Admin Schema (If Not Done Already)

1. Open Supabase Dashboard → SQL Editor
2. Copy all contents from [supabase-admin-schema.sql](supabase-admin-schema.sql)
3. Paste and click **Run**
4. Wait for "Success" message

## Step 2: Create Your Auth User

Choose **ONE** of these methods:

### Method A: Via Supabase Dashboard (Easiest)

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter:
   - **Email**: `olliedoesis.dev@gmail.com`
   - **Password**: Choose a strong password (save it!)
   - **Auto Confirm User**: ✅ Enable this
4. Click **Create user**
5. **Copy the User ID** (UUID) - you'll need it in Step 3

### Method B: Via Your App Signup

1. Go to `http://localhost:3000/admin/signup`
2. Enter:
   - **Email**: `olliedoesis.dev@gmail.com`
   - **Password**: Choose a strong password (save it!)
3. Click **Sign Up**
4. Go back to Supabase Dashboard → Authentication → Users
5. Find your email and **copy the User ID** (UUID)

## Step 3: Add User to Admin Table

1. Open Supabase Dashboard → **SQL Editor**
2. Run this query to check if your user exists:

```sql
SELECT id, email FROM auth.users WHERE email = 'olliedoesis.dev@gmail.com';
```

3. **Copy the UUID** from the result
4. Run this query (replace `YOUR_USER_ID_HERE` with your actual UUID):

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

For example:
```sql
INSERT INTO admin_users (id, email, name, role, is_active)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'olliedoesis.dev@gmail.com',
  'Oliver White',
  'admin',
  true
);
```

## Step 4: Verify Setup

Run this verification query:

```sql
SELECT
  au.email,
  au.role,
  au.is_active,
  u.email as auth_email
FROM admin_users au
JOIN auth.users u ON u.id = au.id
WHERE au.email = 'olliedoesis.dev@gmail.com';
```

You should see:
- ✅ Your email
- ✅ role: `admin`
- ✅ is_active: `true`

## Step 5: Login to Admin Panel

1. Go to `http://localhost:3000/admin/login`
2. Enter:
   - **Email**: `olliedoesis.dev@gmail.com`
   - **Password**: The password you set in Step 2
3. Click **Sign In**
4. You should be redirected to the admin dashboard! 🎉

## Troubleshooting

### Error: "You do not have admin access"

**Solution**: Your user exists in auth but not in admin_users. Complete Step 3.

### Error: "Invalid login credentials"

**Solution**: Wrong password. Try resetting it:
1. Go to `http://localhost:3000/admin/forgot-password`
2. Enter your email
3. Check your email for reset link

### Error: "duplicate key value violates unique constraint"

**Solution**: User already exists in admin_users. Check with:
```sql
SELECT * FROM admin_users WHERE email = 'olliedoesis.dev@gmail.com';
```

If `is_active` is false, activate it:
```sql
UPDATE admin_users
SET is_active = true
WHERE email = 'olliedoesis.dev@gmail.com';
```

### Error: "insert or update on table violates foreign key constraint"

**Solution**: Auth user doesn't exist yet. Complete Step 2 first.

## What You Can Do as Admin

Once logged in, you have full access to:

- ✅ **Dashboard**: Overview of contests, artworks, and votes
- ✅ **Contests**: Create, edit, delete contests
- ✅ **Artworks**: Add, edit, delete artworks
- ✅ **Analytics**: View voting statistics
- ✅ **Admin Users**: Manage other admin accounts
- ✅ **Audit Logs**: See all admin actions

## Need More Help?

See the detailed guide: [ADMIN-SETUP-GUIDE.md](ADMIN-SETUP-GUIDE.md)

## Quick Reference

- **Admin Login**: `http://localhost:3000/admin/login`
- **Admin Dashboard**: `http://localhost:3000/admin`
- **Your Email**: `olliedoesis.dev@gmail.com`
- **Your Role**: `admin` (full access)

## Next Steps

After logging in:
1. Create an active contest (see [CONTEST-SETUP-INSTRUCTIONS.md](CONTEST-SETUP-INSTRUCTIONS.md))
2. Add artworks to your contest
3. Test the voting functionality on the public site
4. Check analytics to see voting data

Happy managing! 🎨
