import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/site";
import { getPostBySlug, getAllSlugs, BlogSection } from "@/lib/blog";
import { JsonLd } from "@/components/layout/JsonLd";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Oliver White`,
    description: post.excerpt,
    authors: [{ name: "Oliver White" }],
    alternates: { canonical: `${SITE_URL}/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${slug}`,
      siteName: "AI Art Arena",
      type: "article",
      publishedTime: post.publishedAt,
      authors: ["Oliver White"],
      tags: post.tags,
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: `${post.title} — Oliver White` }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [`${SITE_URL}/og-image.png`],
    },
  };
}

// ─── Section renderers ────────────────────────────────────────────────────────

function SectionParagraph({ content }: { content: string }) {
  return (
    <p style={{ fontSize: "1.0625rem", color: "var(--color-text-muted)", lineHeight: 1.78, margin: "0 0 20px" }}>
      {content}
    </p>
  );
}

function SectionHeading({ level, content }: { level: 2 | 3; content: string }) {
  const shared: React.CSSProperties = {
    fontFamily: "var(--font-syne)",
    color: "var(--color-text)",
    letterSpacing: "-0.02em",
    margin: "40px 0 14px",
  };
  if (level === 2) {
    return <h2 style={{ ...shared, fontSize: "1.375rem", fontWeight: 800 }}>{content}</h2>;
  }
  return <h3 style={{ ...shared, fontSize: "1.125rem", fontWeight: 700 }}>{content}</h3>;
}

function SectionCode({ language, content }: { language: string; content: string }) {
  return (
    <div style={{ margin: "24px 0", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--color-border-subtle)" }}>
      <div style={{ background: "var(--color-bg-surface2)", padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--color-border-subtle)" }}>
        <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{language}</span>
      </div>
      <pre style={{ background: "var(--color-code-bg)", margin: 0, padding: "20px 24px", overflowX: "auto" }}>
        <code style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.8125rem", lineHeight: 1.7, color: "var(--color-purple-pale)" }}>
          {content.trim()}
        </code>
      </pre>
    </div>
  );
}

function SectionTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ margin: "24px 0", overflowX: "auto", borderRadius: "10px", border: "1px solid var(--color-border-subtle)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "480px" }}>
        <thead>
          <tr style={{ background: "var(--color-bg-surface2)" }}>
            {headers.map((h) => (
              <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontFamily: "var(--font-dm-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border-subtle)", whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: ri < rows.length - 1 ? "1px solid var(--color-border-subtle)" : "none" }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: "11px 16px", fontSize: "0.875rem", color: ci === 0 ? "var(--color-text)" : "var(--color-text-muted)", lineHeight: 1.5, verticalAlign: "top" }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const CALLOUT_STYLES = {
  info:    { bg: "var(--color-card-accent-2-dim)",    border: "var(--color-card-accent-2-border)", color: "var(--color-card-accent-2)", icon: "ℹ" },
  warning: { bg: "var(--color-status-warning-dim)",   border: "var(--color-status-warning-border)", color: "var(--color-status-warning)", icon: "⚠" },
  success: { bg: "var(--color-status-success-dim)",   border: "var(--color-status-success-border)", color: "var(--color-status-success)", icon: "✓" },
  tip:     { bg: "var(--color-purple-dim)",           border: "var(--color-border-mid)",            color: "var(--color-purple-light)",  icon: "→" },
};

function SectionCallout({ variant, content }: { variant: "info" | "warning" | "success" | "tip"; content: string }) {
  const s = CALLOUT_STYLES[variant];
  return (
    <div style={{ margin: "24px 0", padding: "16px 20px", background: s.bg, border: `1px solid ${s.border}`, borderRadius: "10px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
      <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "13px", color: s.color, flexShrink: 0, paddingTop: "2px" }}>{s.icon}</span>
      <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--color-text-muted)", lineHeight: 1.65 }}>{content}</p>
    </div>
  );
}

function SectionList({ ordered, items }: { ordered: boolean; items: string[] }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag style={{ margin: "16px 0 20px", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: "0.9375rem", color: "var(--color-text-muted)", lineHeight: 1.65 }}>
          {item}
        </li>
      ))}
    </Tag>
  );
}

function SectionMetricGrid({ items }: { items: { label: string; value: string; sub?: string }[] }) {
  return (
    <div style={{ margin: "24px 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
      {items.map((item) => (
        <div key={item.label} style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: "10px", padding: "20px" }}>
          <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 6px" }}>{item.label}</p>
          <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "1.75rem", fontWeight: 500, color: "var(--color-purple-light)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>{item.value}</p>
          {item.sub && <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "var(--color-text-muted)", margin: 0 }}>{item.sub}</p>}
        </div>
      ))}
    </div>
  );
}

function SectionComparison({ left, right }: { left: { label: string; items: string[] }; right: { label: string; items: string[] } }) {
  return (
    <div style={{ margin: "24px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
      {[
        { side: left,  bg: "var(--color-status-error-dim)",    border: "var(--color-status-error-border)",   color: "var(--color-status-error)" },
        { side: right, bg: "var(--color-status-success-dim)",  border: "var(--color-status-success-border)", color: "var(--color-status-success)" },
      ].map(({ side, bg, border, color }) => (
        <div key={side.label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: "10px", padding: "20px" }}>
          <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color, margin: "0 0 14px" }}>{side.label}</p>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
            {side.items.map((item, i) => (
              <li key={i} style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: 1.5, display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <span style={{ color, flexShrink: 0, paddingTop: "2px" }}>·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function renderSection(section: BlogSection, i: number) {
  switch (section.type) {
    case "paragraph":    return <SectionParagraph key={i} content={section.content} />;
    case "heading":      return <SectionHeading key={i} level={section.level} content={section.content} />;
    case "code":         return <SectionCode key={i} language={section.language} content={section.content} />;
    case "table":        return <SectionTable key={i} headers={section.headers} rows={section.rows} />;
    case "callout":      return <SectionCallout key={i} variant={section.variant} content={section.content} />;
    case "list":         return <SectionList key={i} ordered={section.ordered} items={section.items} />;
    case "metric-grid":  return <SectionMetricGrid key={i} items={section.items} />;
    case "comparison":   return <SectionComparison key={i} left={section.left} right={section.right} />;
    case "divider":      return <hr key={i} style={{ border: "none", borderTop: "1px solid var(--color-border-subtle)", margin: "36px 0" }} />;
    default:             return null;
  }
}

const TAG_TEXT: Record<string, string> = {
  "PostgreSQL": "#34d399", "Supabase": "#34d399", "Next.js": "#a78bfa",
  "App Router": "#a78bfa", "Architecture": "#a78bfa", "Performance": "#06b6d4",
  "Security": "#f87171", "CSP": "#f87171", "Redis": "#fbbf24", "Upstash": "#fbbf24",
  "Rate Limiting": "#fbbf24", "TypeScript": "#60a5fa", "Zod": "#60a5fa",
  "NextAuth": "#f472b6", "Authentication": "#f472b6", "Inngest": "#84cc16",
  "Serverless": "#84cc16", "Vercel": "#eeeeff", "Observability": "#a78bfa",
  "Pino": "#a78bfa", "Concurrency": "#f87171", "RLS": "#34d399",
  "API Design": "#06b6d4", "Validation": "#60a5fa", "Logging": "#a78bfa",
  "Background Jobs": "#84cc16", "Core Web Vitals": "#06b6d4",
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { "@type": "Person", name: "Oliver White", url: `${SITE_URL}/about` },
    publisher: { "@type": "Organization", name: "AI Art Arena", url: SITE_URL },
    url: `${SITE_URL}/blog/${slug}`,
    keywords: post.tags.join(", "),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="animate-page" style={{ paddingTop: "56px", paddingBottom: "100px" }}>
        <div className="shell">

          {/* Back */}
          <Link
            href="/blog"
            style={{ fontFamily: "var(--font-dm-mono)", fontSize: "13px", color: "var(--color-text-muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "40px" }}
          >
            ← All posts
          </Link>

          <div style={{ maxWidth: "740px" }}>

            {/* Tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
              {post.tags.map((tag) => (
                <span key={tag} style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: TAG_TEXT[tag] ?? "#a78bfa", background: `${TAG_TEXT[tag] ?? "#8b5cf6"}15`, padding: "3px 8px", borderRadius: "100px" }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(1.625rem,4vw,2.25rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--color-text)", margin: "0 0 16px", lineHeight: 1.1 }}>
              {post.title}
            </h1>

            {/* Meta */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "48px", paddingBottom: "32px", borderBottom: "1px solid var(--color-border-subtle)" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--color-purple)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "var(--font-syne)", fontSize: "13px", fontWeight: 800, color: "var(--color-text)" }}>O</span>
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "12px", color: "var(--color-text)", margin: 0, fontWeight: 600 }}>Oliver White</p>
                <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "var(--color-text-muted)", margin: 0 }}>
                  {new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  {" · "}{post.readingTime} min read
                </p>
              </div>
            </div>

            {/* Body */}
            <div>
              {post.sections.map((section, i) => renderSection(section, i))}
            </div>

            {/* Footer */}
            <div style={{ marginTop: "56px", paddingTop: "32px", borderTop: "1px solid var(--color-border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "var(--color-text-muted)", margin: "0 0 4px" }}>Written by</p>
                <p style={{ fontFamily: "var(--font-syne)", fontSize: "0.9375rem", fontWeight: 700, color: "var(--color-text)", margin: 0 }}>Oliver White</p>
              </div>
              <Link
                href="/blog"
                style={{ fontFamily: "var(--font-dm-mono)", fontSize: "13px", color: "var(--color-purple-light)", textDecoration: "none", padding: "8px 18px", border: "1px solid var(--color-border-mid)", borderRadius: "100px" }}
              >
                ← All posts
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
