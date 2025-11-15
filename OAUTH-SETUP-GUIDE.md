# OAuth Setup Guide (GitHub & Google)

This guide explains how to set up GitHub and Google OAuth authentication for the AI Art Arena admin portal.

## Overview

Users can now sign up and sign in using:
- ✅ GitHub
- ✅ Google
- ✅ Email/Password (existing)

The first user to sign up (via any method) automatically becomes an admin.

## Prerequisites

- Supabase project set up
- Admin schema and auto-first-admin migration already run
- Access to GitHub and Google Developer consoles

---

## Part 1: GitHub OAuth Setup

### Step 1: Create GitHub OAuth App

1. **Go to GitHub Settings**:
   - Visit: https://github.com/settings/developers
   - Click "OAuth Apps" in the left sidebar
   - Click "New OAuth App"

2. **Fill in Application Details**:
   ```
   Application name: AI Art Arena Admin
   Homepage URL: http://localhost:3000 (for local dev)
                 https://your-domain.com (for production)
   Authorization callback URL: https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
   ```

   **Important**: Replace `YOUR_SUPABASE_PROJECT_REF` with your actual Supabase project reference.
   - Find it in Supabase Dashboard → Settings → API
   - It looks like: `abcdefghijklmnop`

3. **Get Credentials**:
   - After creating the app, you'll see:
     - **Client ID** (e.g., `Iv1.a1b2c3d4e5f6g7h8`)
     - **Client Secret** (click "Generate a new client secret")
   - **Save these** - you'll need them in the next step

### Step 2: Configure GitHub in Supabase

1. **Go to Supabase Dashboard**:
   - Navigate to: Authentication → Providers
   - Find "GitHub" in the list

2. **Enable and Configure**:
   - Toggle "GitHub" to **Enabled**
   - Enter your **Client ID**
   - Enter your **Client Secret**
   - Click "Save"

### Step 3: Update GitHub OAuth App for Production

When deploying to production, update the GitHub OAuth app:

1. Go back to https://github.com/settings/developers
2. Edit your OAuth app
3. Update:
   ```
   Homepage URL: https://your-production-domain.com
   Authorization callback URL: https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
   ```

**Note**: You may want to create separate OAuth apps for development and production.

---

## Part 2: Google OAuth Setup

### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project**:
   - Click the project dropdown at the top
   - Click "New Project"
   - Name: "AI Art Arena" (or your preferred name)
   - Click "Create"
   - Wait for the project to be created and select it

### Step 2: Enable Google+ API

1. **Enable the API**:
   - In the sidebar, go to: APIs & Services → Library
   - Search for "Google+ API"
   - Click on it and click "Enable"

### Step 3: Configure OAuth Consent Screen

1. **Go to OAuth consent screen**:
   - Sidebar: APIs & Services → OAuth consent screen

2. **Choose User Type**:
   - Select "External" (unless you have Google Workspace)
   - Click "Create"

3. **Fill in App Information**:
   ```
   App name: AI Art Arena Admin
   User support email: your-email@example.com
   Developer contact email: your-email@example.com
   ```

4. **Scopes**:
   - Click "Add or Remove Scopes"
   - Add these scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Click "Save and Continue"

5. **Test Users** (for development):
   - Add your email and any other test users
   - Click "Save and Continue"

6. **Review and Submit**:
   - Review your settings
   - Click "Back to Dashboard"

### Step 4: Create OAuth Credentials

1. **Go to Credentials**:
   - Sidebar: APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth client ID"

2. **Configure OAuth Client**:
   - Application type: **Web application**
   - Name: "AI Art Arena Admin"

3. **Add Authorized Redirect URIs**:
   ```
   https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
   ```

   **Important**: Replace `YOUR_SUPABASE_PROJECT_REF` with your actual Supabase project reference.

4. **Create**:
   - Click "Create"
   - You'll see a dialog with:
     - **Client ID** (e.g., `123456789-abc123.apps.googleusercontent.com`)
     - **Client Secret** (e.g., `GOCSPX-abc123def456`)
   - **Save these credentials**

### Step 5: Configure Google in Supabase

1. **Go to Supabase Dashboard**:
   - Navigate to: Authentication → Providers
   - Find "Google" in the list

2. **Enable and Configure**:
   - Toggle "Google" to **Enabled**
   - Enter your **Client ID**
   - Enter your **Client Secret**
   - Click "Save"

### Step 6: Production Setup

For production:

1. **Update Authorized Redirect URIs** in Google Cloud Console:
   - Add your production callback URL
   - Keep the Supabase callback URL

2. **Publish OAuth Consent Screen**:
   - Go to OAuth consent screen
   - Click "Publish App"
   - This removes the "app is in testing" warning

---

## Part 3: Test OAuth Integration

### Test GitHub Login

