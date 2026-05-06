# CLAUDE.md — AI Art Arena
# Machine-readable context file. Read this ENTIRE file before writing any code.
# This file is the source of truth. If a conversation conflicts with this file, this file wins.
# Last updated: 2026-05-06

---

## 1. WHAT THIS PROJECT IS

**AI Art Arena** is a weekly voting contest platform for AI-generated artwork.
Live at: `olliedoesis.dev`
Repo: `https://github.com/olliedoesisdev/ai-art-arena`
Local path: `D:\Projects\ai-art-arena-v2\`
Git user: `olliedoesisdev`

**Core loop:**
- A variable number of AI artworks are posted each week in a contest (set per-contest by the admin at creation time)
- Visitors vote once per contest (24-hour cooldown via IP hash + Upstash Redis)
- At week end, the contest auto-archives and a new one begins
- Archive page shows all past contests and results
- Leaderboard shows all-time highest-voted artworks across every contest

**I am the architect. You are the builder.**
Never make structural decisions without asking. Follow the patterns in this file exactly.
When you see something undocumented, ask before inventing a pattern.

---

## 2. TECH STACK — DO NOT SWAP THESE

| Layer | Tool | Notes |
|---|---|---|
| Framework | Next.js 14+ | App Router ONLY — not Pages Router |
| Language | TypeScript | Strict mode — no `any` |
| Database | Supabase | PostgreSQL + RLS + Storage + Realtime |
| Auth | NextAuth v5 | GitHub OAuth + Magic Links |
| Styling | Tailwind CSS | Tokens in tailwind.config.ts |
| Fonts | Syne + DM Mono | Via next/font/google — never CDN link tags |
| Deployment | Vercel | Custom domain olliedoesis.dev |
| Rate Limiting | Upstash Redis | @upstash/ratelimit — sliding window |
| Toasts | sonner | Only this library |
| Validation | Zod | Every API input validated before DB |
| Images | next/image | Never use raw img tag |
| Logging | pino + pino-pretty | Structured JSON logs |
| Monitoring | Sentry | Error tracking |
| Email | Resend | Transactional emails |
| Background Jobs | Inngest | Contest automation |
| Testing | Playwright + Vitest | E2E + unit |

**Installing a new library:** Ask first. If it duplicates something in the stack, the answer is no.

---

## 3. DESIGN SYSTEM — SINGLE SOURCE OF TRUTH

All visual tokens live in `tailwind.config.ts`. Never hard-code hex values anywhere else.

### Color palette — dark theme

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      bg: {
        base:     '#08080e',  // Page background
        surface:  '#111119',  // Card background
        surface2: '#181820',  // Elevated surface
        surface3: '#1f1f2a',  // Highest elevation / progress tracks
      },
      border: {
        subtle:  'rgba(139,92,246,0.12)',   // Default card borders
        mid:     'rgba(139,92,246,0.25)',   // Hovered / active borders
        strong:  'rgba(139,92,246,0.50)',   // Focused / selected borders
      },
      purple: {
        DEFAULT: '#8b5cf6',   // Primary actions, vote buttons
        light:   '#a78bfa',   // Hover states, nav CTA
        pale:    '#c4b5fd',   // Active nav labels
        dim:     'rgba(139,92,246,0.10)',   // Subtle backgrounds
        dim2:    'rgba(139,92,246,0.05)',
      },
      text: {
        DEFAULT: '#eeeeff',   // Primary text
        muted:   '#7878a0',   // Secondary / body copy
        dim:     '#3a3a58',   // Disabled / decorative
      },
      status: {
        success:     '#34d399',
        successDim:  'rgba(52,211,153,0.08)',
        error:       '#f87171',
        warning:     '#fbbf24',
        warningDim:  'rgba(251,191,36,0.08)',
      },
    },
    fontFamily: {
      sans:  ['Syne', 'system-ui', 'sans-serif'],       // All UI text
      mono:  ['DM Mono', 'monospace'],                   // Numbers, stats, ranks
    },
    borderRadius: {
      card: '14px',
      sm:   '8px',
      pill: '100px',
    },
  },
}
```

### Visual atmosphere

