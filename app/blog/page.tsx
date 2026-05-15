import { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { BLOG_POSTS } from "@/lib/blog";
import { JsonLd } from "@/components/layout/JsonLd";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog — Oliver White | Full Stack Developer",
  description:
    "Deep dives into Next.js, PostgreSQL, Supabase, rate limiting, authentication, and real production problems solved while building AI Art Arena.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: "Blog — Oliver White | Full Stack Developer",
    description:
      "Real problems, real solutions. Deep dives into Next.js, PostgreSQL, Supabase, and production engineering.",
    url: `${SITE_URL}/blog`,
    siteName: "AI Art Arena",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Oliver White's engineering blog — AI Art Arena" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — Oliver White",
    description: "Real problems, real solutions. Deep dives into Next.js, PostgreSQL, Supabase.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

const TAG_COLORS: Record<string, string> = {
  "PostgreSQL":     "rgba(52,211,153,0.12)",
  "Supabase":       "rgba(52,211,153,0.12)",
  "Next.js":        "rgba(139,92,246,0.12)",
  "App Router":     "rgba(139,92,246,0.12)",
  "Architecture":   "rgba(139,92,246,0.12)",
  "Performance":    "rgba(6,182,212,0.12)",
  "Security":       "rgba(248,113,113,0.12)",
  "CSP":            "rgba(248,113,113,0.12)",
  "Redis":          "rgba(251,191,36,0.12)",
  "Upstash":        "rgba(251,191,36,0.12)",
  "Rate Limiting":  "rgba(251,191,36,0.12)",
  "TypeScript":     "rgba(59,130,246,0.12)",
  "Zod":            "rgba(59,130,246,0.12)",
  "NextAuth":       "rgba(244,114,182,0.12)",
  "Authentication": "rgba(244,114,182,0.12)",
  "Inngest":        "rgba(132,204,22,0.12)",
  "Serverless":     "rgba(132,204,22,0.12)",
  "Vercel":         "rgba(255,255,255,0.08)",
  "Observability":  "rgba(139,92,246,0.12)",
  "Pino":           "rgba(139,92,246,0.12)",
  "Concurrency":    "rgba(248,113,113,0.12)",
  "RLS":            "rgba(52,211,153,0.12)",
  "API Design":     "rgba(6,182,212,0.12)",
  "Validation":     "rgba(59,130,246,0.12)",
  "Logging":        "rgba(139,92,246,0.12)",
  "Background Jobs":"rgba(132,204,22,0.12)",
  "Core Web Vitals":"rgba(6,182,212,0.12)",
};

const TAG_TEXT: Record<string, string> = {
  "PostgreSQL":     "#34d399",
  "Supabase":       "#34d399",
  "Next.js":        "#a78bfa",
  "App Router":     "#a78bfa",
  "Architecture":   "#a78bfa",
  "Performance":    "#06b6d4",
  "Security":       "#f87171",
  "CSP":            "#f87171",
  "Redis":          "#fbbf24",
  "Upstash":        "#fbbf24",
  "Rate Limiting":  "#fbbf24",
  "TypeScript":     "#60a5fa",
  "Zod":            "#60a5fa",
  "NextAuth":       "#f472b6",
  "Authentication": "#f472b6",
  "Inngest":        "#84cc16",
  "Serverless":     "#84cc16",
  "Vercel":         "#eeeeff",
  "Observability":  "#a78bfa",
  "Pino":           "#a78bfa",
  "Concurrency":    "#f87171",
  "RLS":            "#34d399",
  "API Design":     "#06b6d4",
  "Validation":     "#60a5fa",
  "Logging":        "#a78bfa",
  "Background Jobs":"#84cc16",
  "Core Web Vitals":"#06b6d4",
};

function TagChip({ tag }: { tag: string }) {
  return (
    <span
      style={{
        background: TAG_COLORS[tag] ?? "rgba(139,92,246,0.10)",
        color: TAG_TEXT[tag] ?? "#a78bfa",
        fontFamily: "var(--font-dm-mono)",
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding: "3px 8px",
        borderRadius: "100px",
        whiteSpace: "nowrap",
      }}
    >
      {tag}
    </span>
  );
}

const sorted = [...BLOG_POSTS].sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
);

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Oliver White — Engineering Blog",
  description: "Deep dives into Next.js, PostgreSQL, Supabase, rate limiting, authentication, and real production problems solved while building AI Art Arena.",
  url: `${SITE_URL}/blog`,
  author: { "@type": "Person", name: "Oliver White", url: `${SITE_URL}/about` },
  publisher: { "@type": "Organization", name: "AI Art Arena", url: SITE_URL },
  blogPost: BLOG_POSTS.map((post) => ({
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    url: `${SITE_URL}/blog/${post.slug}`,
    keywords: post.tags.join(", "),
  })),
};

export default function BlogIndexPage() {
  return (
    <div className="animate-page" style={{ paddingTop: "56px", paddingBottom: "100px" }}>
      <div className="shell">
        <JsonLd data={jsonLd} />

        {/* Header */}
        <div style={{ marginBottom: "56px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-purple-light)", fontFamily: "var(--font-dm-mono)", marginBottom: "16px" }}>
            Writing
          </p>
          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--color-text)", margin: "0 0 16px", lineHeight: 1.05 }}>
            Real problems.<br />
            <span style={{ color: "var(--color-text-muted)" }}>Real solutions.</span>
          </h1>
          <p style={{ fontSize: "1.0625rem", color: "var(--color-text-muted)", maxWidth: "560px", lineHeight: 1.7, margin: 0 }}>
            Deep dives into Next.js, PostgreSQL, Supabase, and production engineering — written while building AI Art Arena from scratch.
          </p>
        </div>

        {/* Post list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {sorted.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{ textDecoration: "none" }}
              className="animate-card"
            >
              <article
                className="blog-post-row"
                style={{
                  padding: "28px 32px",
                  background: "var(--color-bg-surface)",
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: i === 0 ? "14px 14px 4px 4px" : i === sorted.length - 1 ? "4px 4px 14px 14px" : "4px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "24px",
                  flexWrap: "wrap",
                }}
              >
                {/* Number */}
                <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "13px", color: "var(--color-text-muted)", flexShrink: 0, paddingTop: "3px", minWidth: "24px" }}>
                  {String(sorted.length - i).padStart(2, "0")}
                </span>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                    {post.tags.slice(0, 3).map((t) => <TagChip key={t} tag={t} />)}
                  </div>
                  <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "1.0625rem", fontWeight: 700, color: "var(--color-text)", margin: "0 0 8px", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
                    {post.title}
                  </h2>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.6, maxWidth: "640px" }}>
                    {post.excerpt}
                  </p>
                </div>

                {/* Meta */}
                <div style={{ flexShrink: 0, textAlign: "right", paddingTop: "2px" }}>
                  <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "var(--color-text-muted)", margin: "0 0 4px" }}>
                    {new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "var(--color-text-muted)", margin: 0 }}>
                    {post.readingTime} min read
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Back to about */}
        <div style={{ marginTop: "56px", paddingTop: "32px", borderTop: "1px solid var(--color-border-subtle)" }}>
          <Link
            href="/about"
            style={{ fontFamily: "var(--font-dm-mono)", fontSize: "13px", color: "var(--color-purple-light)", textDecoration: "none" }}
          >
            ← Back to About
          </Link>
        </div>
      </div>
    </div>
  );
}