1. Navigate to: `http://localhost:3000/admin/login`
2. Click "Continue with GitHub"
3. Authorize the app
4. You should be redirected to `/admin`
5. Check database:
   ```sql
   SELECT * FROM auth.users WHERE email = 'your-github-email@example.com';
   SELECT * FROM admin_users WHERE email = 'your-github-email@example.com';
   ```

### Test Google Login

1. Navigate to: `http://localhost:3000/admin/signup`
2. Click "Continue with Google"
3. Choose your Google account
4. You should be redirected to `/admin`
5. Check database (same queries as above)

### Test First User Auto-Admin

1. **Clear all users** (only in dev environment):
   ```sql
   -- WARNING: Only run in development!
   TRUNCATE admin_users CASCADE;
   DELETE FROM auth.users;
   ```

2. **Sign up with GitHub or Google**
3. Check that you were made admin:
   ```sql
   SELECT email, role FROM admin_users;
   -- Should show your email with role = 'admin'
   ```

---

## Part 4: Environment Variables

No additional environment variables needed! OAuth works with your existing Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Troubleshooting

### GitHub Issues

**Error: "Redirect URI mismatch"**
- Check that your callback URL exactly matches: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- No trailing slashes
- Must be HTTPS (except for localhost)

**Error: "Application suspended"**
- Your GitHub OAuth app may have been suspended
- Check your GitHub email for notifications
- Contact GitHub support if needed

### Google Issues

**Error: "redirect_uri_mismatch"**
- Go to Google Cloud Console → Credentials
- Edit your OAuth client
- Ensure the Supabase callback URL is in "Authorized redirect URIs"
- Wait a few minutes for changes to propagate

**Error: "Access blocked: This app's request is invalid"**
- Make sure you've enabled the Google+ API
- Check that your OAuth consent screen is configured
- Verify you're using a test user (if app is in testing mode)

**"This app isn't verified" warning**
- Normal for apps in testing mode
- Click "Advanced" → "Go to AI Art Arena Admin (unsafe)" to proceed
- Publish your app to remove this warning (production only)

### General OAuth Issues

**User created but no admin access**
- Check if they're in `admin_users`:
  ```sql
  SELECT * FROM admin_users WHERE email = 'user@example.com';
  ```
- If not, check if trigger is working:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created_auto_admin';
  ```
- Manually add them:
  ```sql
  INSERT INTO admin_users (id, email, name, role, is_active)
  VALUES (
    (SELECT id FROM auth.users WHERE email = 'user@example.com'),
    'user@example.com',
    'User Name',
    'editor',
    true
  );
  ```

**OAuth works but redirect fails**
- Check your redirect URL in Supabase: Authentication → URL Configuration
- Site URL should be: `http://localhost:3000` (dev) or `https://your-domain.com` (prod)
- Redirect URLs should include: `http://localhost:3000/**` (dev)

**Can't extract user name from OAuth**
- The trigger tries multiple metadata fields: `name`, `full_name`, `user_name`
- Falls back to email prefix if none found
- You can manually update:
  ```sql
  UPDATE admin_users SET name = 'Correct Name' WHERE email = 'user@example.com';
  ```

---

## Security Best Practices

### Development vs Production

1. **Use separate OAuth apps** for dev and production
2. **Never commit OAuth secrets** to git
3. **Restrict OAuth callback URLs** to your domains only
4. **Use environment-specific redirect URLs**

### OAuth Scopes

The current implementation requests minimal scopes:
- **GitHub**: `user:email` (email address and public profile)
- **Google**: `userinfo.email`, `userinfo.profile`

### User Data

OAuth providers return:
```javascript
{
  id: "user-uuid",
  email: "user@example.com",
  raw_user_meta_data: {
    name: "John Doe",           // From Google
    full_name: "John Doe",      // From GitHub
    avatar_url: "https://...",  // Profile picture
    provider: "github"          // or "google"
  }
}
```

---

## Production Deployment Checklist

- [ ] Create production GitHub OAuth app with production callback URL
- [ ] Create production Google OAuth client with production callback URL
- [ ] Configure OAuth providers in Supabase with production credentials
- [ ] Publish Google OAuth consent screen (removes "testing" warning)
- [ ] Update Supabase Site URL to production domain
- [ ] Add production domain to Redirect URLs in Supabase
- [ ] Test OAuth flows in production
- [ ] Verify first user becomes admin automatically
- [ ] Test admin access verification after OAuth login
- [ ] Monitor Supabase auth logs for errors

---

## Files Modified

- **Login Page**: `src/app/admin/login/page.tsx` - Added GitHub/Google buttons
- **Signup Page**: `src/app/admin/signup/page.tsx` - Added GitHub/Google buttons
- **Database Trigger**: `auto-first-admin.sql` - Enhanced to handle OAuth metadata

---

## Related Documentation

- [Auto First Admin Setup](./AUTO-FIRST-ADMIN-SETUP.md)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