Every page has two fixed decorative layers (pointer-events: none, z-index: 0):
1. **Noise overlay** — `opacity-[0.018]` SVG fractalNoise texture, `position: fixed`, full viewport
2. **Orbs** — two radial-gradient blobs, `position: fixed`:
   - Orb 1: `700px` circle, top-center, `rgba(139,92,246,0.07)` → transparent
   - Orb 2: `400px` circle, bottom-right, `rgba(139,92,246,0.05)` → transparent

All page content sits at `z-index: 1` in a `.shell` wrapper (`max-width: 1140px, margin: 0 auto, padding: 0 28px`).

### Navigation

Sticky top nav, `background: rgba(8,8,14,0.82)`, `backdrop-filter: blur(16px)`, 60px tall.

**Canonical navigation labels — never change without updating this file:**
- `Home` — homepage with hero, mosaic, stats, how-it-works, last winner
- `Contest` — the active voting page
- `Archive` — past contests (hall of fame)
- `Leaderboard` — all-time highest-voted artworks
- `About` — about page

Right side of nav: amber "Vote now →" CTA button.

### Typography scale

- Display headings: Syne, `font-weight: 800`, `letter-spacing: -0.03em to -0.04em`
- Section labels: `11px`, `font-weight: 600`, `letter-spacing: 0.12em`, `text-transform: uppercase`, color `purple.light`
- Body: `14px`, `color: text.muted`, `line-height: 1.65`
- Stats/numbers: DM Mono, `font-weight: 500`
- Badges/pills: `9–11px`, `font-weight: 600–700`, `letter-spacing: 0.08–0.12em`, `text-transform: uppercase`

### Animations

- Page entrance: `opacity 0 → 1`, `translateY(12px) → 0`, `0.35s ease`
- Cards: `opacity 0 → 1`, `translateY(14px) → 0`, `0.4s ease`, staggered `animation-delay` per child (0.06s increments)
- Vote alert: `slideDown` — `opacity 0 → 1`, `translateY(-8px) → 0`, `0.3s ease`
- Image hover: `scale(1.05)` on the `<Image>`, `0.5s ease`
- Card hover: `translateY(-2px)`, `0.2s`

---

## 4. FILE STRUCTURE

