import { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About â€” Oliver | Full Stack Developer | AI Art Arena",
  description:
    "Oliver built AI Art Arena â€” a production Next.js 14 voting platform for AI-generated artwork. Every tool in the stack solved a real problem. Read why each technology was chosen.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About â€” Oliver | Full Stack Developer | AI Art Arena",
    description:
      "A production Next.js 14 + Supabase voting platform built from scratch. Every architectural decision explained: the problem, the solution, and who else solved it the same way.",
    url: `${SITE_URL}/about`,
    siteName: "AI Art Arena",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "AI Art Arena â€” built by Oliver" }],
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "About â€” Oliver | AI Art Arena",
    description:
      "Production Next.js 14 + Supabase voting platform. Every tool in the stack solved a real problem.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

// JSON-LD: Person schema for AEO â€” search engines surface this in AI answers
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Oliver",
  url: SITE_URL,
  jobTitle: "Full Stack Developer",
  description:
    "Self-taught full stack developer. Built AI Art Arena â€” a production Next.js 14 voting platform for AI-generated artwork â€” using PostgreSQL, Supabase, NextAuth, Upstash Redis, Inngest, and Vercel.",
  knowsAbout: [
    "Next.js",
    "TypeScript",
    "PostgreSQL",
    "Supabase",
    "React",
    "Tailwind CSS",
    "Vercel",
    "Redis",
    "NextAuth",
  ],
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `${SITE_URL}/about`,
  },
  worksFor: {
    "@type": "CreativeWork",
    name: "AI Art Arena",
    url: SITE_URL,
    description:
      "A weekly voting contest for AI-generated artwork. One vote per contest, live real-time counts, automated weekly cycling.",
  },
};

