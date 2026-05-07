# AI Art Arena

Weekly AI art voting contest. Six AI-generated artworks drop every week — visitors vote once, the highest-voted piece wins, and results live forever in the archive.

Live at **[olliedoesis.dev](https://olliedoesis.dev)**

---

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript (strict) |
| Database | Supabase (PostgreSQL + RLS + Storage + Realtime) |
| Auth | NextAuth v5 (GitHub OAuth + email/password) |
| Styling | Tailwind CSS v4 + inline styles |
| Fonts | Syne + DM Mono via `next/font` |
| Rate limiting | Upstash Redis |
| Background jobs | Inngest |
| Email | Resend |
| Logging | pino |
| Deployment | Vercel |

---

## Local setup

### 1. Clone and install

```bash
git clone https://github.com/olliedoesisdev/ai-art-arena
cd ai-art-arena
npm install
```

### 2. Environment variables

Copy the example file and fill in every value:

```bash
cp .env.example .env.local
```

| Variable | Where to get it |
|---|---|
| `NEXTAUTH_URL` | `http://localhost:3000` for local dev |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `GITHUB_CLIENT_ID` | [github.com/settings/developers](https://github.com/settings/developers) — new OAuth App, callback: `http://localhost:3000/api/auth/callback/github` |
| `GITHUB_CLIENT_SECRET` | Same OAuth App |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API (keep secret) |
| `UPSTASH_REDIS_REST_URL` | [console.upstash.com](https://console.upstash.com) → new Redis DB |
| `UPSTASH_REDIS_REST_TOKEN` | Same Redis DB |
| `IP_HASH_SALT` | Any random string — `openssl rand -hex 16` |
| `RESEND_API_KEY` | [resend.com](https://resend.com) |
| `INNGEST_SIGNING_KEY` | [app.inngest.com](https://app.inngest.com) → project keys |
| `INNGEST_EVENT_KEY` | Same |
| `ADMIN_EMAIL` | Email address to receive contest archive notifications |
| `SENTRY_DSN` | [sentry.io](https://sentry.io) (optional for local) |
| `LOG_LEVEL` | `debug` for local, `info` for production |

### 3. Database

The live Supabase DB was set up manually. To recreate it on a fresh project, run the migrations in order via the Supabase SQL editor:

```
supabase/migrations/20240001_initial_schema.sql
supabase/migrations/20240002_add_indexes.sql
supabase/migrations/20240003_submit_vote_function.sql
supabase/migrations/20240004_system_config.sql
supabase/migrations/20240005_users_table.sql
supabase/migrations/20240006_schema_corrections.sql
supabase/migrations/20240007_security_fixes.sql
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Admin setup

After signing in with GitHub, grant yourself admin access in the Supabase SQL editor:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

Then visit `/admin` to create contests and upload artworks.

---

## Creating a contest

1. Go to `/admin/contests/new`
2. Set week number, start date, end date, artwork count
3. Go to `/admin/artworks/upload` and add artworks (image URL + title + prompt)
4. The contest goes live immediately if status is set to `active`

At week end, the Inngest `archive-contest` function automatically sets the contest to `archived` (runs hourly).

---

## Project structure

```
app/                    # Next.js App Router pages and API routes
  api/v1/vote/          # Vote endpoint (Zod + rate limit + RPC)
  api/admin/            # Admin endpoints (auth-gated)
  api/auth/             # Signup, magic-link, reset-password
  contest/[id]/         # Contest voting page (ISR, revalidate 60s)
  archive/              # Past contests
  leaderboard/          # All-time top artworks
  admin/                # Admin dashboard

components/
  contest/              # ArtworkCard, ContestTimer, LiveVoteCount, etc.
  layout/               # Header, Footer, MobileMenu, NavLinks
  home/                 # ArtMosaic, LastWinner
  leaderboard/          # LeaderboardList, LeaderboardFeatured
  archive/              # ArchiveCard, ArchiveGrid

lib/
  supabase/server.ts    # createClient(), createPublicClient(), createAdminClient()
  ratelimit.ts          # Upstash rate limiters
  validators.ts         # Zod schemas
  utils.ts              # hashIP(), getClientIP(), cn()
  logger.ts             # pino structured logger

inngest/functions/
  archive-contest.ts    # Hourly cron — archives expired contests
  send-vote-reminder.ts # Hourly cron — emails subscribers before contest ends

supabase/migrations/    # All schema changes version-controlled here
proxy.ts                # Next.js middleware — security headers + admin auth
auth.ts                 # NextAuth config — GitHub OAuth + Credentials
```

---

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm test             # Vitest unit tests
npm run test:e2e     # Playwright E2E tests
npx tsc --noEmit     # TypeScript check
```

---

## Voting system

- One vote per IP per contest, enforced by:
  1. Upstash Redis sliding window (24h)
  2. `submit_vote` PostgreSQL RPC (checks ip_hash + user_id)
  3. Unique DB index on `(ip_hash, contest_id)` and `(user_id, contest_id)`
- Authenticated users: vote tied to `user_id` + `ip_hash`
- Anonymous users: vote tied to `ip_hash` only
- IPs are SHA-256 hashed with a salt before storage — raw IPs never persisted
- `vote_count` is denormalized on the `artworks` table for fast reads, incremented atomically inside the RPC