```
app/
├── layout.tsx                    [SERVER] Root layout: Nav + Toaster + noise/orb layers
├── page.tsx                      [SERVER] Homepage: hero, mosaic, stats, how-it-works, last winner
├── loading.tsx                   [SERVER] Global skeleton
├── error.tsx                     [CLIENT] Global error boundary
├── not-found.tsx                 [SERVER] 404
│
├── contest/
│   └── [id]/
│       ├── page.tsx              [SERVER] Fetches contest + artworks. revalidate = 60
│       ├── loading.tsx           [SERVER] Voting skeleton
│       └── error.tsx             [CLIENT] Contest error boundary
│
├── archive/
│   ├── page.tsx                  [SERVER] All archived contests (4-col grid)
│   ├── loading.tsx               [SERVER]
│   └── [week]/
│       ├── page.tsx              [SERVER] Single archive detail
│       └── loading.tsx           [SERVER]
│
├── leaderboard/
│   ├── page.tsx                  [SERVER] All-time top artworks by vote_count
│   └── loading.tsx               [SERVER]
│
├── about/
│   ├── page.tsx                  [SERVER]
│   └── loading.tsx               [SERVER]
│
└── api/
    └── v1/                       ALL routes use /api/v1/ prefix. Never /api/
        └── vote/
            └── route.ts          POST only. Uses submit_vote RPC.

components/
├── ui/                           Reusable primitives
│   ├── Button.tsx                [SERVER]
│   ├── Card.tsx                  [SERVER]
│   └── Skeleton.tsx              [SERVER]
│
├── layout/
│   ├── Header.tsx                [SERVER] Sticky nav — Home, Contest, Archive, Leaderboard, About
│   ├── Footer.tsx                [SERVER]
│   ├── NoiseOrbs.tsx             [SERVER] Fixed noise + orb decorative layers
│   ├── MobileMenu.tsx            [CLIENT] Toggle state
│   └── UserNav.tsx               [CLIENT] Auth dropdown
│
├── home/
│   ├── HeroSection.tsx           [SERVER] Eyebrow + headline + CTA buttons
│   ├── ArtMosaic.tsx             [SERVER] 6-col image mosaic with mask gradient
│   ├── HomeStats.tsx             [SERVER] 4-col stat cards (uses get_homepage_stats RPC)
│   ├── HowItWorks.tsx            [SERVER] 3 step cards
│   └── LastWinner.tsx            [SERVER] Previous week's champion strip
│
├── contest/
│   ├── ContestHeader.tsx         [SERVER] Week badge + title + timer block
│   ├── ContestTimer.tsx          [CLIENT] useEffect countdown (days/hrs/min/sec cells)
│   ├── StatsStrip.tsx            [SERVER] Total votes + artwork count inline strip
│   ├── VoteAlert.tsx             [CLIENT] Green success banner after voting
│   ├── ArtworkGrid.tsx           [SERVER] 3-col grid wrapper
│   ├── ArtworkCard.tsx           [SERVER] Dark card: image + progress bar + vote button
│   ├── VotingInterface.tsx       [CLIENT] Owns all voting state
│   ├── VoteButton.tsx            [CLIENT] onClick handler
│   └── LiveVoteCount.tsx         [CLIENT] Supabase Realtime subscriber
│
├── archive/
│   ├── ArchiveGrid.tsx           [SERVER] 4-col grid
│   ├── ArchiveCard.tsx           [SERVER] Dark card with champion badge
│   └── WinnerBadge.tsx           [SERVER] Amber star badge
│
└── leaderboard/
    ├── LeaderboardList.tsx       [SERVER] Ranked list (gold/silver/bronze rows)
    └── LeaderboardFeatured.tsx   [SERVER] Sticky right panel — all-time #1 artwork

lib/
├── types.ts                      All shared TypeScript interfaces
├── database.types.ts             Generated by Supabase CLI. Never edit by hand.
├── supabase/
│   ├── server.ts                 createClient() for Server Components
│   └── client.ts                 createBrowserClient() for Client Components
├── security/
│   └── ratelimit.ts              Upstash rate limiters (vote + admin + adminUpload)
├── validators.ts                 Zod schemas for all API inputs
├── utils.ts                      cn(), hashIP(), getClientIP()
└── logger.ts                     pino structured logger

supabase/
└── migrations/
    ├── 20240001_initial_schema.sql
    ├── 20240002_add_indexes.sql
    ├── 20240003_submit_vote_function.sql
    ├── 20240004_system_config.sql
    └── 20240005_users_table.sql

inngest/
├── client.ts
└── functions/
    ├── archive-contest.ts
    ├── create-next-contest.ts
    └── send-vote-reminder.ts
```

---

## 5. SERVER vs CLIENT COMPONENTS

**Default is Server. Only add `use client` when the component needs:**
- `useState` / `useEffect` / `useTransition` / `useRef`
- Event handlers (onClick, onChange, onSubmit)
- Browser APIs (window, document, navigator)
- Supabase Realtime subscriptions

**Hard rules:**
- `page.tsx` files are ALWAYS Server Components
- `loading.tsx` files are ALWAYS Server Components
- `error.tsx` files MUST be Client Components (Next.js enforces this)
- API `route.ts` files are always server-side
- Never use `useEffect` to fetch data — use Server Components instead
- Never add `use client` to a component that does not need it

**Client Components in this project:**
VotingInterface, VoteButton, ContestTimer, VoteAlert, LiveVoteCount,
MobileMenu, UserNav, all error.tsx files

---

## 6. DATABASE SCHEMA