const decisions = [
  {
    tech: "Next.js 14",
    problem:
      "I needed a framework that could serve fast, SEO-friendly pages for the contest and archive â€” but still handle real-time interactivity for voting without a full page reload.",
    solution:
      "Next.js App Router let me solve both at once. Archive pages and contest details are Server Components: the HTML is generated on the server, loads instantly, and search engines can index every past contest. The vote button is a Client Component â€” it is the only piece that ships JavaScript to the browser. The rest of the page is pure, fast HTML. That distinction is not just a performance trick. It is an architectural discipline that keeps the codebase clean and the user experience fast.",
    company: "TikTok",
    parallel:
      "TikTok built their web app on Next.js for exactly this reason. The feed is mostly static â€” fast server-rendered HTML. The like button, comments, and share interactions are isolated client components. Same split. Same reasoning. Twitch, Hulu, Nike, and OpenAI made the same call.",
  },
  {
    tech: "Supabase + PostgreSQL",
    problem:
      "The moment I decided users could vote, I had a data problem. I needed to store users, artworks, contests, and votes â€” and the relationships between them. A vote belongs to a user. A user can only cast one vote per contest. An artwork belongs to a contest. I needed a real relational database, not a JSON blob.",
    solution:
      "Supabase gave me PostgreSQL with Row Level Security built in. RLS means the database itself enforces the rules â€” a user cannot read another user's vote history, a user cannot insert a second vote for the same contest, and those constraints live at the database layer, not in application code. On top of that, I wrote a single atomic PostgreSQL function â€” submit_vote â€” that checks contest status, verifies the artwork, detects duplicate votes, inserts the vote row, and increments the vote count in one transaction. What used to be five sequential round trips is one call at ~40ms. No race conditions. No partial writes.",
    company: "Reddit",
    parallel:
      "Reddit denormalizes upvote counts on posts using the same approach â€” maintaining a running count at write time rather than running a COUNT query across all votes on every page load. Mozilla and PwC both run on Supabase. The RLS security model is the same pattern healthcare and fintech companies use because they cannot rely on application code alone to protect sensitive data.",
  },
  {
    tech: "NextAuth v5",
    problem:
      "I needed users to be able to sign in, stay signed in across sessions, and have their identity attached to their votes. I also needed two sign-in methods: GitHub OAuth for developers, and magic link email for everyone else. And I needed session data available on the server â€” not just the browser â€” so Server Components could check who is logged in before rendering.",
    solution:
      "NextAuth v5 handles all of it. OAuth flow, magic link generation and verification, secure session tokens, server-side session access. I did not write authentication from scratch â€” that would be the wrong decision. Authentication is one of the highest-risk areas in any application. Using a battle-tested library and wiring it correctly into the Next.js App Router required real understanding of how sessions flow between server and client.",
    company: "Vercel",
    parallel:
      "Vercel themselves use NextAuth in their documentation examples and internal tooling. It is the authentication standard across the Next.js ecosystem because reinventing auth at the application layer is a security liability. The companies that build their own auth from scratch are the ones that end up in breach headlines.",
  },
  {
    tech: "Upstash Redis",
    problem:
      "Votes had to be limited. Without enforcement, a single person with a script could vote thousands of times in an hour and corrupt every contest result. I also needed protection on authentication â€” limiting failed sign-in attempts to prevent brute force attacks. Application-level checks are not enough because they do not persist across server restarts and do not handle distributed traffic accurately.",
    solution:
      "Upstash gives me serverless Redis â€” a persistent, fast key-value store I can write to from any edge function or API route. I implemented a sliding window rate limiter on the vote endpoint: one vote per IP address per contest per 24-hour window. The sliding window algorithm is more accurate than a fixed window because it does not reset abruptly at midnight â€” it tracks the rolling 24 hours. When someone hits the limit, they get a 429 response with the exact time their window resets. Authenticated users are keyed by email hash for stronger signal than IP alone.",
    company: "Stripe",
    parallel:
      "Stripe protects every API endpoint with Redis-based sliding window rate limiting. So does GitHub. So does Cloudflare. The pattern is identical: track request counts in Redis with a TTL-based key per identifier, reject requests that exceed the threshold. What I built for vote protection is architecturally the same system that protects payment APIs processing billions of dollars.",
  },
  {
    tech: "Resend",
    problem:
      "I needed automated emails to actually work. When a user uses magic link authentication, they get a sign-in link. Those emails have to arrive instantly, land in the inbox â€” not spam â€” and come from my own domain. Setting up raw SMTP is a deliverability nightmare. Using a bulk email service sends the wrong signals to spam filters.",
    solution:
      "Resend is built specifically for transactional email â€” emails triggered by user actions, not marketing blasts. I wired it into the NextAuth magic link flow. Emails go out from my domain, with proper SPF and DKIM records, through infrastructure built for exactly this use case. The developer experience is clean: a single API call, and the email is in the inbox.",
    company: "Airbnb",
    parallel:
      "Airbnb sends hundreds of millions of transactional emails â€” booking confirmations, host notifications, payment receipts. Their infrastructure separates transactional email from marketing email for exactly the reason I chose Resend: deliverability depends on reputation, and reputation depends on sending the right type of email through the right infrastructure. Resend was built by engineers who came from Stripe â€” a company that cannot afford email failures on payment receipts.",
  },
  {
    tech: "Inngest",
    problem:
      "Contests need to archive automatically when their end date passes and a new one needs to open immediately after. Vote reminder emails need to go out 24 hours before a contest closes. These are time-based background jobs â€” they cannot run inside a web request and cannot rely on cron jobs that need a persistent server.",
    solution:
      "Inngest handles background jobs in a serverless environment. The archive function runs hourly, checks whether any active contest has passed its end date, flips the status to archived, and fires an event that triggers the next contest creation. The vote reminder function runs hourly and emails subscribed users when a contest is within 24 hours of closing. All of this happens automatically â€” no manual intervention, no server to babysit.",
    company: "Vercel",
    parallel:
      "Serverless background job queues are the standard pattern for any Next.js app deployed on Vercel because there is no persistent server process. The same architecture powers automated workflows at companies running on Vercel's infrastructure â€” event-driven functions that trigger on schedule or on application events, not long-running processes.",
  },
  {
    tech: "Vercel",
    problem:
      "I needed deployment that did not require managing servers. Every push to main needs to update the live site. Every pull request needs a preview URL so I can test changes before they go live. Images need to be served from a CDN. Environment variables need to be managed securely.",
    solution:
      "Vercel handles all of it natively. Push to main, site deploys in under a minute. Open a pull request, get a unique preview URL automatically. Environment variables are stored encrypted and injected at build time. The Next.js Image component routes through Vercel's image optimization pipeline â€” it converts artwork to WebP, resizes for the device, and caches at the edge. A 4MB PNG becomes a 200KB WebP delivered from a server milliseconds from the user.",
    company: "The Washington Post",
    parallel:
      "The Washington Post rebuilt their frontend on Next.js and Vercel because their old deployment pipeline was slow and brittle. Now their newsroom can publish and the site updates in seconds through the same git-push-to-deploy model I use. Loom, HashiCorp, and OpenAI all deploy the same way. The pattern scales from a weekly art contest to a national newspaper.",
  },
  {
    tech: "TypeScript",
    problem:
      "When writing a vote API that touches the database, I need to know exactly what shape the data coming in looks like. When passing artwork data from a Server Component to a Client Component, I need to know what fields exist. Without types, a typo in a field name is a runtime bug that only surfaces when a user hits it. With types, it is a compile error caught before the code ships.",
    solution:
      "TypeScript is enabled in strict mode throughout the entire codebase. The database schema has corresponding TypeScript interfaces. Every API route validates its input against a Zod schema â€” which generates TypeScript types from runtime validation rules. The result is a codebase where the shape of data is documented in the code itself, and the compiler enforces that documentation.",
    company: "Google",
    parallel:
      "Google, Airbnb, Slack, and Microsoft all mandated TypeScript across their codebases after experiencing the maintenance cost of large untyped JavaScript projects. Airbnb published a study showing TypeScript would have caught 38% of their production bugs before deployment. Strict mode is not optional polish â€” it is the baseline expectation at any serious engineering organisation.",
  },
  {
    tech: "Tailwind CSS",
    problem:
      "I needed a consistent visual language across every page â€” same spacing scale, same colour palette, same font sizing â€” without writing and maintaining a separate CSS file for every component. I also needed the styles to live next to the markup so I could see exactly what a component looks like without jumping between files.",
    solution:
      "Tailwind utility classes mean every styling decision is visible in the JSX. The design tokens â€” violet for primary actions, dark surfaces for cards, monospace for numbers and stats â€” are applied consistently across every component because they come from the same scale defined once in tailwind.config.ts. There is no CSS specificity to debug, no dead styles to audit, no import order to manage.",
    company: "GitHub",
    parallel:
      "GitHub, Shopify, OpenAI, and Vercel all use Tailwind as the foundation of their design systems. GitHub migrated their internal component library to Tailwind because co-locating styles with components made the codebase faster to work in and easier for new engineers to understand. Shopify's Polaris component system is built on the same philosophy.",
  },
];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="animate-page" style={{ paddingBottom: "120px" }}>

        {/* â”€â”€ HERO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section
          style={{
            borderBottom: "1px solid rgba(139,92,246,0.12)",
            paddingTop: "80px",
            paddingBottom: "80px",
            marginBottom: "0",
          }}
        >
          {/* Subtle grid texture */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.018,
              backgroundImage:
                "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
              backgroundSize: "48px 48px",
              pointerEvents: "none",
            }}
          />
          <div className="shell" style={{ position: "relative" }}>
            <p style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--color-purple-light)",
              fontFamily: "var(--font-dm-mono)",
              marginBottom: "24px",
            }}>
              Oliver â€” Full Stack Developer
            </p>
            <h1 style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 800,
              fontSize: "clamp(2.25rem, 6vw, 3.75rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              color: "var(--color-text)",
              margin: "0 0 28px",
              maxWidth: "760px",
            }}>
              Every tool here<br />
              <span style={{ color: "var(--color-text-dim)" }}>solved a real problem.</span>
            </h1>
            <p style={{
              fontSize: "1.0625rem",
              color: "var(--color-text-muted)",
              lineHeight: 1.72,
              maxWidth: "620px",
              margin: 0,
            }}>
              AI Art Arena is a live, production web application â€” a weekly voting contest for
              AI-generated artwork. I did not choose this tech stack because it looked impressive
              on a CV. I chose each piece because I had a problem, and it was the right tool to
              solve it. That is how every serious product gets built.
            </p>
          </div>
        </section>

        {/* â”€â”€ THE PERSON â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section style={{ borderBottom: "1px solid rgba(139,92,246,0.12)", padding: "80px 0" }}>
          <div className="shell">
            <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "80px", alignItems: "start" }}>
              <div style={{ position: "sticky", top: "84px" }}>
                <p style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-dm-mono)",
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--color-text-dim)",
                }}>
                  The builder
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px", color: "var(--color-text-muted)", lineHeight: 1.72, fontSize: "1.0625rem" }}>
                <p style={{ margin: 0 }}>
                  Three years ago I was selling life insurance. No computer science degree.
                  No bootcamp. No head start. What I had was a stubborn need to understand
                  how things work and the willingness to keep going when they did not.
                </p>
                <p style={{ margin: 0 }}>
                  I taught myself to code the way most things worth knowing get learned â€” by
                  building something, running into a problem, figuring out the solution, and
                  building something harder next. React first, then Next.js, then what a
                  database actually is and why it matters, then authentication, security,
                  deployment, performance. Each layer required the one before it.
                </p>
                <p style={{ margin: 0 }}>
                  Necessity is the mother of invention. I wanted to build a voting platform,
                  so I needed to store data. I needed to store data, so I learned PostgreSQL.
                  I needed users to sign in, so I learned authentication. I needed to prevent
                  abuse, so I learned rate limiting. Every technology on this project exists
                  because the project demanded it. That is the only reason to learn anything.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* â”€â”€ THE DECISIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section style={{ borderBottom: "1px solid rgba(139,92,246,0.12)", padding: "80px 0" }}>
          <div className="shell">
            <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "80px", alignItems: "start" }}>
              <div style={{ position: "sticky", top: "84px" }}>
                <p style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-dm-mono)",
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--color-text-dim)",
                  marginBottom: "8px",
                }}>
                  The stack
                </p>
                <p style={{ fontSize: "11px", color: "var(--color-text-dim)", lineHeight: 1.55, fontFamily: "var(--font-dm-mono)" }}>
                  Problem.<br />Solution.<br />Who else did it.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "64px" }}>
                {decisions.map(({ tech, problem, solution, company, parallel }, i) => (
                  <article
                    key={tech}
                    className="animate-card"
                    style={{ "--card-delay": `${i * 40}ms` } as React.CSSProperties}
                  >
                    {/* Tech badge */}
                    <div style={{ marginBottom: "24px" }}>
                      <span style={{
                        fontSize: "11px",
                        fontFamily: "var(--font-dm-mono)",
                        fontWeight: 700,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "var(--color-purple-light)",
                        background: "rgba(139,92,246,0.10)",
                        padding: "4px 12px",
                        borderRadius: "100px",
                      }}>
                        {tech}
                      </span>
                    </div>

                    {/* Problem */}
                    <div style={{ marginBottom: "20px" }}>
                      <p style={{
                        fontSize: "11px",
                        fontFamily: "var(--font-dm-mono)",
                        fontWeight: 600,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "var(--color-text-dim)",
                        marginBottom: "8px",
                      }}>
                        The problem
                      </p>
                      <p style={{ fontSize: "0.9375rem", color: "var(--color-text-muted)", lineHeight: 1.72, margin: 0 }}>
                        {problem}
                      </p>
                    </div>

                    {/* Solution */}
                    <div style={{ marginBottom: "20px" }}>
                      <p style={{
                        fontSize: "11px",
                        fontFamily: "var(--font-dm-mono)",
                        fontWeight: 600,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "var(--color-text-dim)",
                        marginBottom: "8px",
                      }}>
                        How it solved it
                      </p>
                      <p style={{ fontSize: "0.9375rem", color: "var(--color-text)", lineHeight: 1.72, margin: 0 }}>
                        {solution}
                      </p>
                    </div>

                    {/* Company parallel */}
                    <div style={{
                      background: "var(--color-bg-surface)",
                      border: "1px solid rgba(139,92,246,0.12)",
                      borderRadius: "10px",
                      padding: "20px 24px",
                    }}>
                      <p style={{
                        fontSize: "11px",
                        fontFamily: "var(--font-dm-mono)",
                        fontWeight: 600,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "var(--color-text-dim)",
                        marginBottom: "8px",
                      }}>
                        {company} did this too
                      </p>
                      <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: 1.65, margin: 0 }}>
                        {parallel}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* â”€â”€ ON USING AI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section style={{ borderBottom: "1px solid rgba(139,92,246,0.12)", padding: "80px 0", background: "rgba(139,92,246,0.02)" }}>
          <div className="shell">
            <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "80px", alignItems: "start" }}>
              <div style={{ position: "sticky", top: "84px" }}>
                <p style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-dm-mono)",
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--color-text-dim)",
                }}>
                  On using AI
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px", color: "var(--color-text-muted)", lineHeight: 1.72, fontSize: "1.0625rem" }}>
                <p style={{ margin: 0 }}>
                  I use Claude as a development tool â€” the same way I use TypeScript, a linter,
                  or a debugger. It helps me write code faster and explore implementation options.
                  Every architectural decision, technology choice, security tradeoff, and product
                  direction on this project was mine.
                </p>
                <p style={{ margin: 0 }}>
                  The architect is human. The tools are modern. That is how professional
                  development works in 2026, and pretending otherwise does not make someone a
                  better developer â€” it just makes them a slower one.
                </p>
                <p style={{ margin: 0 }}>
                  What AI cannot do is understand the problem I am trying to solve. It cannot
                  decide that one vote per IP per 24 hours is the right constraint for this
                  platform. It cannot decide that database-level security matters more than
                  shipping a week faster. It cannot look at five sequential database queries
                  and understand why collapsing them into one atomic function is the right
                  call â€” not just for performance, but for correctness under concurrent load.
                  Those decisions require understanding the system. That understanding is mine.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* â”€â”€ WHERE THINGS STAND â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section style={{ borderBottom: "1px solid rgba(139,92,246,0.12)", padding: "80px 0" }}>
          <div className="shell">
            <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "80px", alignItems: "start" }}>
              <div style={{ position: "sticky", top: "84px" }}>
                <p style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-dm-mono)",
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--color-text-dim)",
                }}>
                  Where things stand
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px", color: "var(--color-text-muted)", lineHeight: 1.72, fontSize: "1.0625rem" }}>
                <p style={{ margin: 0 }}>
                  Week one is live. Voting works. The contest runs, the archive records results,
                  the leaderboard tracks all-time champions, and the background jobs cycle
                  everything automatically. The infrastructure is production-grade â€” 19
                  tracked migrations, atomic database functions, three layers of duplicate-vote
                  prevention, database-level constraints, and a full security audit completed
                  this week.
                </p>
                <p style={{ margin: 0 }}>
                  The gap between this project and a production app at a well-funded startup
                  is execution depth and time, not fundamental approach. The technology is
                  identical. The architectural thinking is the same. That gap closes with hours,
                  and the hours are going in.
                </p>
                <p style={{ margin: 0 }}>
                  What this project demonstrates right now: I understand how to identify the
                  right tool for a real problem, implement it correctly, and build systems
                  that hold up under scrutiny. That is the job.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* â”€â”€ CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section style={{ padding: "80px 0", background: "rgba(139,92,246,0.02)" }}>
          <div className="shell">
            <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "80px", alignItems: "start" }}>
              <div style={{ position: "sticky", top: "84px" }}>
                <p style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-dm-mono)",
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--color-text-dim)",
                }}>
                  Work together
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "32px", color: "var(--color-text-muted)", lineHeight: 1.72, fontSize: "1.0625rem" }}>
                <p style={{ margin: 0 }}>
                  I take on client work. If you need a developer who solves problems instead
                  of copying solutions â€” someone who understands every layer of the stack and
                  treats your project with the same seriousness as their own â€” reach out.
                </p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <a
                    href="mailto:hello@olliedoesis.dev"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "12px 28px",
                      background: "var(--color-purple)",
                      color: "var(--color-text)",
                      fontFamily: "var(--font-syne)",
                      fontWeight: 700,
                      fontSize: "0.9375rem",
                      borderRadius: "100px",
                      textDecoration: "none",
                      letterSpacing: "0.01em",
                      transition: "background 0.2s",
                    }}
                  >
                    Get in touch
                  </a>
                  <a
                    href="https://github.com/olliedoesisdev/ai-art-arena"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "12px 28px",
                      background: "transparent",
                      border: "1px solid rgba(139,92,246,0.25)",
                      color: "var(--color-purple-light)",
                      fontFamily: "var(--font-syne)",
                      fontWeight: 600,
                      fontSize: "0.9375rem",
                      borderRadius: "100px",
                      textDecoration: "none",
                      transition: "border-color 0.2s, color 0.2s",
                    }}
                  >
                    View source on GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
