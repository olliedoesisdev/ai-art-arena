# Password Reset Setup Guide

## Your Reset Link Format

Your reset link is correctly formatted:
```
http://localhost:3000/admin/reset-password?code=49914298-7c17-4e81-92cf-301c41e2de4f
```

This is perfect! ✅

## Supabase Configuration Required

To make password reset work properly, you need to configure the redirect URLs in Supabase:

### Step 1: Configure Redirect URLs in Supabase

1. **Go to Supabase Dashboard**
   - Navigate to: Authentication → URL Configuration

2. **Add Redirect URLs**

   For **Development** (localhost):
   ```
   http://localhost:3000/admin/reset-password
   ```

   For **Production** (when deployed):
   ```
   https://your-domain.com/admin/reset-password
   ```

3. **Site URL** should be:
   - Dev: `http://localhost:3000`
   - Prod: `https://your-domain.com`

### Step 2: Verify Email Template (Optional)

The default Supabase password reset email should work, but you can customize it:

1. **Go to**: Authentication → Email Templates
2. **Select**: "Reset Password" template
3. **Verify the link** contains: `{{ .ConfirmationURL }}`

Default template:
```html
<h2>Reset Password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

## How It Works

### The Flow:

1. **User requests reset** → `/admin/forgot-password`
2. **Enter email** → Supabase sends email with link
3. **Click link in email** → `http://localhost:3000/admin/reset-password?code=xxx`
4. **Supabase exchanges code** → Creates temporary session
5. **User enters new password** → Password updated via `updateUser()`
6. **Redirect to login** → User signs in with new password

### URL Parameters Explained:

- `?code=xxx` - One-time token from Supabase
- The code is exchanged for a temporary session
- This session allows the user to update their password
- The code expires after 1 hour

## Testing

### Test the Complete Flow:

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Go to forgot password page**:
   ```
   http://localhost:3000/admin/forgot-password
   ```

3. **Enter your email** (must be a registered user)

4. **Check your email** for the reset link

5. **Click the link** - Should look like:
   ```
   http://localhost:3000/admin/reset-password?code=xxx
   ```

6. **Enter new password** (minimum 8 characters)

7. **Confirm password** and submit

8. **Sign in** with new password at `/admin/login`

## Troubleshooting

### "Invalid or expired reset link" Error

**Cause**: Redirect URL not configured in Supabase

**Solution**:
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add `http://localhost:3000/admin/reset-password` to Redirect URLs
3. Click Save
4. Try requesting a new reset link

### Email Not Received

**Check**:
- Spam/junk folder
- Email is correct and user exists
- Supabase email settings are configured

**Verify in Supabase**:
1. Go to Authentication → Users
2. Find your user
3. Check email is confirmed
4. Check Auth logs for errors

### Reset Works but Can't Sign In

**Check**:
1. Make sure you're an admin user:
   ```sql
   SELECT * FROM admin_users WHERE email = 'your-email@example.com';
   ```

2. If not in admin_users, add yourself:
   ```sql
   INSERT INTO admin_users (id, email, name, role, is_active)
   VALUES (
     (SELECT id FROM auth.users WHERE email = 'your-email@example.com'),
     'your-email@example.com',
     'Your Name',
     'admin',
     true
   );
   ```

### Code Already Used Error

**Cause**: Reset code can only be used once

**Solution**: Request a new password reset link

### Link Expired

**Cause**: Reset links expire after 1 hour

**Solution**: Request a new password reset link

## Production Setup

When deploying to production:

1. **Update Redirect URLs** in Supabase:
   ```
   https://your-production-domain.com/admin/reset-password
   ```

2. **Update Site URL**:
   ```
   https://your-production-domain.com
   ```

3. **Test the flow** in production before going live

4. **Consider custom email** domain for better deliverability

## Security Notes

✅ **Reset links expire** after 1 hour
✅ **One-time use** - code can't be reused
✅ **Temporary session** - only allows password update
✅ **Password validation** - minimum 8 characters
✅ **Email verification** - link only sent to verified emails

## Files

- **Forgot Password Page**: `src/app/admin/forgot-password/page.tsx`
- **Reset Password Page**: `src/app/admin/reset-password/page.tsx`
- **Login Page** (with "Forgot password?" link): `src/app/admin/login/page.tsx`

## Environment Variables

No additional environment variables needed! Uses existing:
```env
NEXT_PUBLIC_SUPABASE_URL=https://qolctvveygnhxbjxzzkb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Quick Reference

### User Forgets Password:
1. `/admin/login` → Click "Forgot password?"
2. `/admin/forgot-password` → Enter email
3. Check email → Click reset link
4. `/admin/reset-password?code=xxx` → Enter new password
5. `/admin/login` → Sign in with new password

### Admin Helping User:
Can't manually reset passwords (security feature). User must use "Forgot Password" flow, or you can:
1. Delete user from `auth.users` (if necessary)
2. Have them sign up again
3. Add to `admin_users` table manually