```sql
-- users (mirrors auth.users, stores role + profile)
id            UUID PRIMARY KEY REFERENCES auth.users(id)
email         TEXT NOT NULL UNIQUE
name          TEXT
avatar_url    TEXT
password_hash TEXT
role          TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'))
created_at    TIMESTAMPTZ DEFAULT NOW()
updated_at    TIMESTAMPTZ DEFAULT NOW()

-- contests
id           UUID PRIMARY KEY DEFAULT uuid_generate_v4()
week_number  INTEGER NOT NULL
start_date   TIMESTAMPTZ NOT NULL
end_date     TIMESTAMPTZ NOT NULL
status       TEXT CHECK (status IN ('active', 'archived'))
created_at   TIMESTAMPTZ DEFAULT NOW()

-- artworks
id            UUID PRIMARY KEY DEFAULT uuid_generate_v4()
contest_id    UUID REFERENCES contests(id)
image_url     TEXT NOT NULL
title         TEXT NOT NULL
artist_prompt TEXT
vote_count    INTEGER DEFAULT 0     -- denormalized, maintained by submit_vote RPC
created_at    TIMESTAMPTZ DEFAULT NOW()

-- votes
id           UUID PRIMARY KEY DEFAULT uuid_generate_v4()
artwork_id   UUID REFERENCES artworks(id)
contest_id   UUID REFERENCES contests(id)
user_id      UUID REFERENCES auth.users(id)   -- nullable: anonymous voters allowed
ip_hash      TEXT NOT NULL
created_at   TIMESTAMPTZ DEFAULT NOW()

-- system_config  (business logic constants: never hard-code these in app code)
key          TEXT PRIMARY KEY
value        TEXT NOT NULL
description  TEXT
```

**Required system_config rows:**
```
voting_cooldown_hours     = 24
artworks_per_contest      = (set per-contest by admin at creation time — no global default enforced)
contest_duration_days     = 7
max_votes_per_ip_per_day  = 1
```

**Reading config in application code:**
```typescript
const { data } = await supabase.from('system_config').select('key, value')
const config = Object.fromEntries(data.map(r => [r.key, r.value]))
// Use config.voting_cooldown_hours, not the number 24
```

Never hard-code 24 or 7 in application logic. Always read from system_config. The artwork count is set per-contest by the admin, not from system_config.

**Granting admin access:**
After first GitHub sign-in, run in Supabase SQL Editor:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## 7. REQUIRED DATABASE INDEXES

