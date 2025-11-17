# Authentication Setup Guide

## Overview

The AI Art Arena now uses **passwordless email authentication** with magic links. Users only need an email address to sign up and vote - no passwords required!

## Features

✅ **Email-only signup** - No password needed
✅ **Magic link login** - Secure one-time links sent via email
✅ **No email verification required** - Users can vote immediately after clicking the magic link
✅ **Resend functionality** - Users can request a new magic link if needed

## How It Works

### For Users

1. **Signup Flow:**
   - User enters their email (and optional name)
   - Clicks "Create Account & Send Link"
   - Receives a magic link via email
   - Clicks the link and is automatically logged in
   - Can immediately start voting

2. **Login Flow:**
   - User enters their email
   - Clicks "Send Magic Link"
   - Receives a magic link via email
   - Clicks the link and is logged in

3. **Resend Email:**
   - If the user doesn't receive the email, they can click "Resend Email"
   - A new magic link will be sent

## Supabase Configuration Required

To enable passwordless authentication, you need to configure your Supabase project:

### 1. Disable Email Confirmation

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to **Authentication** → **Settings**
3. Find **Email Confirmation** settings
4. **Disable** "Enable email confirmations"
5. Save changes

### 2. Configure Email Templates (Optional)

You can customize the magic link email template:

1. Go to **Authentication** → **Email Templates**
2. Select **Magic Link** template
3. Customize the email content as desired
4. Make sure the magic link button/URL is present: `{{ .ConfirmationURL }}`

### 3. Set Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add these **Redirect URLs**:
   - `http://localhost:3000/auth/callback` (for local development)
   - `https://olliedoesis.dev/auth/callback` (for production)
   - `https://*.vercel.app/auth/callback` (for Vercel preview deployments)

### 4. Configure Site URL

1. In **Authentication** → **URL Configuration**
2. Set **Site URL** to:
   - Development: `http://localhost:3000`
   - Production: `https://olliedoesis.dev`

## Environment Setup

### Local Development (.env.local)

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://qolctvveygnhxbjxzzkb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Production (.env.production or Vercel Environment Variables)

```env
NEXT_PUBLIC_SITE_URL=https://olliedoesis.dev
NEXT_PUBLIC_SUPABASE_URL=https://qolctvveygnhxbjxzzkb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Vercel Deployment Setup

### 1. Environment Variables

In your Vercel dashboard:

1. Go to your project → **Settings** → **Environment Variables**
2. Add the following variables for **Production**:
   - `NEXT_PUBLIC_SITE_URL` = `https://olliedoesis.dev`
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://qolctvveygnhxbjxzzkb.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `[your anon key]`
   - `SUPABASE_SERVICE_ROLE_KEY` = `[your service role key]`
   - All other secrets (NEXTAUTH_SECRET, GITHUB_ID, GITHUB_SECRET, CRON_SECRET, IP_SALT)

### 2. Domain Configuration

1. Go to your project → **Settings** → **Domains**
2. Add your custom domain: `olliedoesis.dev`
3. Configure DNS records as instructed by Vercel

### 3. Preview Deployments

Preview deployments automatically use Vercel's auto-generated URLs like:
- `https://ai-art-arena-[hash].vercel.app`

These work automatically with the environment detection in the code.

## Technical Implementation

### Files Modified/Created

1. **[VoterAuthModal.tsx](src/components/auth/VoterAuthModal.tsx)** - Removed password field, added magic link flow
2. **[register API](src/app/api/auth/register/route.ts)** - Updated to send magic links instead of creating password accounts
3. **[login API](src/app/api/auth/login/route.ts)** - Updated to send magic links
4. **[auth/callback route](src/app/auth/callback/route.ts)** - New route to handle magic link redirects
5. **[env.ts](src/lib/env.ts)** - Environment detection utility
6. **[next.config.ts](next.config.ts)** - Updated environment variable handling
7. **[.env.production](.env.production)** - Production environment configuration

### Environment Detection

The app automatically detects the environment and uses the correct URLs:

```typescript
import { getBaseUrl, getFullUrl } from '@/lib/env';

// In browser: uses window.location.origin
// In server (dev): uses http://localhost:3000
// In server (prod): uses https://olliedoesis.dev
const baseUrl = getBaseUrl();

// Get full URL for auth callback
const callbackUrl = getFullUrl('/auth/callback');
```

## Testing

### Local Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. Try signing up with a test email

4. Check your email for the magic link

5. Click the link - you should be redirected back to the app and logged in

### Production Testing

1. Deploy to Vercel

2. Visit https://olliedoesis.dev

3. Test the signup/login flow with a real email

## Troubleshooting

### Magic link not working

- Check Supabase redirect URLs are configured correctly
- Verify email confirmation is disabled in Supabase
- Check browser console for errors

### Email not received

- Check spam folder
- Verify Supabase email settings
- Use the "Resend Email" button

### Wrong redirect URL

- Check `NEXT_PUBLIC_SITE_URL` environment variable
- Verify Supabase allowed redirect URLs
- Clear browser cache

## Security Notes

- Magic links expire after a certain time (configurable in Supabase)
- Each magic link can only be used once
- Users should keep their email secure
- Consider adding rate limiting for magic link requests in production
