import { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/layout/JsonLd";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About - Oliver | Full Stack Developer | AI Art Arena",
  description:
    "Oliver built AI Art Arena - a production Next.js 14 voting platform for AI-generated artwork. Every tool in the stack solved a real problem. Read why each technology was chosen.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About - Oliver | Full Stack Developer | AI Art Arena",
    description:
      "A production Next.js 14 + Supabase voting platform built from scratch. Every architectural decision explained: the problem, the solution, and who else solved it the same way.",
    url: `${SITE_URL}/about`,
    siteName: "AI Art Arena",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "AI Art Arena - built by Oliver" }],
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "About - Oliver | AI Art Arena",
    description:
      "Production Next.js 14 + Supabase voting platform. Every tool in the stack solved a real problem.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Oliver",
  url: SITE_URL,
  jobTitle: "Full Stack Developer",
  description:
    "Self-taught full stack developer. Built AI Art Arena - a production Next.js 14 voting platform for AI-generated artwork - using PostgreSQL, Supabase, NextAuth, Upstash Redis, Inngest, and Vercel.",
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
      "I needed a framework that could serve fast, SEO-friendly pages for the contest and archive but still handle real-time interactivity for voting without a full page reload.",
    solution:
      "Next.js App Router let me solve both at once. Archive pages and contest details are Server Components: the HTML is generated on the server, loads instantly, and search engines can index every past contest. The vote button is a Client Component - it is the only piece that ships JavaScript to the browser. The rest of the page is pure, fast HTML. That distinction is not just a performance trick. It is an architectural discipline that keeps the codebase clean and the user experience fast.",
    company: "TikTok",
    parallel:
      "TikTok built their web app on Next.js for exactly this reason. The feed is mostly static - fast server-rendered HTML. The like button, comments, and share interactions are isolated client components. Same split. Same reasoning. Twitch, Hulu, Nike, and OpenAI made the same call.",
  },
  {
    tech: "Supabase + PostgreSQL",
    problem:
      "The moment I decided users could vote, I had a data problem. I needed to store users, artworks, contests, and votes and the relationships between them. A vote belongs to a user. A user can only cast one vote per contest. An artwork belongs to a contest. I needed a real relational database, not a JSON blob.",
    solution:
      "Supabase gave me PostgreSQL with Row Level Security built in. RLS means the database itself enforces the rules - a user cannot read another user's vote history, a user cannot insert a second vote for the same contest, and those constraints live at the database layer, not in application code. On top of that, I wrote a single atomic PostgreSQL function - submit_vote - that checks contest status, verifies the artwork, detects duplicate votes, inserts the vote row, and increments the vote count in one transaction. What used to be five sequential round trips is one call at around 40ms. No race conditions. No partial writes.",
    company: "Reddit",
    parallel:
      "Reddit denormalizes upvote counts on posts using the same approach - maintaining a running count at write time rather than running a COUNT query across all votes on every page load. Mozilla and PwC both run on Supabase. The RLS security model is the same pattern healthcare and fintech companies use because they cannot rely on application code alone to protect sensitive data.",
  },
  {
    tech: "NextAuth v5",
    problem:
      "I needed users to be able to sign in, stay signed in across sessions, and have their identity attached to their votes. I also needed two sign-in methods: GitHub OAuth for developers, and magic link email for everyone else. And I needed session data available on the server - not just the browser - so Server Components could check who is logged in before rendering.",
    solution:
      "NextAuth v5 handles all of it. OAuth flow, magic link generation and verification, secure session tokens, server-side session access. I did not write authentication from scratch - that would be the wrong decision. Authentication is one of the highest-risk areas in any application. Using a battle-tested library and wiring it correctly into the Next.js App Router required real understanding of how sessions flow between server and client.",
    company: "Vercel",
    parallel:
      "Vercel themselves use NextAuth in their documentation examples and internal tooling. It is the authentication standard across the Next.js ecosystem because reinventing auth at the application layer is a security liability. The companies that build their own auth from scratch are the ones that end up in breach headlines.",
  },
  {
    tech: "Upstash Redis",
    problem:
      "Votes had to be limited. Without enforcement, a single person with a script could vote thousands of times in an hour and corrupt every contest result. I also needed protection on authentication - limiting failed sign-in attempts to prevent brute force attacks. Application-level checks are not enough because they do not persist across server restarts and do not handle distributed traffic accurately.",
    solution:
      "Upstash gives me serverless Redis - a persistent, fast key-value store I can write to from any edge function or API route. I implemented a sliding window rate limiter on the vote endpoint: one vote per IP address per contest per 24-hour window. The sliding window algorithm is more accurate than a fixed window because it does not reset abruptly at midnight - it tracks the rolling 24 hours. When someone hits the limit, they get a 429 response with the exact time their window resets. Authenticated users are keyed by email hash for stronger signal than IP alone.",
    company: "Stripe",
    parallel:
      "Stripe protects every API endpoint with Redis-based sliding window rate limiting. So does GitHub. So does Cloudflare. The pattern is identical: track request counts in Redis with a TTL-based key per identifier, reject requests that exceed the threshold. What I built for vote protection is architecturally the same system that protects payment APIs processing billions of dollars.",
  },
  {
    tech: "Resend",
    problem:
      "I needed automated emails to actually work. When a user uses magic link authentication, they get a sign-in link. Those emails have to arrive instantly, land in the inbox - not spam - and come from my own domain. Setting up raw SMTP is a deliverability nightmare. Using a bulk email service sends the wrong signals to spam filters.",
    solution:
      "Resend is built specifically for transactional email - emails triggered by user actions, not marketing blasts. I wired it into the NextAuth magic link flow. Emails go out from my domain, with proper SPF and DKIM records, through infrastructure built for exactly this use case. The developer experience is clean: a single API call, and the email is in the inbox.",
    company: "Airbnb",
    parallel:
      "Airbnb sends hundreds of millions of transactional emails - booking confirmations, host notifications, payment receipts. Their infrastructure separates transactional email from marketing email for exactly the reason I chose Resend: deliverability depends on reputation, and reputation depends on sending the right type of email through the right infrastructure. Resend was built by engineers who came from Stripe - a company that cannot afford email failures on payment receipts.",
  },
  {
    tech: "Inngest",
    problem:
      "Contests need to archive automatically when their end date passes and a new one needs to open immediately after. Vote reminder emails need to go out 24 hours before a contest closes. These are time-based background jobs - they cannot run inside a web request and cannot rely on cron jobs that need a persistent server.",
    solution:
      "Inngest handles background jobs in a serverless environment. The archive function runs hourly, checks whether any active contest has passed its end date, flips the status to archived, and fires an event that triggers the next contest creation. The vote reminder function runs hourly and emails subscribed users when a contest is within 24 hours of closing. All of this happens automatically - no manual intervention, no server to babysit.",
    company: "Vercel",
    parallel:
      "Serverless background job queues are the standard pattern for any Next.js app deployed on Vercel because there is no persistent server process. The same architecture powers automated workflows at companies running on Vercel's infrastructure - event-driven functions that trigger on schedule or on application events, not long-running processes.",
  },
  {
    tech: "Vercel",
    problem:
      "I needed deployment that did not require managing servers. Every push to main needs to update the live site. Every pull request needs a preview URL so I can test changes before they go live. Images need to be served from a CDN. Environment variables need to be managed securely.",
    solution:
      "Vercel handles all of it natively. Push to main, site deploys in under a minute. Open a pull request, get a unique preview URL automatically. Environment variables are stored encrypted and injected at build time. The Next.js Image component routes through Vercel's image optimization pipeline - it converts artwork to WebP, resizes for the device, and caches at the edge. A 4MB PNG becomes a 200KB WebP delivered from a server milliseconds from the user.",
    company: "The Washington Post",
    parallel:
      "The Washington Post rebuilt their frontend on Next.js and Vercel because their old deployment pipeline was slow and brittle. Now their newsroom can publish and the site updates in seconds through the same git-push-to-deploy model I use. Loom, HashiCorp, and OpenAI all deploy the same way. The pattern scales from a weekly art contest to a national newspaper.",
  },
  {
    tech: "TypeScript",
    problem:
      "When writing a vote API that touches the database, I need to know exactly what shape the data coming in looks like. When passing artwork data from a Server Component to a Client Component, I need to know what fields exist. Without types, a typo in a field name is a runtime bug that only surfaces when a user hits it. With types, it is a compile error caught before the code ships.",
    solution:
      "TypeScript is enabled in strict mode throughout the entire codebase. The database schema has corresponding TypeScript interfaces. Every API route validates its input against a Zod schema - which generates TypeScript types from runtime validation rules. The result is a codebase where the shape of data is documented in the code itself, and the compiler enforces that documentation.",
    company: "Google",
    parallel:
      "Google, Airbnb, Slack, and Microsoft all mandated TypeScript across their codebases after experiencing the maintenance cost of large untyped JavaScript projects. Airbnb published a study showing TypeScript would have caught 38% of their production bugs before deployment. Strict mode is not optional polish - it is the baseline expectation at any serious engineering organisation.",
  },
  {
    tech: "Tailwind CSS",
    problem:
      "I needed a consistent visual language across every page - same spacing scale, same colour palette, same font sizing - without writing and maintaining a separate CSS file for every component. I also needed the styles to live next to the markup so I could see exactly what a component looks like without jumping between files.",
    solution:
      "Tailwind utility classes mean every styling decision is visible in the JSX. The design tokens - violet for primary actions, dark surfaces for cards, monospace for numbers and stats - are applied consistently across every component because they come from the same scale defined once in globals.css. There is no CSS specificity to debug, no dead styles to audit, no import order to manage.",
    company: "GitHub",
    parallel:
      "GitHub, Shopify, OpenAI, and Vercel all use Tailwind as the foundation of their design systems. GitHub migrated their internal component library to Tailwind because co-locating styles with components made the codebase faster to work in and easier for new engineers to understand. Shopify's Polaris component system is built on the same philosophy.",
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-dim)]">
      {children}
    </p>
  );
}