These must exist. Always create via migration, never ad-hoc.

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artworks_contest_id
  ON artworks(contest_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artworks_contest_votes
  ON artworks(contest_id, vote_count DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_votes_artwork_id
  ON votes(artwork_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_votes_ip_contest
  ON votes(ip_hash, contest_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_votes_user_contest
  ON votes(user_id, contest_id) WHERE user_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contests_status
  ON contests(status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contests_week_status
  ON contests(week_number DESC, status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_unique_ip_contest
  ON votes(ip_hash, contest_id);

-- Leaderboard: top artworks across all archived contests
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artworks_vote_count
  ON artworks(vote_count DESC);
```

---

## 8. DATABASE FUNCTIONS

### submit_vote — use this in /api/v1/vote. Never run sequential queries.

Replaces 5 sequential DB queries with 1 atomic transaction.
~200ms becomes ~40ms. No race conditions.

```sql
CREATE OR REPLACE FUNCTION submit_vote(
  p_artwork_id UUID,
  p_contest_id UUID,
  p_user_id    UUID,
  p_ip_hash    TEXT
) RETURNS TABLE (
  success     BOOLEAN,
  error_code  TEXT,
  vote_count  INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_contest_status TEXT;
  v_artwork_exists BOOLEAN;
  v_already_voted  BOOLEAN;
  v_new_count      INTEGER;
BEGIN
  SELECT
    c.status,
    EXISTS(SELECT 1 FROM artworks WHERE id = p_artwork_id AND contest_id = p_contest_id),
    EXISTS(
      SELECT 1 FROM votes v WHERE v.contest_id = p_contest_id
      AND (v.ip_hash = p_ip_hash
        OR (p_user_id IS NOT NULL AND v.user_id = p_user_id))
    )
  INTO v_contest_status, v_artwork_exists, v_already_voted
  FROM contests c WHERE c.id = p_contest_id;

  IF v_contest_status IS NULL THEN
    RETURN QUERY SELECT FALSE, 'CONTEST_NOT_FOUND'::TEXT, 0; RETURN;
  END IF;
  IF v_contest_status != 'active' THEN
    RETURN QUERY SELECT FALSE, 'CONTEST_NOT_ACTIVE'::TEXT, 0; RETURN;
  END IF;
  IF NOT v_artwork_exists THEN
    RETURN QUERY SELECT FALSE, 'ARTWORK_NOT_FOUND'::TEXT, 0; RETURN;
  END IF;
  IF v_already_voted THEN
    RETURN QUERY SELECT FALSE, 'ALREADY_VOTED'::TEXT, 0; RETURN;
  END IF;

  INSERT INTO votes (artwork_id, contest_id, user_id, ip_hash)
  VALUES (p_artwork_id, p_contest_id, p_user_id, p_ip_hash);

  UPDATE artworks SET vote_count = vote_count + 1
  WHERE id = p_artwork_id RETURNING vote_count INTO v_new_count;

  RETURN QUERY SELECT TRUE, NULL::TEXT, v_new_count;
END;
$$;

GRANT EXECUTE ON FUNCTION submit_vote TO authenticated, anon;
```

### get_homepage_stats — replaces 3 separate COUNT queries

```sql
CREATE OR REPLACE FUNCTION get_homepage_stats()
RETURNS TABLE (
  total_votes    BIGINT,
  total_artworks BIGINT,
  total_contests BIGINT,
  active_id      UUID,
  active_week    INTEGER
) LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM votes)::BIGINT,
    (SELECT COUNT(*) FROM artworks)::BIGINT,
    (SELECT COUNT(*) FROM contests)::BIGINT,
    (SELECT id          FROM contests WHERE status = 'active' LIMIT 1),
    (SELECT week_number FROM contests WHERE status = 'active' LIMIT 1);
END;
$$;
```

---

## 9. API ROUTES

All routes under `/api/v1/`. Never `/api/`.

### POST /api/v1/vote

**Order of operations — never change this sequence:**
1. Parse body
2. Zod validate (reject before touching DB or Redis)
3. Hash IP
4. Upstash rate limit check
5. Call `submit_vote` RPC
6. On success: `revalidatePath`, return 200

**Request:** `{ artwork_id: string, contest_id: string }`

**Responses:**
```
200  { success: true, vote_count: number }
400  { error: "Invalid input", details: ZodError }
400  { error: "Contest is not active" }
404  { error: "Contest not found" } or { error: "Artwork not found" }
409  { error: "Already voted on this contest" }
429  { error: "Rate limit exceeded", reset_at: string }
500  { error: "Internal server error" }
```

---

## 10. RATE LIMITING

Three limiters in `lib/ratelimit.ts`:

```typescript
// 1 vote per IP per 24 hours per contest (key: vote:${ipHash}:${contest_id})
export const voteRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(1, '24 h'),
  analytics: true,
  prefix: 'vote',
})

// 100 admin requests per minute
export const adminRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'admin',
})

// 10 admin uploads per hour
export const adminUploadRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
  prefix: 'admin_upload',
})
```

Rate limit key for votes: `vote:${ipHash}:${contest_id}` (scoped per contest, not global).

---

## 11. REAL-TIME VOTE COUNTS

`LiveVoteCount.tsx` subscribes to Supabase Realtime on the `artworks` table.

```typescript
'use client'
import { useEffect, useState } from 'react'
import { createClient as createBrowserClient } from '@/lib/supabase/client'

