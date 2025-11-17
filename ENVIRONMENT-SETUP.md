# Environment Setup Guide

## Quick Start

This guide explains how to configure your Next.js project for different environments.

## Environment Files

### .env.local (Local Development)

Used for local development on `http://localhost:3000`

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# ... other variables
```

**Already configured** ✅

### .env.production (Production Build)

Used for production deployments on `https://olliedoesis.dev`

```env
NEXT_PUBLIC_SITE_URL=https://olliedoesis.dev
# ... other variables
```

**Already created** ✅

## How It Works

### Automatic Environment Detection

The app automatically detects which environment it's running in:

| Environment | URL Used | How It's Detected |
|------------|----------|-------------------|
| Local Dev | `http://localhost:3000` | `NODE_ENV=development` |
| Production | `https://olliedoesis.dev` | `NODE_ENV=production` + Vercel |
| Preview | `https://[app]-[hash].vercel.app` | Vercel preview deployment |

### Using Environment URLs in Code

```typescript
import { getBaseUrl, getFullUrl } from '@/lib/env';

// Get the base URL (automatically detects environment)
const baseUrl = getBaseUrl();
// Local: http://localhost:3000
// Production: https://olliedoesis.dev

// Get a full URL for a specific path
const callbackUrl = getFullUrl('/auth/callback');
// Local: http://localhost:3000/auth/callback
// Production: https://olliedoesis.dev/auth/callback
```

## Vercel Configuration

### Domain Setup

1. **Production Domain**: `olliedoesis.dev`
   - Configure in Vercel dashboard under Settings → Domains
   - Add DNS records as instructed

2. **Preview Deployments**: Automatic
   - Vercel auto-generates URLs like `https://ai-art-arena-abc123.vercel.app`
   - Each PR gets its own preview URL

### Environment Variables in Vercel

Set these in your Vercel dashboard (Settings → Environment Variables):

#### Required for Production

```
NEXT_PUBLIC_SITE_URL=https://olliedoesis.dev
NEXT_PUBLIC_SUPABASE_URL=https://qolctvveygnhxbjxzzkb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your key]
SUPABASE_SERVICE_ROLE_KEY=[your key]
NEXTAUTH_URL=https://olliedoesis.dev
NEXTAUTH_SECRET=[your secret]
GITHUB_ID=[your id]
GITHUB_SECRET=[your secret]
CRON_SECRET=[your secret]
IP_SALT=[your salt]
```

#### Optional for Preview/Development

You can set different values for Preview and Development environments in Vercel.

## Next.js Configuration

### next.config.ts

The config automatically sets the correct URL based on environment:

```typescript
env: {
  NEXT_PUBLIC_SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://olliedoesis.dev"
      : "http://localhost:3000"),
}
```

This ensures:
- ✅ Local development always uses `localhost:3000`
- ✅ Production builds use `olliedoesis.dev`
- ✅ Preview deployments use Vercel's auto-generated URLs

### vercel.json

Current configuration:

```json
{
  "crons": [...],
  "headers": [...],
  "rewrites": [{ "source": "/", "destination": "/contest/active" }]
}
```

**No changes needed** - works with all environments.

## Local Development

### Starting the Server

```bash
npm run dev
```

The server will start on `http://localhost:3000` with hot reload enabled.

### Building Locally

```bash
npm run build
npm start
```

This tests the production build locally (still uses localhost:3000).

## Deployment

### To Vercel Production

```bash
git push origin main
```

Vercel automatically deploys to `https://olliedoesis.dev`

### Preview Deployments

```bash
git push origin feature-branch
```

Or create a Pull Request - Vercel creates a preview deployment automatically.

## Environment-Specific Features

### API Endpoints

All API endpoints automatically use the correct base URL:

```typescript
// In your components
const response = await fetch('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify({ email, redirectUrl: `${window.location.origin}/auth/callback` })
});
```

### Email Redirects (Auth)

Magic link redirects automatically use the correct URL:

```typescript
const redirectUrl = `${window.location.origin}/auth/callback`;
// Local: http://localhost:3000/auth/callback
// Production: https://olliedoesis.dev/auth/callback
```

## Troubleshooting

### Wrong URL being used

**Check:**
1. `NEXT_PUBLIC_SITE_URL` in your `.env.local` or Vercel dashboard
2. `NODE_ENV` is set correctly (`development` or `production`)
3. Clear `.next` cache: `rm -rf .next`

### Environment variables not updating

**Solution:**
1. Restart your development server
2. Clear Next.js cache
3. In Vercel: redeploy after updating environment variables

### Preview deployment issues

**Check:**
1. Environment variables are set for "Preview" environment in Vercel
2. Supabase has `*.vercel.app` in redirect URLs
3. Check Vercel deployment logs

## Environment Utilities Reference

Located in [src/lib/env.ts](src/lib/env.ts):

```typescript
import {
  getEnvironment,    // 'development' | 'production'
  isProduction,      // boolean
  isDevelopment,     // boolean
  isVercel,          // boolean
  getBaseUrl,        // string - base URL for current environment
  getFullUrl,        // (path: string) => string
  getApiUrl,         // string - API base URL
  envConfig          // object with all env info
} from '@/lib/env';
```

## Best Practices

1. ✅ **Never commit `.env.local`** - keep it in `.gitignore`
2. ✅ **Use environment variables for all URLs and secrets**
3. ✅ **Test locally before deploying**
4. ✅ **Use preview deployments for testing features**
5. ✅ **Keep production secrets secure in Vercel dashboard**
6. ✅ **Use the env utilities instead of hardcoding URLs**

## Summary

Your project is now configured to:

- ✅ Run on `localhost:3000` in development
- ✅ Deploy to `https://olliedoesis.dev` in production
- ✅ Support Vercel preview deployments
- ✅ Automatically detect and use the correct environment
- ✅ Handle environment-specific configurations
- ✅ Support passwordless email authentication in all environments
