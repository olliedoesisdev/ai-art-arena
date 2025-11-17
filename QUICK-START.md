# Quick Start Guide

## ✅ What's Been Completed

Your AI Art Arena now has:
- ✅ **Passwordless email authentication** - Users only need an email to vote
- ✅ **Magic link login** - No passwords required
- ✅ **No email verification** - Immediate access after clicking the link
- ✅ **Resend email functionality** - Users can request new links
- ✅ **Environment configuration** - localhost:3000 for dev, olliedoesis.dev for production
- ✅ **Auto-environment detection** - Works everywhere automatically

## 🚀 Next Steps

### 1. Configure Supabase (REQUIRED!)

Before this will work, you **MUST** configure Supabase:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Settings**
4. **Disable Email Confirmations:**
   - Find "Enable email confirmations"
   - Toggle it OFF
   - Save changes

5. **Add Redirect URLs:**
   - Go to **Authentication** → **URL Configuration**
   - Add these Redirect URLs:
     ```
     http://localhost:3000/auth/callback
     https://olliedoesis.dev/auth/callback
     https://*.vercel.app/auth/callback
     ```

6. **Set Site URL:**
   - Production: `https://olliedoesis.dev`
   - Or leave as default for now

### 2. Test Locally

```bash
# Start the development server
npm run dev

# Open http://localhost:3000
# Click to vote on an artwork
# Enter your email in the modal
# Check your email for the magic link
# Click the link and verify it works
```

### 3. Configure Vercel (Before Deploying)

1. Go to https://vercel.com/dashboard
2. Select your project (or create it)
3. Go to **Settings** → **Environment Variables**
4. Add these for **Production**:
   ```
   NEXT_PUBLIC_SITE_URL=https://olliedoesis.dev
   NEXT_PUBLIC_SUPABASE_URL=https://qolctvveygnhxbjxzzkb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[copy from .env.local]
   SUPABASE_SERVICE_ROLE_KEY=[copy from .env.local]
   NEXTAUTH_URL=https://olliedoesis.dev
   NEXTAUTH_SECRET=[copy from .env.local]
   GITHUB_ID=[copy from .env.local]
   GITHUB_SECRET=[copy from .env.local]
   CRON_SECRET=[copy from .env.local]
   IP_SALT=[copy from .env.local]
   ```

5. **Set up your domain:**
   - Go to **Settings** → **Domains**
   - Add `olliedoesis.dev`
   - Configure DNS as instructed by Vercel

### 4. Deploy

```bash
git add .
git commit -m "Implement passwordless authentication"
git push origin main
```

Vercel will automatically deploy to https://olliedoesis.dev

## 📁 Important Files

| File | Description |
|------|-------------|
| [AUTH-SETUP.md](AUTH-SETUP.md) | Complete authentication setup guide |
| [ENVIRONMENT-SETUP.md](ENVIRONMENT-SETUP.md) | Environment configuration guide |
| [IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md) | Technical implementation details |
| [.env.local](.env.local) | Local development environment variables |
| [.env.production](.env.production) | Production environment variables |

## 🎯 How Authentication Works Now

1. **User wants to vote** → Click on artwork
2. **Modal appears** → Enter email (no password!)
3. **Magic link sent** → User checks email
4. **Clicks link** → Automatically logged in
5. **Can vote immediately** → No verification wait

## ⚠️ Before You Deploy Checklist

- [ ] Configured Supabase email settings (disabled confirmation)
- [ ] Added redirect URLs in Supabase
- [ ] Tested locally with a real email
- [ ] Magic link works and logs you in
- [ ] Set up Vercel environment variables
- [ ] Configured domain in Vercel
- [ ] Pushed changes to Git

## 🐛 Troubleshooting

### Magic link not working locally
- Check Supabase has `http://localhost:3000/auth/callback` in redirect URLs
- Make sure email confirmation is disabled
- Check dev server is running

### Wrong URL in emails
- Check `NEXT_PUBLIC_SITE_URL` in `.env.local`
- Restart dev server
- Clear browser cache

### Email not received
- Check spam folder
- Use "Resend Email" button
- Verify Supabase email settings

## 🎉 You're Ready!

Everything is configured. Just:
1. Configure Supabase (see step 1 above)
2. Test locally
3. Deploy to Vercel

Your passwordless authentication is ready to go! 🚀