export function LiveVoteCount({ artworkId, initialCount }: { artworkId: string; initialCount: number }) {
  const [count, setCount] = useState(initialCount)
  useEffect(() => {
    const supabase = createBrowserClient()
    const channel = supabase
      .channel(`artwork-votes-${artworkId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'artworks', filter: `id=eq.${artworkId}` },
        (payload) => setCount((payload.new as { vote_count: number }).vote_count)
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [artworkId])
  return <span>{count.toLocaleString()}</span>
}
```

---

## 12. IMAGE PIPELINE

All artwork images go through this pipeline on upload:
1. Convert to WebP (primary) + JPEG (fallback) + 300px thumbnail
2. Store all three in Supabase Storage under `/artworks/`
3. Cache header: `Cache-Control: public, max-age=31536000, immutable`

`next.config.ts` must include:
```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
    // Placeholder domains for local testing only — remove before launch:
    { protocol: 'https', hostname: 'picsum.photos' },
    { protocol: 'https', hostname: 'fastly.picsum.photos' },
    { protocol: 'https', hostname: 'images.unsplash.com' },
  ],
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 31536000,
}
```

Every image in a component must follow this pattern:
```typescript
<div className="relative aspect-square">
  <Image
    src={artwork.image_url}
    alt={artwork.title}
    fill
    sizes="(max-width: 768px) 50vw, 33vw"
    priority={index < 2}
    className="object-cover transition-transform duration-500 group-hover:scale-105"
  />
</div>
```

---

## 13. AUTHENTICATION

- Provider: NextAuth v5 (auth.ts, auth.config.ts)
- Methods: GitHub OAuth + Credentials (email/password)
- Session access: `auth()` in Server Components
- Middleware protects: `/admin/*` routes require session with `role: admin`

**Dual-path voting (by design):**
- Authenticated: store `user_id` + `ip_hash`
- Anonymous: store `ip_hash` only (`user_id` is nullable)

**First admin setup:**
Sign in via GitHub, then run in Supabase SQL Editor:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## 14. SECURITY

**Every API route must have, in this order:**
1. Zod input validation
2. Upstash rate limit check
3. Auth check (if route requires it)
4. DB call via RLS client or SECURITY DEFINER function

**Middleware security headers (middleware.ts):**
```
Content-Security-Policy
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=63072000
Referrer-Policy: strict-origin-when-cross-origin
```

**IP hashing in `lib/utils.ts`:**
```typescript
import crypto from 'crypto'
export function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + process.env.IP_HASH_SALT).digest('hex').slice(0, 32)
}
```

Never store raw IPs. Never log raw IPs.

---

## 15. PERFORMANCE REQUIREMENTS

Core Web Vitals targets:
- LCP: less than 2.5s
- FID: less than 100ms
- CLS: less than 0.1

Rules:
- next/image for ALL images — never img tag
- priority prop on first 2 images only (LCP)
- aspect-square wrapper on every image container (prevents CLS)
- Every route has a loading.tsx skeleton
- `export const revalidate = 60` on contest, archive, and leaderboard pages
- ISR not SSR for contest pages
- Minimize Client Components — every use client adds to the JS bundle
- Fonts loaded via `next/font/google` — never a `<link>` tag in the HTML

---

## 16. STRUCTURED LOGGING

Use `lib/logger.ts` (pino) in all API routes. Never use bare console.log in production code.

```typescript
// lib/logger.ts
import pino from 'pino'
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
})
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}
```

Every API route must log: request received (with requestId), response sent (status + duration ms), errors (with stack trace).

---

## 17. CONTEST AUTOMATION (Inngest)

Inngest handles the weekly cycle. Functions live in `inngest/functions/`.

`archive-contest.ts`
- Trigger: cron `0 * * * *` (hourly), guards on `end_date < now`
- Action: set status = archived, send notification emails via Resend, fire `contest/archived` event

`create-next-contest.ts`
- Trigger: event `contest/archived`
- Action: create new contest row using week_number + 1, read duration from system_config

`send-vote-reminder.ts`
- Trigger: cron `0 * * * *`, guards on contests ending within 24–25 hours
- Action: email subscribed users via Resend

Business rule values (duration, cooldown) always come from system_config. Never hard-coded.
Resend client instantiated inside the handler function — never at module top level.
`inngest` and `resend` are in `serverExternalPackages` in next.config.ts.

---

## 18. LEADERBOARD

Route: `app/leaderboard/page.tsx` — Server Component, `revalidate = 60`.

Query: artworks ordered by `vote_count DESC`, joined with their contest week_number. No pagination on initial launch — show top 20.

```typescript
const { data } = await supabase
  .from('artworks')
  .select('id, title, image_url, vote_count, artist_prompt, contest_id, contests(week_number)')
  .order('vote_count', { ascending: false })
  .limit(20)
```

Layout: 2-col grid.
- Left: `LeaderboardList` — ranked rows with gold/silver/bronze styling, DM Mono rank numbers, thumbnail, title, week, vote count
- Right (sticky): `LeaderboardFeatured` — full card for all-time #1, image + stats

Rank styling:
- #1 → amber (`status.warning`)
- #2 → `#b0b0c8`
- #3 → `#c07840`
- #4+ → `text.dim`, smaller font

---

## 19. MIGRATIONS

All schema changes are migration files in `supabase/migrations/`.
Naming convention: `YYYYMMDDHHMMSS_description.sql`
Never alter the production database directly. Always write a migration.

Current migrations (applied in order):
1. `20240001_initial_schema.sql` — contests, artworks, votes, system_config tables + RLS
2. `20240002_add_indexes.sql` — all 8 required indexes
3. `20240003_submit_vote_function.sql` — submit_vote + get_homepage_stats RPCs
4. `20240004_system_config.sql` — seeds the 4 system_config rows
5. `20240005_users_table.sql` — users table + RLS + idx_users_email

---

## 20. TESTING PATTERNS

Write tests first, then write code to pass them.

Playwright E2E (`e2e/` directory):
- Full voting flow: page load, select artwork, submit vote, see confirmation toast
- Rate limit flow: vote, attempt second vote, see 429 message
- Archive flow: navigate past contest, see final results
- Leaderboard: page loads, top artwork appears at rank 1

Vitest unit tests (`__tests__/` directory):
- submit_vote edge cases (already voted, inactive contest, missing artwork)
- Zod schema validation (valid inputs + all invalid cases)
- hashIP utility

---

## 21. CURRENT BUILD STATUS

**Built and working:**
- NextAuth v5 (GitHub OAuth + Credentials)
- Supabase schema with RLS policies (5 migrations written)
- Security headers in middleware
- IP hashing utility (`lib/utils.ts`)
- Vercel deployment pipeline
- `/api/v1/vote` route — correct path, atomic RPC, op order per spec
- Rate limiting (`lib/ratelimit.ts`) — all 3 limiters, correct prefix
- `lib/logger.ts` — pino, all API routes use it
- UI components: ArtworkGrid, ArtworkCard, LiveVoteCount, ArchiveGrid, ArchiveCard, WinnerBadge, Button, Card, Skeleton
- loading.tsx skeletons for all routes
- Inngest automation (archive, create-next, vote-reminder)
- Vitest unit tests (17 passing) + Playwright E2E specs
- Admin dashboard (overview, contests, artworks, analytics)

**Not yet built — build in this order:**
1. Design system: update `tailwind.config.ts` to dark token set, add Syne + DM Mono via next/font
2. Global layout: `app/layout.tsx` — noise/orb layers, dark nav, new font classes
3. Homepage (`app/page.tsx`) — hero, mosaic, stats (get_homepage_stats), how-it-works, last winner strip
4. Contest page (`app/contest/[id]/page.tsx`) — dark card grid, timer cells, stats strip, vote alert
5. Archive page (`app/archive/page.tsx`) — 4-col dark grid with champion badges
6. Leaderboard page (`app/leaderboard/page.tsx` + components)
7. About page (`app/about/page.tsx`) — 2-col layout, profile card, roadmap

---

## 22. ENVIRONMENT VARIABLES

Required in all three environments (local, preview, production):
```
NEXTAUTH_URL
NEXTAUTH_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
IP_HASH_SALT
SENTRY_DSN
RESEND_API_KEY
INNGEST_SIGNING_KEY
INNGEST_EVENT_KEY
LOG_LEVEL
```

Local dev: `.env.local` — never commit this file.

---

## 23. WHAT NEVER TO DO

- Never use img tag — always next/image
- Never fetch data in a Client Component with useEffect — use Server Components
- Never add use client unless the component genuinely requires it
- Never create API routes at /api/ — always /api/v1/
- Never run sequential DB queries in the vote endpoint — use submit_vote RPC
- Never hard-code 24, 7 or other business constants — read from system_config; artwork count is per-contest
- Never store or log raw IP addresses — always hash first with IP_HASH_SALT
- Never commit .env.local
- Never use any in TypeScript
- Never use console.log in API routes — use logger from lib/logger.ts
- Never alter the database directly — always write a migration file
- Never change nav labels without updating Section 3 of this file
- Never use apostrophes in JSX text or component string values
- Never use a CDN link tag for fonts — always next/font/google
- Never hard-code hex values in components — always use Tailwind tokens from tailwind.config.ts
- Never instantiate Resend at module top level — always inside the handler function

---

## 24. COMMANDS

```bash
npm run dev
npm run build
npm run lint
npm test                   # vitest unit tests
npm run test:e2e           # playwright e2e
npx tsc --noEmit
npm audit
npx supabase db push
npx supabase db reset
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
npx inngest-cli@latest dev  # local inngest dev server (no keys needed locally)
```

---

*Update this file when any architectural decision changes.
An outdated CLAUDE.md causes drift. An accurate CLAUDE.md prevents it.*
