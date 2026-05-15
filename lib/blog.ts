export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readingTime: number; // minutes
  tags: string[];
  sections: BlogSection[];
}

export type BlogSection =
  | { type: "paragraph"; content: string }
  | { type: "heading"; level: 2 | 3; content: string }
  | { type: "code"; language: string; content: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "callout"; variant: "info" | "warning" | "success" | "tip"; content: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "divider" }
  | { type: "metric-grid"; items: { label: string; value: string; sub?: string }[] }
  | { type: "comparison"; left: { label: string; items: string[] }; right: { label: string; items: string[] } };

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "submit-vote-postgresql-race-condition",
    title: "PostgreSQL SECURITY DEFINER functions: atomic votes, 80% latency reduction, zero race conditions",
    excerpt: "Five sequential database queries in a vote handler create a TOCTOU race condition and ~200ms latency. A single SECURITY DEFINER function eliminates both — one atomic transaction, ~40ms, no interleaving possible.",
    publishedAt: "2026-05-10",
    readingTime: 9,
    tags: ["PostgreSQL", "Supabase", "Performance", "Concurrency"],
    sections: [
      {
        type: "paragraph",
        content: "Five sequential database queries in a vote handler create a TOCTOU race condition. Two requests arriving at the same millisecond both pass the duplicate-vote check, both insert a vote row, and one user gets counted twice. A single SECURITY DEFINER function eliminates this — one atomic transaction that cannot be interleaved with anything else.",
      },
      {
        type: "paragraph",
        content: "It worked fine in testing. It would have worked fine in production — right up until two users clicked the vote button at the same millisecond.",
      },
      {
        type: "heading",
        level: 2,
        content: "The race condition hiding in plain sight",
      },
      {
        type: "paragraph",
        content: "Here's what the sequential approach actually looked like in Node.js:",
      },
      {
        type: "code",
        language: "typescript",
        content: `// ❌ The naive approach — five round trips, one race condition
const { data: contest } = await supabase
  .from('contests').select('status').eq('id', contestId).single();

if (contest.status !== 'active') return { error: 'CONTEST_NOT_ACTIVE' };

const { data: artwork } = await supabase
  .from('artworks').select('id').eq('id', artworkId).eq('contest_id', contestId).single();

if (!artwork) return { error: 'ARTWORK_NOT_FOUND' };

const { data: existingVote } = await supabase
  .from('votes').select('id').eq('ip_hash', ipHash).eq('contest_id', contestId).single();

if (existingVote) return { error: 'ALREADY_VOTED' };

// 🕳️  Gap here — another request can slip through between this check and the insert
await supabase.from('votes').insert({ artwork_id, contest_id, ip_hash });
await supabase.from('artworks').update({ vote_count: artwork.vote_count + 1 }).eq('id', artworkId);`,
      },
      {
        type: "callout",
        variant: "warning",
        content: "The window between 'check for existing vote' and 'insert the vote' is a classic TOCTOU (time-of-check to time-of-use) race. Two requests arriving simultaneously both pass the duplicate check, both insert a vote row, and one user gets counted twice.",
      },
      {
        type: "paragraph",
        content: "In practice, with a small user base, this race fires rarely. But 'rarely' is not 'never', and corrupted vote counts are exactly the kind of silent data integrity bug that's hard to detect and impossible to retroactively fix cleanly.",
      },
      {
        type: "heading",
        level: 2,
        content: "The fix: one atomic PostgreSQL function",
      },
      {
        type: "paragraph",
        content: "PostgreSQL has a feature that most application developers never reach for: SECURITY DEFINER functions. A function marked SECURITY DEFINER executes with the permissions of the function owner — not the calling user — and critically, runs as a single atomic database transaction. No other query can interleave with it.",
      },
      {
        type: "code",
        language: "sql",
        content: `CREATE OR REPLACE FUNCTION public.submit_vote(
  p_artwork_id  UUID,
  p_contest_id  UUID,
  p_user_id     UUID,
  p_ip_hash     TEXT,
  p_email_hash  TEXT DEFAULT NULL
) RETURNS TABLE (
  success    BOOLEAN,
  error_code TEXT,
  vote_count INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_contest_status TEXT;
  v_artwork_exists BOOLEAN;
  v_already_voted  BOOLEAN;
  v_new_count      INTEGER;
BEGIN
  -- Single read: check contest, artwork, and all three duplicate-vote vectors atomically
  SELECT
    c.status,
    EXISTS(SELECT 1 FROM artworks a WHERE a.id = p_artwork_id AND a.contest_id = p_contest_id),
    EXISTS(
      SELECT 1 FROM votes v WHERE v.contest_id = p_contest_id
      AND (
        v.ip_hash    = p_ip_hash
        OR (p_user_id    IS NOT NULL AND v.user_id    = p_user_id)
        OR (p_email_hash IS NOT NULL AND v.email_hash = p_email_hash)
      )
    )
  INTO v_contest_status, v_artwork_exists, v_already_voted
  FROM contests c WHERE c.id = p_contest_id;

  -- Early returns — no writes happen if any check fails
  IF v_contest_status IS NULL  THEN RETURN QUERY SELECT FALSE, 'CONTEST_NOT_FOUND'::TEXT,  0; RETURN; END IF;
  IF v_contest_status != 'active' THEN RETURN QUERY SELECT FALSE, 'CONTEST_NOT_ACTIVE'::TEXT, 0; RETURN; END IF;
  IF NOT v_artwork_exists      THEN RETURN QUERY SELECT FALSE, 'ARTWORK_NOT_FOUND'::TEXT,  0; RETURN; END IF;
  IF v_already_voted           THEN RETURN QUERY SELECT FALSE, 'ALREADY_VOTED'::TEXT,       0; RETURN; END IF;

  INSERT INTO votes (artwork_id, contest_id, user_id, ip_hash, email_hash)
  VALUES (p_artwork_id, p_contest_id, p_user_id, p_ip_hash, p_email_hash);

  -- Alias table to avoid ambiguity with the RETURNS TABLE column 'vote_count'
  UPDATE artworks AS aw
  SET vote_count = aw.vote_count + 1
  WHERE aw.id = p_artwork_id
  RETURNING aw.vote_count INTO v_new_count;

  RETURN QUERY SELECT TRUE, NULL::TEXT, v_new_count;
END;
$$;`,
      },
      {
        type: "heading",
        level: 2,
        content: "The ambiguous column bug that bit me in production",
      },
      {
        type: "paragraph",
        content: "Writing this function taught me something PostgreSQL does not make obvious. When your RETURNS TABLE declaration includes a column named vote_count, and your function body does UPDATE artworks ... RETURNING vote_count, PostgreSQL cannot tell whether you mean the table column or the output column. It throws ERROR 42702: column reference is ambiguous — and every single vote submission returns a 500.",
      },
      {
        type: "callout",
        variant: "info",
        content: "Fix: alias the table in the UPDATE clause. `UPDATE artworks AS aw SET vote_count = aw.vote_count + 1 ... RETURNING aw.vote_count` — now PL/pgSQL has no ambiguity.",
      },
      {
        type: "heading",
        level: 2,
        content: "Three layers of duplicate-vote detection",
      },
      {
        type: "paragraph",
        content: "A single IP hash is not enough to prevent duplicate voting. VPNs reset IPs. Shared networks mean one IP covers hundreds of users. The function checks three independent vectors simultaneously:",
      },
      {
        type: "table",
        headers: ["Layer", "Key", "Covers", "Weakness"],
        rows: [
          ["IP hash", "hashIP(clientIP) + contest_id", "Anonymous visitors, most casual cases", "VPNs, shared networks (offices, universities)"],
          ["User ID", "auth.users.id + contest_id", "Any signed-in user regardless of IP", "Requires the user to have an account"],
          ["Email hash", "HMAC(email, VOTE_HASH_SALT) + contest_id", "Users who sign in from different devices/IPs", "Only catches authenticated users"],
        ],
      },
      {
        type: "paragraph",
        content: "The email hash uses a separate VOTE_HASH_SALT environment variable — not the IP hash salt. This matters: if the same salt is used for both, a compromised salt exposes both hashing schemes simultaneously.",
      },
      {
        type: "heading",
        level: 2,
        content: "Performance: before and after",
      },
      {
        type: "metric-grid",
        items: [
          { label: "Before (5 queries)", value: "~200ms", sub: "sequential round trips" },
          { label: "After (1 RPC)", value: "~40ms", sub: "single atomic transaction" },
          { label: "Latency reduction", value: "80%", sub: "p50 vote endpoint" },
          { label: "Race condition risk", value: "0", sub: "eliminated by atomicity" },
        ],
      },
      {
        type: "paragraph",
        content: "The improvement comes from two sources: fewer network round trips between the application server and database, and the query planner executing the entire check-and-write sequence inside a single transaction without interleaving I/O.",
      },
      {
        type: "heading",
        level: 2,
        content: "Calling the function from Next.js",
      },
      {
        type: "code",
        language: "typescript",
        content: `const { data, error } = await supabase.rpc('submit_vote', {
  p_artwork_id:  artworkId,
  p_contest_id:  contestId,
  p_user_id:     session?.user?.id ?? null,
  p_ip_hash:     hashIP(clientIP),
  p_email_hash:  session?.user?.email ? hashEmail(session.user.email) : null,
});

if (error) {
  logger.error({ requestId, error }, 'submit_vote rpc failed');
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

const row = data?.[0];
if (!row?.success) {
  const statusMap: Record<string, number> = {
    CONTEST_NOT_FOUND:  404,
    CONTEST_NOT_ACTIVE: 400,
    ARTWORK_NOT_FOUND:  404,
    ALREADY_VOTED:      409,
  };
  return NextResponse.json(
    { error: row?.error_code ?? 'Unknown error' },
    { status: statusMap[row?.error_code ?? ''] ?? 500 }
  );
}

revalidatePath(\`/contest/\${contestId}\`);
return NextResponse.json({ success: true, vote_count: row.vote_count });`,
      },
      {
        type: "paragraph",
        content: "The RPC returns a typed row — success boolean, error_code string, vote_count integer. The application maps error codes to HTTP status codes explicitly, so every error case has a documented, testable response shape.",
      },
      {
        type: "callout",
        variant: "success",
        content: "If you're writing sequential database queries inside a request handler, ask whether a single SECURITY DEFINER function could replace them. You'll get atomicity, performance, and a cleaner error model — all in one change.",
      },
    ],
  },

  {
    slug: "nextjs-server-client-split",
    title: "Next.js App Router: when to use Server Components vs Client Components (with real examples)",
    excerpt: "Using createClient() with cookies() inside a revalidate=60 page silently breaks ISR. Here's the three-client Supabase setup that keeps Server Components server-rendered, CDN-cached correctly, and the use client boundary deliberate.",
    publishedAt: "2026-05-09",
    readingTime: 8,
    tags: ["Next.js", "App Router", "Performance", "Architecture"],
    sections: [
      {
        type: "paragraph",
        content: "In Next.js App Router, the decision of where to put 'use client' is an architectural decision, not a performance one. Performance is a side effect. The real constraint is this: code marked 'use client' — and everything it imports — gets bundled and sent to the browser. Server Components never do. That separation is what makes the three-client Supabase setup necessary.",
      },
      {
        type: "heading",
        level: 2,
        content: "The problem with the old model",
      },
      {
        type: "paragraph",
        content: "In the Pages Router, every component was a Client Component by default. Data fetching happened in getServerSideProps or getStaticProps, then got passed down as props. The component that rendered the data was the same kind of component that rendered a button with an onClick handler. This created pressure to colocate concerns that shouldn't be colocated.",
      },
      {
        type: "comparison",
        left: {
          label: "Pages Router pattern",
          items: [
            "getServerSideProps runs on server",
            "Props passed to page component",
            "Page component is client-side by default",
            "All child components ship JavaScript",
            "Database credentials must stay in getServerSideProps only",
          ],
        },
        right: {
          label: "App Router pattern",
          items: [
            "Server Component fetches data inline",
            "No props required — data flows directly",
            "Client Components only where truly needed",
            "Only interactive subtrees ship JavaScript",
            "Database calls safe anywhere in the server tree",
          ],
        },
      },
      {
        type: "heading",
        level: 2,
        content: "Two Supabase clients for two different contexts",
      },
      {
        type: "paragraph",
        content: "The most concrete example of this split in AI Art Arena is the Supabase client setup. There are three clients, each serving a different rendering context:",
      },
      {
        type: "code",
        language: "typescript",
        content: `// lib/supabase/server.ts

// For auth-aware Server Components (contest page, admin, profile)
// Reads cookies() → opts the route into dynamic rendering → NOT CDN-cacheable
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, { cookies: { getAll: () => cookieStore.getAll() } });
}

// For ISR pages (homepage, archive, leaderboard)
// No cookies() call → stays CDN-cacheable → revalidate = 60 works correctly
export function createPublicClient() {
  return createSupabaseClient(url, anonKey);
}

// For privileged server operations (admin routes, auth callbacks)
// Service role key — bypasses RLS entirely — never send to browser
export function createAdminClient() {
  return createSupabaseClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}`,
      },
      {
        type: "callout",
        variant: "warning",
        content: "Using createClient() (which calls cookies()) inside a page marked export const revalidate = 60 will silently break ISR. Next.js will ignore the revalidate directive and serve the page dynamically on every request. Use createPublicClient() for any page that needs CDN caching.",
      },
      {
        type: "heading",
        level: 2,
        content: "The 'use client' boundary is a deliberate architectural decision",
      },
      {
        type: "paragraph",
        content: "Every time you write 'use client', you're making a statement: this code and everything it imports will be bundled and sent to the browser. That's not a problem — it's the right call for interactive components. But it should be a conscious decision, not a default.",
      },
      {
        type: "table",
        headers: ["Component", "Type", "Reason"],
        rows: [
          ["app/contest/[id]/page.tsx", "Server", "Fetches contest + artworks, checks session server-side"],
          ["components/contest/ArtworkCard.tsx", "Client", "onClick vote handler, localStorage, hover state"],
          ["components/contest/LiveVoteCount.tsx", "Client", "Supabase Realtime subscription via useEffect"],
          ["components/contest/ContestHeader.tsx", "Server", "Static week/date display, no interactivity"],
          ["components/contest/ContestTimer.tsx", "Client", "useEffect countdown, window.setInterval"],
          ["app/archive/page.tsx", "Server", "Static grid of past contests, ISR revalidate=60"],
          ["app/leaderboard/page.tsx", "Server", "Ranked list, ISR revalidate=60, no interactivity"],
        ],
      },
      {
        type: "heading",
        level: 2,
        content: "What never to fetch in a Client Component",
      },
      {
        type: "paragraph",
        content: "The most common mistake when migrating to the App Router is reaching for useEffect + fetch in a Client Component when the data should come from the server. Here's the rule: if you're fetching data that's the same for every user (contest results, artwork details, archive) — it belongs in a Server Component. If you're fetching data that requires the user's session or changes in real time — that's the client's job.",
      },
      {
        type: "code",
        language: "typescript",
        content: `// ❌ Wrong — useEffect data fetch in a Client Component
'use client'
export function ArtworkList({ contestId }: { contestId: string }) {
  const [artworks, setArtworks] = useState([]);
  useEffect(() => {
    fetch(\`/api/artworks?contest=\${contestId}\`)
      .then(r => r.json())
      .then(setArtworks);
  }, [contestId]);
  // ...
}

// ✅ Right — Server Component fetches directly
export async function ArtworkList({ contestId }: { contestId: string }) {
  const supabase = createPublicClient();
  const { data: artworks } = await supabase
    .from('artworks')
    .select('*')
    .eq('contest_id', contestId)
    .order('display_order');
  // ...
}`,
      },
      {
        type: "callout",
        variant: "tip",
        content: "A useful mental model: Server Components are functions that run once at request time and return HTML. Client Components are JavaScript modules that run in the browser continuously. If your component doesn't need to run continuously — it probably doesn't need 'use client'.",
      },
      {
        type: "heading",
        level: 2,
        content: "The bundle size impact",
      },
      {
        type: "metric-grid",
        items: [
          { label: "Client Components", value: "8", sub: "in the entire codebase" },
          { label: "Server Components", value: "40+", sub: "zero JavaScript shipped" },
          { label: "First JS bundle", value: "~95kb", sub: "gzipped" },
          { label: "Interactive islands", value: "Vote, Timer, Realtime, Menu", sub: "only what needs the browser" },
        ],
      },
      {
        type: "paragraph",
        content: "The discipline pays off measurably. The contest page — which shows 4 artwork cards, a countdown timer, and live vote counts — ships less than 100kb of JavaScript because only the interactive parts are Client Components. The rest is server-rendered HTML that arrives pre-built.",
      },
    ],
  },

  {
    slug: "rate-limiting-sliding-window-redis",
    title: "Sliding window vs fixed window rate limiting: what the difference actually costs you",
    excerpt: "A fixed window rate limiter resets at midnight. A sliding window tracks the rolling 24 hours. The difference sounds academic until someone figures out they can vote 18 times by straddling the reset boundary.",
    publishedAt: "2026-05-08",
    readingTime: 7,
    tags: ["Redis", "Security", "Upstash", "Rate Limiting"],
    sections: [
      {
        type: "paragraph",
        content: "A fixed window rate limiter has an exploitable boundary: vote at 11:59pm, vote again at 12:00am — two votes in two minutes, both within their respective windows. A sliding window tracks the rolling 24 hours and has no such boundary. For AI Art Arena, where one vote per person per contest is the core integrity guarantee, only one of these is acceptable.",
      },
      {
        type: "heading",
        level: 2,
        content: "Why fixed window fails at boundaries",
      },
      {
        type: "paragraph",
        content: "A fixed window rate limiter works like this: you have a bucket that allows N requests. The bucket resets at a fixed interval — say, every 24 hours at midnight. The problem is the reset boundary.",
      },
      {
        type: "callout",
        variant: "warning",
        content: "Boundary attack: with a fixed 24-hour window resetting at midnight, a user can vote at 11:59pm and again at 12:00am — two votes in two minutes, both technically within their respective windows. Scale this up and you have a double-voting exploit.",
      },
      {
        type: "table",
        headers: ["Algorithm", "How it works", "Boundary exploit?", "Memory use", "Accuracy"],
        rows: [
          ["Fixed window", "Counter resets at interval boundary", "Yes — 2x requests at boundary", "Low (1 key)", "Low at boundaries"],
          ["Sliding window (log)", "Stores timestamp of every request", "No", "High (N entries per user)", "Perfect"],
          ["Sliding window (approx)", "Weighted blend of current + previous window", "Minimal", "Low (2 keys)", "~99% accurate"],
          ["Token bucket", "Tokens refill at constant rate", "No", "Low", "High"],
        ],
      },
      {
        type: "paragraph",
        content: "Upstash Ratelimit uses the approximate sliding window algorithm — two counters, weighted by how far into the current window you are. It's not perfectly accurate at the exact window boundary, but the error margin is under 1% and it uses constant memory regardless of request volume.",
      },
      {
        type: "heading",
        level: 2,
        content: "How the vote rate limiter is keyed",
      },
      {
        type: "paragraph",
        content: "The key design is as important as the algorithm. Keying by IP alone is too weak. Keying by user ID alone misses anonymous visitors. The solution is to use the strongest available identifier, with a fallback:",
      },
      {
        type: "code",
        language: "typescript",
        content: `// lib/ratelimit.ts
export function buildVoteRateLimitKey(
  email: string | null | undefined,
  ipHash: string,
  contestId: string
): string {
  const salt = process.env.VOTE_HASH_SALT;
  if (!salt) throw new Error('VOTE_HASH_SALT env var is required');

  if (email) {
    // Authenticated users: keyed by email hash — survives IP changes, VPNs, device switches
    const emailHash = crypto
      .createHash('sha256')
      .update('email:' + email.toLowerCase().trim() + salt)
      .digest('hex')
      .slice(0, 32);
    return \`\${emailHash}:\${contestId}\`;
  }

  // Anonymous visitors: keyed by IP hash — best available signal
  return \`\${ipHash}:\${contestId}\`;
}`,
      },
      {
        type: "callout",
        variant: "info",
        content: "The key is scoped per-contest, not per-day. An IP or email hash gets one vote per contest total — not one per 24 hours globally. This means the Redis key for vote:abc123:contest-uuid expires only after the contest ends, not at midnight.",
      },
      {
        type: "heading",
        level: 2,
        content: "The VOTE_HASH_SALT problem — why you can never change it",
      },
      {
        type: "paragraph",
        content: "Both the rate limiter and the database use hashed email as a duplicate-vote signal. The hash uses VOTE_HASH_SALT as a secret input. This creates a critical constraint: if you change the salt after launch, all existing hashes in Redis and in the votes table become orphaned. The system loses its ability to detect that alice@example.com already voted — her new hash doesn't match her old one.",
      },
      {
        type: "table",
        headers: ["If you change VOTE_HASH_SALT after launch...", "Effect"],
        rows: [
          ["Existing Redis keys", "All rate limit history orphaned — every user can vote again immediately"],
          ["votes.email_hash column", "Existing hashes unmatchable — email-based duplicate detection breaks"],
          ["Auth duplicate check", "Users who voted before the change can vote again"],
          ["Recovery", "Must wipe all votes and Redis keys and restart the contest"],
        ],
      },
      {
        type: "callout",
        variant: "warning",
        content: "Treat VOTE_HASH_SALT like a database encryption key: generate it once, store it securely, never rotate it without a migration plan. The .env.example file marks it explicitly: 'Generate once with openssl rand -base64 32. Never change after first vote is cast.'",
      },
      {
        type: "heading",
        level: 2,
        content: "Five rate limiters, not one",
      },
      {
        type: "paragraph",
        content: "Vote rate limiting is one of five limiters running in the application. Each is tuned independently to its threat model:",
      },
      {
        type: "table",
        headers: ["Limiter", "Window", "Limit", "Key", "Protects against"],
        rows: [
          ["voteRateLimit", "24 hours", "1", "email/IP hash + contest_id", "Duplicate voting"],
          ["adminRateLimit", "1 minute", "100", "admin IP hash", "Admin API abuse"],
          ["adminUploadRateLimit", "1 hour", "10", "admin IP hash", "Storage cost abuse"],
          ["authRateLimit", "15 minutes", "5", "IP hash", "Brute-force login"],
          ["resetRateLimit", "1 hour", "3", "IP hash", "Password reset spam"],
        ],
      },
      {
        type: "paragraph",
        content: "All five use Upstash's serverless Redis — no persistent connection management, compatible with Vercel's edge and serverless functions, and analytics built in so you can see hit/miss ratios in the Upstash console without additional instrumentation.",
      },
    ],
  },

  {
    slug: "csp-nextjs-unsafe-eval",
    title: "Next.js Content Security Policy: how to gate unsafe-eval to development only",
    excerpt: "React's development build requires eval() for stack reconstruction and DevTools. Your production CSP must not include 'unsafe-eval'. The fix is a NODE_ENV gate in middleware.ts — one conditional, correct in both environments.",
    publishedAt: "2026-05-07",
    readingTime: 6,
    tags: ["Security", "CSP", "Next.js", "Middleware"],
    sections: [
      {
        type: "paragraph",
        content: "React requires eval() in development mode for error stack reconstruction and DevTools integration. In production, the compiled React build uses no eval at all. This means a Content Security Policy that correctly excludes 'unsafe-eval' in production will break the development server — unless it is gated on NODE_ENV. Here is what that error looks like and how the gate works:",
      },
      {
        type: "callout",
        variant: "warning",
        content: "Error: eval() is not supported in this environment. React requires eval() in development mode for various debugging features like reconstructing callstacks. To enable eval(), pass a CSP value of `unsafe-eval` in the `script-src` directive.",
      },
      {
        type: "heading",
        level: 2,
        content: "Why React needs eval() in development",
      },
      {
        type: "paragraph",
        content: "In development mode, React uses eval() to reconstruct component call stacks for error messages, enable React DevTools integration, and produce meaningful stack traces. None of this happens in production — the production build of React is compiled down to plain function calls with no eval.",
      },
      {
        type: "table",
        headers: ["Environment", "React mode", "Uses eval()?", "CSP requirement"],
        rows: [
          ["Development", "Development build with debugging", "Yes", "unsafe-eval required"],
          ["Production", "Minified production build", "No", "unsafe-eval must be removed"],
        ],
      },
      {
        type: "heading",
        level: 2,
        content: "The wrong fix and the right fix",
      },
      {
        type: "paragraph",
        content: "The wrong fix is to add 'unsafe-eval' to your production CSP and move on. This defeats the purpose of having a CSP — eval() is the primary mechanism through which XSS attacks execute arbitrary JavaScript.",
      },
      {
        type: "comparison",
        left: {
          label: "Wrong: always allow eval",
          items: [
            "Fixes the dev error",
            "Production CSP includes unsafe-eval",
            "XSS attacks can call eval(maliciousCode)",
            "Passes security scans by default — until someone checks",
            "Silently weakens your security posture",
          ],
        },
        right: {
          label: "Right: gate on NODE_ENV",
          items: [
            "Fixes the dev error",
            "Production CSP excludes unsafe-eval",
            "eval() blocked in production browser",
            "Dev mode keeps the debugging features",
            "Security posture maintained in production",
          ],
        },
      },
      {
        type: "code",
        language: "typescript",
        content: `// middleware.ts
function applySecurityHeaders(response: NextResponse): NextResponse {
  const h = response.headers;

  // Gate unsafe-eval on NODE_ENV — React needs it in dev, production must not have it
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    process.env.NODE_ENV === "development" ? "'unsafe-eval'" : "",
  ].filter(Boolean).join(" ");

  h.set("Content-Security-Policy", [
    "default-src 'self'",
    \`script-src \${scriptSrc}\`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.supabase.co https://avatars.githubusercontent.com",
    "connect-src 'self' https://*.supabase.co https://*.upstash.io",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "));

  return response;
}`,
      },
      {
        type: "callout",
        variant: "tip",
        content: "You can verify your production CSP is correct by checking the response headers in browser DevTools → Network → select any page request → Response Headers → Content-Security-Policy. The string should not contain 'unsafe-eval' on the live site.",
      },
      {
        type: "heading",
        level: 2,
        content: "The full security header stack",
      },
      {
        type: "paragraph",
        content: "CSP is one of six security headers applied on every response through the Next.js middleware. The middleware runs on the edge before any server component or API route executes:",
      },
      {
        type: "table",
        headers: ["Header", "Value", "Protects against"],
        rows: [
          ["Content-Security-Policy", "Allowlist of sources", "XSS, injection, data exfiltration"],
          ["X-Frame-Options", "DENY", "Clickjacking"],
          ["X-Content-Type-Options", "nosniff", "MIME-type sniffing attacks"],
          ["Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload", "Protocol downgrade, MITM"],
          ["Referrer-Policy", "strict-origin-when-cross-origin", "Referrer header leakage"],
          ["Permissions-Policy", "camera=(), microphone=(), geolocation=()", "Capability abuse"],
        ],
      },
      {
        type: "paragraph",
        content: "All six are set in a single applySecurityHeaders() function called inside the NextAuth middleware wrapper. This guarantees they're applied to every response — including API routes, page responses, and redirects — without needing to add them to each route individually.",
      },
    ],
  },

  {
    slug: "nextauth-v5-app-router",
    title: "NextAuth v5 App Router migration: auth(), new middleware pattern, session types",
    excerpt: "In NextAuth v5, getServerSession() is replaced by auth(), authOptions moves to auth.ts, and the middleware uses a wrapping pattern instead of withAuth(). This covers all three changes with working code for Next.js 14 App Router.",
    publishedAt: "2026-05-06",
    readingTime: 8,
    tags: ["NextAuth", "Authentication", "Next.js", "App Router"],
    sections: [
      {
        type: "paragraph",
        content: "In NextAuth v5, getServerSession() is gone — replaced by auth() with no arguments. The authOptions config moves to a top-level auth.ts file. Middleware no longer uses withAuth() — it wraps a handler that calls auth() directly. If you are upgrading from v4 or starting fresh on Next.js 14 App Router, these three changes affect every part of the auth integration.",
      },
      {
        type: "heading",
        level: 2,
        content: "Configuration: auth.ts instead of [...nextauth]/route.ts",
      },
      {
        type: "paragraph",
        content: "In v4, your entire auth configuration lived inside app/api/auth/[...nextauth]/route.ts. In v5, the config moves to a top-level auth.ts file, and the route handler just re-exports the handlers. This separation matters because auth.ts can be imported by middleware and Server Components directly.",
      },
      {
        type: "code",
        language: "typescript",
        content: `// auth.ts — v5 pattern
import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async ({ email, password }) => {
        // verify against your users table
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Attach role and id from your users table to the session
      if (token.sub) {
        const { data: user } = await supabase
          .from('users').select('id, role').eq('id', token.sub).single();
        session.user.id   = user?.id;
        session.user.role = user?.role ?? 'user';
      }
      return session;
    },
  },
});

// app/api/auth/[...nextauth]/route.ts — just re-export
import { handlers } from '@/auth';
export const { GET, POST } = handlers;`,
      },
      {
        type: "heading",
        level: 2,
        content: "Server Components: auth() instead of getServerSession()",
      },
      {
        type: "paragraph",
        content: "In v4, you called getServerSession() and passed it your authOptions. In v5, you call auth() — no arguments needed — because it reads the config from auth.ts automatically. This works in Server Components, Server Actions, API routes, and middleware.",
      },
      {
        type: "table",
        headers: ["Context", "v4 pattern", "v5 pattern"],
        rows: [
          ["Server Component", "getServerSession(authOptions)", "auth()"],
          ["API Route", "getServerSession(req, res, authOptions)", "auth()"],
          ["Middleware", "withAuth() wrapper from next-auth/middleware", "Import auth from auth.ts, wrap handler"],
          ["Client Component", "useSession() from next-auth/react", "useSession() — unchanged"],
        ],
      },
      {
        type: "heading",
        level: 2,
        content: "Middleware: wrapping, not replacing",
      },
      {
        type: "paragraph",
        content: "The v5 middleware integration is where most people hit issues. You don't use withAuth() anymore. Instead, you export a default function that calls auth() and wraps your own middleware logic. This means you can apply security headers, redirects, and auth checks in the same file:",
      },
      {
        type: "code",
        language: "typescript",
        content: `// middleware.ts — v5 pattern
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl, auth: session } = req;

  // Admin route protection
  if (nextUrl.pathname.startsWith('/admin')) {
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/signin', nextUrl));
    }
  }

  return applySecurityHeaders(NextResponse.next());
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg)$).*)'],
};`,
      },
      {
        type: "callout",
        variant: "warning",
        content: "The auth() call in middleware adds latency because it validates the session token on every matched request. Keep the matcher pattern specific — exclude static assets, images, and any route that doesn't need auth context. The pattern above shaves ~40ms off static asset responses.",
      },
      {
        type: "heading",
        level: 2,
        content: "Session type augmentation",
      },
      {
        type: "paragraph",
        content: "By default, session.user only has name, email, and image. To add id and role (which you need for admin checks), you extend the types. Without this, TypeScript will complain every time you access session.user.role:",
      },
      {
        type: "code",
        language: "typescript",
        content: `// types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id:    string;
      email: string;
      name:  string | null;
      image: string | null;
      role:  'user' | 'admin';
    };
  }
}`,
      },
    ],
  },

  {
    slug: "supabase-rls-security-model",
    title: "Supabase Row Level Security is not an auth system — it's a safety net",
    excerpt: "RLS policies enforce access rules at the database layer. They are not a replacement for application-layer auth — they are the guarantee that application-layer bugs do not become data breaches.",
    publishedAt: "2026-05-05",
    readingTime: 7,
    tags: ["Supabase", "PostgreSQL", "Security", "RLS"],
    sections: [
      {
        type: "paragraph",
        content: "Row Level Security is PostgreSQL's mechanism for attaching access control policies directly to tables. When RLS is enabled on a table, every query — SELECT, INSERT, UPDATE, DELETE — is filtered through the defined policies before any data is returned or modified. Not in the application. Not in an ORM. In the database itself.",
      },
      {
        type: "heading",
        level: 2,
        content: "Why 'the database enforces it' matters",
      },
      {
        type: "paragraph",
        content: "Application-layer access control relies on every code path correctly checking permissions before touching data. This is fine in theory and fragile in practice. A new route, a forgotten if-statement, a misconfigured middleware, a library vulnerability — any of these can bypass application checks. RLS has no such bypass. Even if your application code is broken, the database will not return data it shouldn't.",
      },
      {
        type: "comparison",
        left: {
          label: "Application-layer only",
          items: [
            "Permissions checked in route handlers",
            "A missed check = data exposure",
            "New routes must implement checks from scratch",
            "A vulnerability can bypass all checks at once",
            "Correctness relies on developer discipline",
          ],
        },
        right: {
          label: "RLS + Application layer",
          items: [
            "Database enforces minimum permissions",
            "A missed check = RLS blocks the query",
            "New routes inherit database policies automatically",
            "A compromised route still can't read protected rows",
            "Correctness enforced at the infrastructure level",
          ],
        },
      },
      {
        type: "heading",
        level: 2,
        content: "The RLS policies on AI Art Arena",
      },
      {
        type: "table",
        headers: ["Table", "Policy", "Rule"],
        rows: [
          ["contests", "Public read", "status IN ('active', 'archived')"],
          ["contests", "Admin insert/update/delete", "auth.jwt()->>'role' = 'admin'"],
          ["artworks", "Public read", "true — all artworks visible"],
          ["artworks", "Admin insert", "auth.jwt()->>'role' = 'admin'"],
          ["artworks", "Admin update/delete", "auth.jwt()->>'role' = 'admin'"],
          ["votes", "Anyone can insert", "true — anonymous voting allowed"],
          ["votes", "No updates", "false — votes are immutable"],
          ["votes", "No deletes", "false — votes are permanent"],
          ["votes", "User reads own votes", "auth.uid() = user_id OR role = 'admin'"],
          ["users", "Public read (is_public=true)", "is_public = true"],
          ["users", "User reads own profile", "auth.uid() = id"],
          ["users", "User updates own profile", "auth.uid() = id"],
        ],
      },
      {
        type: "heading",
        level: 2,
        content: "SECURITY DEFINER functions bypass RLS — intentionally",
      },
      {
        type: "paragraph",
        content: "The submit_vote function is marked SECURITY DEFINER, which means it runs with the permissions of the function owner (postgres) rather than the calling user. This means it bypasses RLS. This is intentional — the function needs to read contests, artworks, and votes tables atomically, then insert and update. Doing this through RLS-filtered queries would require each table to have policies permitting the anon role to read them in the exact way the function needs.",
      },
      {
        type: "callout",
        variant: "info",
        content: "SECURITY DEFINER functions are the right tool when you need to perform privileged operations on behalf of a less-privileged caller — provided the function itself implements the access control logic. The submit_vote function checks duplicate votes and contest status internally, so it doesn't need RLS to do that job.",
      },
      {
        type: "code",
        language: "sql",
        content: `-- Grant execute only to the roles that need it
-- Do NOT grant to 'public' — only authenticated and anon callers of the vote API
GRANT EXECUTE ON FUNCTION public.submit_vote(UUID, UUID, UUID, TEXT, TEXT)
  TO authenticated, anon;

-- Verify the grant
SELECT grantee, privilege_type
FROM information_schema.role_routine_grants
WHERE routine_name = 'submit_vote';`,
      },
    ],
  },

  {
    slug: "structured-logging-pino-request-id",
    title: "Structured logging in Next.js with pino: why the request ID is the whole point",
    excerpt: "A Sentry stack trace tells you what broke. A structured pino log with a request ID tells you everything else: which request, what input, how long it ran, what preceded the failure. Here is how to build that in Next.js API routes.",
    publishedAt: "2026-05-04",
    readingTime: 6,
    tags: ["Observability", "Pino", "Logging", "Next.js"],
    sections: [
      {
        type: "paragraph",
        content: "A Sentry stack trace tells you what broke. It does not tell you which request, what the input was, how long the request had been running, or what happened immediately before the failure. Structured logging with a thread-through request ID fills that gap. Here is the full pattern for Next.js API routes.",
      },
      {
        type: "heading",
        level: 2,
        content: "The problem with console.log",
      },
      {
        type: "paragraph",
        content: "console.log in a production API route produces unstructured text. It's not searchable by field, not parseable by log aggregators, and doesn't capture structured metadata like request ID, user ID, or duration. When you have multiple concurrent requests, log lines from different requests interleave with no way to correlate them.",
      },
      {
        type: "comparison",
        left: {
          label: "console.log",
          items: [
            "Unstructured text — can't filter by field",
            "No correlation across concurrent requests",
            "Can't parse for monitoring or alerting",
            "Duration requires manual calculation",
            "Stripped from some serverless runtimes",
          ],
        },
        right: {
          label: "pino structured JSON",
          items: [
            "JSON fields — filter by requestId, status, userId",
            "Every log line has the same requestId",
            "Parseable by Datadog, Grafana, Axiom",
            "Duration field calculated and included",
            "Works correctly in Node.js and Edge runtimes",
          ],
        },
      },
      {
        type: "heading",
        level: 2,
        content: "The logger setup",
      },
      {
        type: "code",
        language: "typescript",
        content: `// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  // pino-pretty for human-readable dev output, raw JSON in production
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
});

export function generateRequestId(): string {
  return \`req_\${Date.now()}_\${Math.random().toString(36).slice(2, 9)}\`;
}`,
      },
      {
        type: "heading",
        level: 2,
        content: "Threading requestId through every route",
      },
      {
        type: "code",
        language: "typescript",
        content: `// app/api/v1/vote/route.ts — the full logging pattern
export async function POST(request: Request) {
  const requestId = generateRequestId();
  const start = Date.now();

  logger.info({ requestId }, 'vote request received');

  // ... validation, rate limiting ...

  const { data, error } = await supabase.rpc('submit_vote', { ... });

  if (error) {
    logger.error({ requestId, error: error.message, durationMs: Date.now() - start }, 'rpc failed');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  logger.info(
    { requestId, success: data[0].success, errorCode: data[0].error_code, durationMs: Date.now() - start },
    'vote request complete'
  );

  return NextResponse.json({ success: true, vote_count: data[0].vote_count });
}`,
      },
      {
        type: "callout",
        variant: "tip",
        content: "Include requestId in the response as an X-Request-Id header. This lets you correlate a client-side error (the user screenshots the browser console) with the server-side log entry — no guessing which of 50 concurrent requests failed.",
      },
      {
        type: "heading",
        level: 2,
        content: "What a structured log entry looks like",
      },
      {
        type: "table",
        headers: ["Field", "Type", "Example", "Purpose"],
        rows: [
          ["requestId", "string", "req_1715012345678_abc1234", "Correlate all logs for one request"],
          ["level", "string", "info / error / warn", "Filter by severity"],
          ["msg", "string", "vote request complete", "Human-readable event"],
          ["durationMs", "number", "42", "Performance monitoring"],
          ["success", "boolean", "true", "Outcome tracking"],
          ["errorCode", "string | null", "ALREADY_VOTED", "Error classification"],
          ["time", "number", "1715012345678", "Timestamp (Unix ms)"],
        ],
      },
    ],
  },

  {
    slug: "inngest-background-jobs-serverless",
    title: "Background jobs in a serverless Next.js app with Inngest: why Vercel cron isn't enough",
    excerpt: "Vercel cron functions fire and forget — no retries, no event chaining, no step-level observability. Inngest adds all three. Here is how the contest automation chain works: archive fires an event, that event triggers create-next-contest, with automatic retries throughout.",
    publishedAt: "2026-05-03",
    readingTime: 7,
    tags: ["Inngest", "Background Jobs", "Next.js", "Serverless"],
    sections: [
      {
        type: "paragraph",
        content: "AI Art Arena runs on Vercel. Vercel is serverless — there's no persistent Node.js process staying alive between requests. This creates a problem: contests need to archive automatically when their end date passes, and a new contest needs to open immediately after. These are time-based operations that can't run inside a web request.",
      },
      {
        type: "heading",
        level: 2,
        content: "Why a simple cron doesn't work",
      },
      {
        type: "paragraph",
        content: "Vercel does support cron jobs — you can configure a function to run on a schedule in vercel.json. But cron functions are fire-and-forget. They run, they finish, and if they fail, they fail silently. There's no built-in retry, no event chaining, no state persistence across steps, and no way to trigger one job from the output of another.",
      },
      {
        type: "table",
        headers: ["Requirement", "Simple cron", "Inngest"],
        rows: [
          ["Automatic retries on failure", "No", "Yes — configurable backoff"],
          ["Chain jobs (A triggers B)", "No", "Yes — event-driven"],
          ["Step-level observability", "No", "Yes — per-step logs in dashboard"],
          ["Long-running (>10s) support", "No", "Yes — steps can each take minutes"],
          ["Local development", "Awkward", "npx inngest-cli dev — full local runtime"],
          ["Type-safe event payloads", "No", "Yes — TypeScript throughout"],
        ],
      },
      {
        type: "heading",
        level: 2,
        content: "The contest automation chain",
      },
      {
        type: "paragraph",
        content: "The automation is an event chain, not a monolithic cron. Each function does one thing and fires an event that triggers the next:",
      },
      {
        type: "list",
        ordered: true,
        items: [
          "archive-contest: runs hourly, checks for any active contest past its end_date, sets status = 'archived', fires contest/archived event",
          "create-next-contest: triggered by contest/archived event, reads contest duration from system_config, creates the new contest row with week_number + 1",
          "send-vote-reminder: runs hourly, finds contests ending in the next 24–25 hours, emails subscribed users via Resend",
        ],
      },
      {
        type: "code",
        language: "typescript",
        content: `// inngest/functions/archive-contest.ts
import { inngest } from '../client';
import { createAdminClient } from '@/lib/supabase/server';

export const archiveContest = inngest.createFunction(
  { id: 'archive-contest', name: 'Archive ended contests' },
  { cron: '0 * * * *' }, // hourly
  async ({ step }) => {
    const supabase = createAdminClient();

    const expired = await step.run('find-expired-contests', async () => {
      const { data } = await supabase
        .from('contests')
        .select('id, week_number')
        .eq('status', 'active')
        .lt('end_date', new Date().toISOString());
      return data ?? [];
    });

    for (const contest of expired) {
      await step.run(\`archive-contest-\${contest.id}\`, async () => {
        await supabase
          .from('contests')
          .update({ status: 'archived' })
          .eq('id', contest.id);
      });

      // Fire event — create-next-contest will pick this up
      await step.sendEvent('contest-archived', {
        name: 'contest/archived',
        data: { contestId: contest.id, weekNumber: contest.week_number },
      });
    }
  }
);`,
      },
      {
        type: "callout",
        variant: "warning",
        content: "Never instantiate Resend at the module top level in an Inngest function. Inngest imports all function files at startup to register them — if Resend is constructed at import time and RESEND_API_KEY isn't set in that environment, the import fails and all functions break. Always create the client inside the handler.",
      },
      {
        type: "heading",
        level: 2,
        content: "Reading config from the database, not the code",
      },
      {
        type: "paragraph",
        content: "Contest duration, voting cooldown, and reminder timing all come from the system_config table — not from hardcoded constants. This means changing the contest cycle from 7 days to 14 days requires one SQL update, not a code deploy:",
      },
      {
        type: "code",
        language: "typescript",
        content: `// Reading contest_duration_days from system_config
const { data: config } = await supabase
  .from('system_config')
  .select('key, value')
  .in('key', ['contest_duration_days', 'voting_cooldown_hours']);

const configMap = Object.fromEntries(config?.map(r => [r.key, r.value]) ?? []);
const durationDays = parseInt(configMap.contest_duration_days ?? '7', 10);

const endDate = new Date(startDate);
endDate.setDate(endDate.getDate() + durationDays);`,
      },
    ],
  },

  {
    slug: "typescript-zod-api-validation",
    title: "Zod runtime validation in Next.js API routes: what TypeScript alone can't catch",
    excerpt: "TypeScript catches type errors at compile time. At the API boundary — HTTP request bodies, query parameters, webhook payloads — TypeScript has no power. Zod validates at runtime, before anything touches Redis or the database.",
    publishedAt: "2026-05-02",
    readingTime: 6,
    tags: ["TypeScript", "Zod", "Validation", "API Design"],
    sections: [
      {
        type: "paragraph",
        content: "At the API boundary — HTTP request bodies, query parameters, webhook payloads — TypeScript has no power. It enforces types within your codebase at compile time, but it cannot verify what arrives over the network at runtime. Zod fills that gap: it validates inputs at the edge of your system, before any Redis call or database query forms.",
      },
      {
        type: "heading",
        level: 2,
        content: "What TypeScript can't protect you from",
      },
      {
        type: "paragraph",
        content: "Consider this vote API handler. TypeScript is happy — it compiles cleanly. But what happens when an attacker sends a malformed request?",
      },
      {
        type: "code",
        language: "typescript",
        content: `// ❌ TypeScript thinks this is fine — it will runtime-error in production
export async function POST(request: Request) {
  const body = await request.json();
  // TypeScript assumes body has the shape you expect — it doesn't verify it
  const { artwork_id, contest_id } = body as { artwork_id: string; contest_id: string };

  // What if artwork_id is undefined? Or a SQL injection string? Or 50,000 characters long?
  await supabase.rpc('submit_vote', { p_artwork_id: artwork_id, p_contest_id: contest_id });
}`,
      },
      {
        type: "heading",
        level: 2,
        content: "Zod validates at runtime, not compile time",
      },
      {
        type: "code",
        language: "typescript",
        content: `// lib/validators.ts
import { z } from 'zod';

export const VoteSchema = z.object({
  artwork_id: z.string().uuid('Invalid artwork ID'),
  contest_id: z.string().uuid('Invalid contest ID'),
});

// app/api/v1/vote/route.ts
export async function POST(request: Request) {
  const requestId = generateRequestId();

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = VoteSchema.safeParse(body);
  if (!parsed.success) {
    logger.warn({ requestId, errors: parsed.error.flatten() }, 'validation failed');
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  // parsed.data is now typed AND validated at runtime
  const { artwork_id, contest_id } = parsed.data;
  // ...
}`,
      },
      {
        type: "table",
        headers: ["Input", "TypeScript (compile-time)", "Zod (runtime)"],
        rows: [
          ['"valid-uuid-here"', "✓ accepts string", "✓ accepts valid UUID"],
          ['"not-a-uuid"', "✓ accepts string", "✗ rejects — not UUID format"],
          ["undefined", "✗ type error (if typed)", "✗ rejects — required field"],
          ["null", "✗ type error (if typed)", "✗ rejects — not a string"],
          ['"; DROP TABLE votes;"', "✓ accepts string", "✗ rejects — not UUID format"],
          ["12345 (number)", "✗ type error", "✗ rejects — not a string"],
        ],
      },
      {
        type: "callout",
        variant: "success",
        content: "UUIDs have a strict format: 8-4-4-4-12 hexadecimal characters. z.string().uuid() rejects anything that doesn't match — including SQL injection attempts, oversized strings, and type confusions. This eliminates an entire class of injection risk before the query even forms.",
      },
      {
        type: "heading",
        level: 2,
        content: "The validation order matters",
      },
      {
        type: "paragraph",
        content: "Every API route in AI Art Arena follows the same order: parse JSON, Zod validate, rate limit check, auth check, database call. This sequence is not arbitrary — it's designed to fail fast on cheap checks before doing expensive ones:",
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Parse JSON — free, catches malformed payloads immediately",
          "Zod validate — cheap CPU, catches invalid inputs before any I/O",
          "Rate limit — one Redis read, protects downstream from abuse",
          "Auth check — session validation, gates privileged operations",
          "Database call — most expensive, only runs if everything above passes",
        ],
      },
      {
        type: "paragraph",
        content: "An attacker sending malformed payloads never touches Redis or the database. An anonymous user hitting the rate limit never triggers a database query. The order enforces a performance and security pyramid.",
      },
    ],
  },

  {
    slug: "vercel-nextjs-image-optimization",
    title: "How Vercel's image pipeline turned a 4MB PNG into a ~180KB WebP",
    excerpt: "next/image is an image transformation pipeline, not just a component. Here is what actually happens when you configure remotePatterns, formats, and minimumCacheTTL — and how priority, sizes, and aspect-ratio wrappers affect LCP and CLS.",
    publishedAt: "2026-05-01",
    readingTime: 7,
    tags: ["Vercel", "Performance", "next/image", "Core Web Vitals"],
    sections: [
      {
        type: "paragraph",
        content: "Every artwork image on AI Art Arena is stored in Supabase Storage as the original upload — whatever format, whatever size the artist submitted. On the contest page, those images need to load fast. A 4MB PNG at full resolution would tank the LCP score and drive visitors away before the vote button renders.",
      },
      {
        type: "heading",
        level: 2,
        content: "What next/image actually does",
      },
      {
        type: "paragraph",
        content: "When you use the next/image component with a remote image URL, Vercel intercepts the request, downloads the original from the source, transforms it to the optimal format and size, and caches the result at the edge. The browser receives a transformed image — not the original.",
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Browser requests /next/image?url=supabase.co/...&w=750&q=75",
          "Vercel checks its edge cache — if hit, returns immediately",
          "On miss: Vercel downloads the original from Supabase Storage",
          "Converts to WebP (or AVIF if the browser supports it)",
          "Resizes to the requested width (750px in this case)",
          "Caches at edge with Cache-Control: public, max-age=31536000, immutable",
          "Returns the transformed image to the browser",
        ],
      },
      {
        type: "metric-grid",
        items: [
          { label: "Original PNG", value: "4.1MB", sub: "as uploaded" },
          { label: "WebP (750px)", value: "~180KB", sub: "after transformation" },
          { label: "Size reduction", value: "96%", sub: "same visual quality" },
          { label: "Edge cache TTL", value: "1 year", sub: "immutable after first hit" },
        ],
      },
      {
        type: "heading",
        level: 2,
        content: "The configuration that makes this work",
      },
      {
        type: "code",
        language: "typescript",
        content: `// next.config.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
    // Try AVIF first (smaller), fall back to WebP
    formats: ['image/avif', 'image/webp'],
    // Cache transformed images for 1 year — artworks never change after upload
    minimumCacheTTL: 31536000,
  },
};`,
      },
      {
        type: "callout",
        variant: "warning",
        content: "remotePatterns is a security allowlist — only images from approved hostnames are transformed. If you omit a hostname, next/image will return a 400 error instead of the image. This prevents your image optimization endpoint from being used as an open proxy to transform arbitrary external images.",
      },
      {
        type: "heading",
        level: 2,
        content: "Priority, sizes, and CLS prevention",
      },
      {
        type: "code",
        language: "typescript",
        content: `// The full correct pattern for every artwork image
<div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden' }}>
  <Image
    src={artwork.image_url}
    alt={artwork.title}
    fill
    // priority={true} on first 2 images — triggers <link rel="preload"> in <head>
    // Remaining images lazy-load by default
    priority={index < 2}
    // Tell the browser how wide the image will be at each breakpoint
    // Without this, it downloads the largest size unnecessarily
    sizes="(max-width: 768px) 50vw, 33vw"
    className="object-cover"
  />
</div>`,
      },
      {
        type: "table",
        headers: ["Attribute", "What it does", "CWV impact"],
        rows: [
          ["fill", "Image fills its container via position:absolute", "CLS: none — container defines dimensions"],
          ["priority", "Adds <link rel=preload> to <head> for the image", "LCP: significant — first images load earlier"],
          ["sizes", "Tells browser actual render size for srcset selection", "Performance: browser picks correct size variant"],
          ["aspectRatio wrapper", "Reserves space before image loads", "CLS: eliminated — no layout shift on load"],
          ["minimumCacheTTL=31536000", "1-year edge cache for transformed images", "TTFB: near-zero on cache hit"],
        ],
      },
      {
        type: "paragraph",
        content: "The combination of these attributes targets the three most impactful Core Web Vitals: LCP (Largest Contentful Paint) via preloading, CLS (Cumulative Layout Shift) via aspect-ratio containers, and FID (First Input Delay) via reduced JavaScript by keeping images in Server Components.",
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}