export default function AboutPage() {
  return (
    <>
      <JsonLd data={jsonLd} />

      <div className="animate-page pb-[120px]">

        {/* HERO */}
        <section className="relative border-b border-[var(--color-border-subtle)] py-16 sm:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.018]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="shell relative">
            <p className="mb-6 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-purple-light)]">
              Oliver - Full Stack Developer
            </p>
            <h1 className="mb-7 max-w-[760px] font-sans text-[clamp(2rem,6vw,3.75rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-[var(--color-text)]">
              Every tool here
              <br />
              <span className="text-[var(--color-text-dim)]">solved a real problem.</span>
            </h1>
            <p className="max-w-[620px] text-[1.0625rem] leading-[1.72] text-[var(--color-text-muted)]">
              AI Art Arena is a live, production web application - a weekly voting contest for
              AI-generated artwork. I did not choose this tech stack because it looked impressive
              on a CV. I chose each piece because I had a problem, and it was the right tool to
              solve it. That is how every serious product gets built.
            </p>
          </div>
        </section>

        {/* THE BUILDER */}
        <section className="border-b border-[var(--color-border-subtle)] py-16 sm:py-20">
          <div className="shell">
            <div className="grid-about">
              <div>
                <SectionLabel>The builder</SectionLabel>
              </div>
              <div className="flex flex-col gap-6 text-[1.0625rem] leading-[1.72] text-[var(--color-text-muted)]">
                <p>
                  Three years ago I was selling life insurance. No computer science degree.
                  No bootcamp. No head start. What I had was a stubborn need to understand
                  how things work and the willingness to keep going when they did not.
                </p>
                <p>
                  I taught myself to code the way most things worth knowing get learned - by
                  building something, running into a problem, figuring out the solution, and
                  building something harder next. React first, then Next.js, then what a
                  database actually is and why it matters, then authentication, security,
                  deployment, performance. Each layer required the one before it.
                </p>
                <p>
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

        {/* THE STACK */}
        <section className="border-b border-[var(--color-border-subtle)] py-16 sm:py-20">
          <div className="shell">
            <div className="grid-about">
              <div>
                <SectionLabel>The stack</SectionLabel>
                <p className="mt-2 font-mono text-[11px] leading-[1.55] text-[var(--color-text-dim)]">
                  Problem.
                  <br />
                  Solution.
                  <br />
                  Who else did it.
                </p>
              </div>

              <div className="flex flex-col gap-16">
                {decisions.map(({ tech, problem, solution, company, parallel }, i) => (
                  <article
                    key={tech}
                    className="animate-card"
                    style={{ "--card-delay": `${i * 40}ms` } as React.CSSProperties}
                  >
                    <div className="mb-6">
                      <span className="rounded-[var(--radius-pill)] bg-[var(--color-purple-dim)] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--color-purple-light)]">
                        {tech}
                      </span>
                    </div>

                    <div className="mb-5">
                      <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-dim)]">
                        The problem
                      </p>
                      <p className="text-[0.9375rem] leading-[1.72] text-[var(--color-text-muted)]">
                        {problem}
                      </p>
                    </div>

                    <div className="mb-5">
                      <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-dim)]">
                        How it solved it
                      </p>
                      <p className="text-[0.9375rem] leading-[1.72] text-[var(--color-text)]">
                        {solution}
                      </p>
                    </div>

                    <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-6 py-5">
                      <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-dim)]">
                        {company} did this too
                      </p>
                      <p className="text-[0.875rem] leading-[1.65] text-[var(--color-text-muted)]">
                        {parallel}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ON USING AI */}
        <section className="border-b border-[var(--color-border-subtle)] bg-[var(--color-purple-dim2)] py-16 sm:py-20">
          <div className="shell">
            <div className="grid-about">
              <div>
                <SectionLabel>On using AI</SectionLabel>
              </div>
              <div className="flex flex-col gap-6 text-[1.0625rem] leading-[1.72] text-[var(--color-text-muted)]">
                <p>
                  I use Claude as a development tool - the same way I use TypeScript, a linter,
                  or a debugger. It helps me write code faster and explore implementation options.
                  Every architectural decision, technology choice, security tradeoff, and product
                  direction on this project was mine.
                </p>
                <p>
                  The architect is human. The tools are modern. That is how professional
                  development works in 2026, and pretending otherwise does not make someone a
                  better developer - it just makes them a slower one.
                </p>
                <p>
                  What AI cannot do is understand the problem I am trying to solve. It cannot
                  decide that one vote per IP per 24 hours is the right constraint for this
                  platform. It cannot decide that database-level security matters more than
                  shipping a week faster. It cannot look at five sequential database queries
                  and understand why collapsing them into one atomic function is the right
                  call - not just for performance, but for correctness under concurrent load.
                  Those decisions require understanding the system. That understanding is mine.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* WHERE THINGS STAND */}
        <section className="border-b border-[var(--color-border-subtle)] py-16 sm:py-20">
          <div className="shell">
            <div className="grid-about">
              <div>
                <SectionLabel>Where things stand</SectionLabel>
              </div>
              <div className="flex flex-col gap-6 text-[1.0625rem] leading-[1.72] text-[var(--color-text-muted)]">
                <p>
                  Week one is live. Voting works. The contest runs, the archive records results,
                  the leaderboard tracks all-time champions, and the background jobs cycle
                  everything automatically. The infrastructure is production-grade: 19 tracked
                  migrations applied in order, an atomic SECURITY DEFINER database function
                  for votes, three independent layers of duplicate-vote prevention enforced at
                  the database level, a per-request nonce on every CSP header, middleware that
                  blocks unauthenticated and non-admin users from every admin route before a
                  single server component executes, a consistent design token system applied
                  across all components with inline styles only where values are genuinely
                  runtime-dynamic, and a full two-job CI/CD pipeline that runs type-check,
                  lint, unit tests, build, and Playwright end-to-end tests on every pull
                  request before anything reaches production.
                </p>
                <p>
                  The vote path specifically: a Zod-validated request hits a Redis sliding-window
                  rate limiter keyed per contest per identity before a single database call is
                  made. The database function checks contest status, artwork membership, and three
                  duplicate-vote vectors in one atomic read, then inserts and increments in the
                  same transaction. The entire operation runs in around 40 milliseconds. When
                  something goes wrong, a structured Pino log with a request ID and an
                  X-Request-Id response header tie the server trace to the client error. Sentry
                  catches anything that gets past the explicit error handling.
                </p>
                <p>
                  What is not finished: the Playwright end-to-end specs cover navigation and
                  basic voting flow but not the full rate-limit or archive paths end-to-end
                  against a real server. Some unit tests exercise local reimplementations of
                  functions rather than importing the real ones, which limits their ability to
                  catch drift. Migration files use a YYYYMMDD timestamp format with no time
                  component, creating a collision risk if two migrations land on the same day.
                  These are known, tracked, and next in the queue.
                </p>
                <p>
                  The gap between this project and the infrastructure of a well-funded startup
                  is execution depth and time, not fundamental approach. The technology is
                  the same. The architectural thinking is the same. The gaps are specific,
                  named, and shrinking. That is the job.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[var(--color-purple-dim2)] py-16 sm:py-20">
          <div className="shell">
            <div className="grid-about">
              <div>
                <SectionLabel>Work together</SectionLabel>
              </div>
              <div className="flex flex-col gap-8 text-[1.0625rem] leading-[1.72] text-[var(--color-text-muted)]">
                <p>
                  I take on client work. If you need a developer who solves problems instead
                  of copying solutions - someone who understands every layer of the stack and
                  treats your project with the same seriousness as their own - reach out.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="mailto:hello@olliedoesis.dev"
                    className="inline-flex items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-purple)] px-7 py-3 font-sans text-[0.9375rem] font-bold tracking-[0.01em] text-[var(--color-text)] no-underline transition-colors duration-200"
                  >
                    Get in touch
                  </a>
                  <a
                    href="https://github.com/olliedoesisdev/ai-art-arena"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border-mid)] bg-transparent px-7 py-3 font-sans text-[0.9375rem] font-semibold text-[var(--color-purple-light)] no-underline transition-[border-color,color] duration-200"
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
