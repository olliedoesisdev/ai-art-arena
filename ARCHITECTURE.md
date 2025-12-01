# Architecture Documentation - AI Art Arena

**Last Updated:** November 25, 2025

This document explains the architectural decisions, patterns, and systems used in the AI Art Arena platform.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [Technology Stack](#technology-stack)
4. [Configuration System](#configuration-system)
5. [Database Architecture](#database-architecture)
6. [API Design](#api-design)
7. [Security Architecture](#security-architecture)
8. [Performance & Caching](#performance--caching)
9. [Feature Flags](#feature-flags)
10. [Future Scalability](#future-scalability)

---

## System Overview

AI Art Arena is a weekly voting platform where users vote for their favorite AI-generated artworks. The system is designed with the following goals:

- **Scalability**: Handle growing user base and vote volume
- **Security**: Protect against abuse, spam, and malicious attacks
- **Flexibility**: Easy to configure and modify without deployments
- **Performance**: Fast page loads and real-time updates
- **Maintainability**: Clean code structure and clear separation of concerns

### High-Level Architecture

```
┌─────────────┐
│   Browser   │
│  (Client)   │
└──────┬──────┘
       │
       │ HTTPS
       ▼
┌─────────────────────────────────┐
│      Next.js 14 App Router      │
│  ┌───────────────────────────┐  │
│  │     Middleware Layer      │  │
│  │  - Security Headers       │  │
│  │  - Session Management     │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │     API Routes            │  │
│  │  - Rate Limiting          │  │
│  │  - Input Validation       │  │
│  │  - Feature Flag Checks    │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │  Server Components        │  │
│  │  - Data Fetching          │  │
│  │  - Initial Render         │  │
│  └───────────────────────────┘  │
└─────────────┬───────────────────┘
              │
              │ Supabase Client
              ▼
┌─────────────────────────────────┐
│      Supabase Backend           │
│  ┌───────────────────────────┐  │
│  │   PostgreSQL Database     │  │
│  │  - Row Level Security     │  │
│  │  - Functions & Triggers   │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │   Authentication          │  │
│  │  - JWT Tokens             │  │
│  │  - Session Management     │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

---

## Architecture Principles

### 1. Configuration Over Code

All magic numbers and parameters are centralized in configuration files:

- **`src/lib/constants.ts`**: Application-level constants
- **`settings` table**: Database-driven runtime configuration
- **Environment variables**: Secrets and feature flags

**Benefits:**
- Change contest parameters without redeployment
- A/B test different configurations
- Emergency feature toggles

### 2. Defense in Depth

Multiple layers of security:

- **Middleware**: Security headers, session validation
- **API Routes**: Rate limiting, input validation, feature flags
- **Database**: RLS policies, parameterized queries
- **Application**: IP hashing, authentication checks

### 3. Performance First

Optimize for read-heavy workloads:

- **Denormalized vote counts**: Stored on artworks table
- **Database indexes**: On frequently queried columns
- **Static generation**: Archive pages can be cached
- **Lazy loading**: Images and components loaded on demand

### 4. Type Safety

TypeScript everywhere:

- **Database types**: Generated from Supabase schema
- **API validation**: Zod runtime validation
- **Component props**: Strict interface definitions
- **Constants**: `as const` assertions for literal types

---

## Technology Stack

### Frontend

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **Next.js 14** | Framework | App Router, Server Components, built-in optimizations |
| **React 19** | UI Library | Latest features, improved performance |
| **TypeScript** | Language | Type safety, better DX, fewer bugs |
| **Tailwind CSS** | Styling | Utility-first, fast development, small bundle |
| **TipTap** | Rich Text Editor | Extensible, React-friendly, good UX |

### Backend

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **Supabase** | Backend Platform | PostgreSQL, Auth, RLS, Realtime (optional) |
| **PostgreSQL** | Database | ACID compliance, powerful queries, RLS |
| **Zod** | Validation | Runtime type checking, TypeScript integration |
| **LRU Cache** | Rate Limiting | In-memory, fast, simple (upgradeable to Redis) |

---

## Configuration System

### Three-Tier Configuration

#### 1. Environment Variables (`.env.local`)

For secrets and deployment-specific values:

```env
SUPABASE_SERVICE_ROLE_KEY=secret_key
IP_SALT=random_salt
CRON_SECRET=cron_secret
NEXT_PUBLIC_SITE_URL=https://example.com
```

#### 2. Application Constants (`src/lib/constants.ts`)

For application-level configuration:

```typescript
export const CONTEST_CONFIG = {
  min_artworks_to_start: 6,
  max_artworks_per_contest: 12,
  duration_days: 7,
  vote_cooldown_hours: 24,
} as const;

export const FEATURES = {
  VOTING: process.env.NEXT_PUBLIC_FEATURE_VOTING !== 'false',
  ARCHIVE: process.env.NEXT_PUBLIC_FEATURE_ARCHIVE !== 'false',
  // ...
} as const;
```

#### 3. Database Settings (`settings` table)

For runtime-configurable values:

```sql
SELECT * FROM settings WHERE key = 'contest.max_artworks';
UPDATE settings SET value = '12' WHERE key = 'contest.max_artworks';
```

### Configuration Hierarchy

```
Database Settings (highest priority)
  ↓
Environment Variables
  ↓
Application Constants (fallback)
```

---

## Database Architecture

### Schema Design

#### Core Tables

**contests**
```sql
CREATE TABLE contests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('upcoming', 'active', 'ended', 'archived')),
  winner_id UUID REFERENCES artworks(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_number, year)
);
```

**artworks**
```sql
CREATE TABLE artworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  prompt TEXT,
  artist_name TEXT,
  position INTEGER, -- Display order (1-12)
  vote_count INTEGER DEFAULT 0, -- Denormalized for performance
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**votes**
```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  user_identifier TEXT NOT NULL, -- For anonymous voting (future)
  ip_hash TEXT NOT NULL, -- Privacy-preserving analytics
  user_agent TEXT,
  vote_date DATE GENERATED ALWAYS AS (created_at::date) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artwork_id, user_id, vote_date)
);
```

**settings**
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexing Strategy

```sql
-- Contests
CREATE INDEX idx_contests_status ON contests(status);
CREATE INDEX idx_contests_dates ON contests(start_date, end_date);

-- Artworks
CREATE INDEX idx_artworks_contest_id ON artworks(contest_id);
CREATE INDEX idx_artworks_vote_count ON artworks(vote_count DESC);
CREATE UNIQUE INDEX idx_artworks_contest_position ON artworks(contest_id, position);

-- Votes
CREATE INDEX idx_votes_artwork_id ON votes(artwork_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_vote_date ON votes(vote_date);
CREATE INDEX idx_votes_contest_id ON votes(contest_id);
```

### Database Functions

#### `get_active_contest()`

Returns the current active contest.

```sql
CREATE OR REPLACE FUNCTION get_active_contest()
RETURNS TABLE (
  contest_id UUID,
  title TEXT,
  week_number INTEGER,
  -- ...
)
```

**Usage in API:**
```typescript
const { data: contest } = await supabase
  .rpc('get_active_contest')
  .single();
```

#### `can_vote(artwork_id, user_id, contest_id)`

Check if user can vote (no vote today).

```sql
CREATE OR REPLACE FUNCTION can_vote(
  p_artwork_id UUID,
  p_user_id UUID,
  p_contest_id UUID
)
RETURNS BOOLEAN
```

**Benefits:**
- Business logic in database
- Single source of truth
- Atomic operations

### Triggers & Automation

#### Vote Count Trigger

Automatically updates `artworks.vote_count` when votes are added:

```sql
CREATE TRIGGER increment_vote_count
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION increment_vote_count();
```

**Why denormalize?**
- Avoid `COUNT(*)` queries on large tables
- Instant read performance
- Trade: Write complexity for read speed

#### Updated At Trigger

Automatically updates `updated_at` timestamps:

```sql
CREATE TRIGGER update_contests_updated_at
  BEFORE UPDATE ON contests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## API Design

### RESTful Endpoints

| Endpoint | Method | Purpose | Rate Limit |
|----------|--------|---------|------------|
| `/api/vote` | POST | Record a vote | 10/min |
| `/api/vote` | GET | Check vote eligibility | 60/min |
| `/api/contests/active` | GET | Get active contest | 60/min |
| `/api/contests/archived` | GET | Get archived contests | 60/min |
| `/api/cron/archive-contest` | POST | Archive ended contests | Auth only |

### Request/Response Pattern

All API routes follow this pattern:

```typescript
export async function POST(request: Request) {
  try {
    // 1. Feature flag check
    if (!FEATURES.VOTING) {
      return NextResponse.json(
        { error: 'Feature disabled' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    // 2. Rate limiting
    await rateLimiters.vote.check(10, ipHash);

    // 3. Input validation
    const validation = validateRequest(voteSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        formatZodError(validation.error),
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // 4. Authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // 5. Business logic
    // ...

    // 6. Success response
    return NextResponse.json({ success: true, data });

  } catch (error) {
    // 7. Error handling
    console.error('Error:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.GENERIC_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
```

### Input Validation with Zod

All API inputs are validated with Zod schemas:

```typescript
// src/lib/validation.ts
export const voteSchema = z.object({
  artworkId: z.string().uuid('Invalid artwork ID'),
  contestId: z.string().uuid('Invalid contest ID'),
});

// In API route
const validation = validateRequest(voteSchema, body);
if (!validation.success) {
  const errors = formatZodError(validation.error);
  return NextResponse.json(errors, { status: 400 });
}
```

**Benefits:**
- Runtime type checking
- Clear error messages
- TypeScript type inference
- Prevents injection attacks

---

## Security Architecture

### Multi-Layer Security

#### 1. Middleware Layer

**Security Headers** (`middleware.ts`):

```typescript
response.headers.set('X-Frame-Options', 'DENY'); // Prevent clickjacking
response.headers.set('X-Content-Type-Options', 'nosniff'); // Prevent MIME sniffing
response.headers.set('Content-Security-Policy', '...'); // XSS protection
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
```

#### 2. API Layer

**Rate Limiting**:

```typescript
// In-memory LRU cache (upgradeable to Redis)
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 1000,
});

await limiter.check(10, ipHash); // 10 requests per minute
```

**Input Validation**:

```typescript
// Zod schema validation
const validation = validateRequest(voteSchema, body);
```

**Feature Flags**:

```typescript
if (!FEATURES.VOTING) {
  return NextResponse.json({ error: 'Disabled' }, { status: 403 });
}
```

#### 3. Database Layer

**Row Level Security (RLS)**:

```sql
-- Public read access
CREATE POLICY "Allow public read access"
  ON contests
  FOR SELECT
  TO public
  USING (true);

-- Authenticated writes
CREATE POLICY "Allow authenticated users to vote"
  ON votes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

**Parameterized Queries**:

Supabase client prevents SQL injection:

```typescript
// Safe - parameterized
await supabase.from('votes').insert({ artwork_id, user_id });

// NEVER do this (vulnerable to SQL injection)
await supabase.rpc('raw_sql', { query: `INSERT INTO votes VALUES ('${artworkId}')` });
```

### Privacy Protection

**IP Address Hashing**:

```typescript
function hashIP(ip: string): string {
  if (!process.env.IP_SALT) {
    throw new Error('IP_SALT required');
  }
  return createHash('sha256')
    .update(ip + process.env.IP_SALT)
    .digest('hex');
}
```

**Benefits:**
- Cannot reverse-engineer original IP
- Consistent hash for analytics
- Compliant with privacy regulations

---

## Performance & Caching

### Denormalization Strategy

**Vote Counts:**

Instead of:
```sql
SELECT COUNT(*) FROM votes WHERE artwork_id = ?
```

We store:
```sql
SELECT vote_count FROM artworks WHERE id = ?
```

**Trade-offs:**
- ✅ Instant reads (no aggregation)
- ✅ Scales to millions of votes
- ❌ Slightly complex writes (triggers)
- ❌ Potential consistency issues (mitigated by transactions)

### Caching Strategy

**ISR (Incremental Static Regeneration):**

```typescript
// Archive pages (don't change often)
export const revalidate = 3600; // 1 hour

// Active contest (changes frequently)
export const revalidate = 60; // 1 minute
```

**Cache Configuration:**

```typescript
export const CACHE_CONFIG = {
  REVALIDATE_CONTEST: 60,
  REVALIDATE_ARCHIVE: 3600,
  REVALIDATE_ARCHIVED_CONTEST: 86400, // 24 hours
};
```

### Future Optimizations

When vote table exceeds 100k rows:

1. **Materialized Views:**
   ```sql
   CREATE MATERIALIZED VIEW contest_vote_counts AS
   SELECT artwork_id, COUNT(*) as vote_count
   FROM votes
   GROUP BY artwork_id;
   ```

2. **Table Partitioning:**
   ```sql
   CREATE TABLE votes_2025_01 PARTITION OF votes
   FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
   ```

3. **Redis Caching:**
   ```typescript
   const voteCount = await redis.get(`artwork:${id}:votes`);
   ```

---

## Feature Flags

### Why Feature Flags?

- **Gradual Rollouts**: Test features with subset of users
- **Emergency Toggles**: Disable broken features instantly
- **A/B Testing**: Compare different implementations
- **Maintenance Mode**: Disable voting during maintenance

### Implementation

**Environment Variables:**

```env
NEXT_PUBLIC_FEATURE_VOTING=true
NEXT_PUBLIC_FEATURE_ARCHIVE=true
NEXT_PUBLIC_FEATURE_BLOG=true
```

**Constants:**

```typescript
export const FEATURES = {
  VOTING: process.env.NEXT_PUBLIC_FEATURE_VOTING !== 'false',
  ARCHIVE: process.env.NEXT_PUBLIC_FEATURE_ARCHIVE !== 'false',
  BLOG: process.env.NEXT_PUBLIC_FEATURE_BLOG !== 'false',
} as const;
```

**Usage in API:**

```typescript
if (!FEATURES.VOTING) {
  return NextResponse.json(
    { error: 'Voting is currently disabled' },
    { status: 403 }
  );
}
```

**Usage in Components:**

```typescript
{FEATURES.ARCHIVE && (
  <Link href="/archive">Archive</Link>
)}
```

---

## Future Scalability

### Current Limitations

| Component | Current | Limit | Solution |
|-----------|---------|-------|----------|
| Rate Limiting | In-memory LRU | Single server | Redis |
| Vote Counting | Denormalized | 1M votes/contest | Materialized views |
| Database | Single region | Latency | Read replicas |
| Caching | Next.js ISR | Cold starts | CDN + Redis |

### Upgrade Path

#### 1. Redis Rate Limiting

**Current:**
```typescript
const limiter = new MemoryRateLimiter({ interval: 60000 });
```

**Future:**
```typescript
const limiter = new RedisRateLimiter({
  redis: createRedisClient(),
  interval: 60000,
});
```

Both implement `RateLimiter` interface - no API changes needed.

#### 2. Materialized Vote Counts

**Migration:**
```sql
CREATE MATERIALIZED VIEW artwork_vote_counts AS
SELECT
  artwork_id,
  COUNT(*) as total_votes,
  COUNT(DISTINCT user_id) as unique_voters
FROM votes
GROUP BY artwork_id;

CREATE UNIQUE INDEX ON artwork_vote_counts(artwork_id);

-- Refresh every hour
REFRESH MATERIALIZED VIEW CONCURRENTLY artwork_vote_counts;
```

#### 3. Multi-Region Deployment

**Setup:**
- Primary database (us-east-1)
- Read replicas (eu-west-1, ap-southeast-1)
- Route reads to nearest region
- Route writes to primary

#### 4. CDN Integration

**Static Assets:**
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['cdn.example.com'],
  },
};
```

---

## Monitoring & Observability

### Key Metrics

**Application:**
- Request rate (requests/min)
- Error rate (%)
- Response time (p50, p95, p99)
- Vote submission rate

**Database:**
- Active connections
- Query execution time
- Slow queries (>100ms)
- Table sizes

**Infrastructure:**
- Memory usage
- CPU usage
- Disk I/O

### Logging Strategy

**Structured Logging:**
```typescript
console.error('Vote error', {
  artworkId,
  userId,
  error: error.message,
  timestamp: new Date().toISOString(),
});
```

**Future: Sentry Integration**
```typescript
Sentry.captureException(error, {
  tags: { feature: 'voting' },
  extra: { artworkId, userId },
});
```

---

## Contributing to Architecture

When making architectural changes:

1. **Update this document** - Keep it current
2. **Write migration scripts** - For database changes
3. **Add tests** - Validate behavior
4. **Update constants** - Keep config centralized
5. **Document decisions** - Explain "why" not just "what"

---

## References

- **Next.js Documentation**: https://nextjs.org/docs
- **Supabase Documentation**: https://supabase.com/docs
- **PostgreSQL Performance**: https://www.postgresql.org/docs/current/performance-tips.html
- **Web Security**: https://owasp.org/www-project-top-ten/

---

**Last Updated:** November 25, 2025
**Maintainer:** olliedoesis
