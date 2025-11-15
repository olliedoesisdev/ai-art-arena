# Add Missing Environment Variables to Vercel

## Variables to Add

Run these commands in your terminal, or add them via the Vercel dashboard:

### 1. CRON_SECRET
```bash
vercel env add CRON_SECRET production
# When prompted, paste: 25ffc4ecbc6f0c6558371b3e28d41dd04abd162a4ae907d06eb7b24c99c20161
```

### 2. NEXT_PUBLIC_SITE_URL
```bash
vercel env add NEXT_PUBLIC_SITE_URL production
# When prompted, enter your production URL (e.g., https://yourdomain.com)
```

### 3. IP_SALT
```bash
vercel env add IP_SALT production
# When prompted, paste: fea72edcf271ad47028a534176a060500b7935d87206122bfb1f0f2eee9c8a41
```

## Alternative: Add via Vercel Dashboard

1. Go to https://vercel.com/oliver-s-projects-cda0e2e2/ai-art-arena/settings/environment-variables
2. Add each variable:

| Name | Value | Environment |
|------|-------|-------------|
| `CRON_SECRET` | `25ffc4ecbc6f0c6558371b3e28d41dd04abd162a4ae907d06eb7b24c99c20161` | Production |
| `NEXT_PUBLIC_SITE_URL` | `https://olliedoesis.dev` (or your domain) | Production, Preview, Development |
| `IP_SALT` | `fea72edcf271ad47028a534176a060500b7935d87206122bfb1f0f2eee9c8a41` | Production |

## After Adding Variables

Redeploy your application:
```bash
vercel --prod
```

Or trigger a new deployment from the Vercel dashboard.
