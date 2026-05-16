// app/contests/page.tsx [SERVER]
import { createPublicClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";
import Link from "next/link";
import Image from "next/image";
import { Contest, Artwork } from "@/lib/types";
import { ThemeBadge } from "@/components/contest/ThemeBadge";
import { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contests — AI Art Arena",
  description: "All active voting contests on AI Art Arena. Vote on AI art and photography.",
  alternates: { canonical: `${SITE_URL}/contests` },
  openGraph: {
    title: "Contests — AI Art Arena",
    description: "All active voting contests on AI Art Arena.",
    url: `${SITE_URL}/contests`,
    siteName: "AI Art Arena",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "AI Art Arena Contests" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contests — AI Art Arena",
    description: "All active voting contests on AI Art Arena.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

function contestHref(contest: Contest) {
  return contest.contest_type === "photo"
    ? `/contests/photo/${contest.id}`
    : `/contests/ai-art/${contest.id}`;
}

function typeLabel(type: string) {
  return type === "photo" ? "Photo" : "AI Art";
}

function EmptySection({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "40px 28px",
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "14px",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", margin: 0 }}>
        No active {label} contest right now. Check back soon.
      </p>
    </div>
  );
}

function ContestCard({
  contest,
  priority,
}: {
  contest: Contest & { artworks?: Artwork[] };
  priority: boolean;
}) {
  const preview = contest.artworks?.[0];
  const href = contestHref(contest);
  const label = typeLabel(contest.contest_type);
  const endDate = new Date(contest.end_date);
  const formattedEnd = endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <article
        className="group"
        style={{
          background: "var(--color-bg-surface)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "14px",
          overflow: "hidden",
          transition: "transform 0.2s, border-color 0.2s",
        }}
      >
        {/* Preview image */}
        {preview ? (
          <div style={{ position: "relative", aspectRatio: "16/9" }}>
            <Image
              src={preview.image_url}
              alt={preview.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div
              style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-bg-base)",
                background: "rgba(139,92,246,0.9)",
                padding: "3px 10px",
                borderRadius: "100px",
              }}
            >
              {label}
            </div>
          </div>
        ) : (
          <div
            style={{
              aspectRatio: "16/9",
              background: "var(--color-bg-surface2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-dim)" }}>
              {label} — no artworks yet
            </span>
          </div>
        )}

        <div style={{ padding: "20px 24px" }}>
          {contest.theme && (
            <div style={{ marginBottom: "8px" }}>
              <ThemeBadge theme={contest.theme} />
            </div>
          )}

          <h2
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 700,
              fontSize: "1.125rem",
              color: "var(--color-text)",
              marginBottom: "6px",
            }}
          >
            {contest.theme ?? `Day ${contest.week_number}`}
          </h2>

          {contest.theme_description && (
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.55,
                marginBottom: "12px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              } as React.CSSProperties}
            >
              {contest.theme_description}
            </p>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
              }}
            >
              Closes {formattedEnd}
            </span>
            <span
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-purple-light)",
              }}
            >
              Vote →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default async function ContestsPage() {
  const supabase = createPublicClient();

  const { data: contests } = await supabase
    .from("contests")
    .select("id, week_number, status, contest_type, theme, theme_description, start_date, end_date, artwork_count, created_at, updated_at, artworks(id, image_url, title, vote_count, contest_id, prompt, created_at, updated_at)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const allContests = (contests ?? []) as Array<Contest & { artworks: Artwork[] }>;
  const aiArt = allContests.filter((c) => c.contest_type === "ai_art");
  const photo = allContests.filter((c) => c.contest_type === "photo");

  return (
    <div className="animate-page" style={{ paddingTop: "48px", paddingBottom: "80px" }}>
      <div className="shell">
        <p
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-purple-light)",
            marginBottom: "16px",
          }}
        >
          Active now
        </p>
        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "clamp(2rem, 5vw, 3rem)",
            letterSpacing: "-0.03em",
            color: "var(--color-text)",
            marginBottom: "12px",
          }}
        >
          Contests
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "15px", margin: "0 0 56px" }}>
          Vote on the active contests below. One vote per contest.
        </p>

        {/* AI Art section */}
        <section style={{ marginBottom: "56px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 700,
                fontSize: "1.125rem",
                color: "var(--color-text)",
                margin: 0,
              }}
            >
              AI Art
            </h2>
            <Link
              href="/contests/ai-art/archive"
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "11px",
                color: "var(--color-text-muted)",
                textDecoration: "none",
                letterSpacing: "0.06em",
              }}
            >
              Archive →
            </Link>
          </div>

          {aiArt.length === 0 ? (
            <EmptySection label="AI art" />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "16px",
              }}
            >
              {aiArt.map((contest, i) => (
                <ContestCard key={contest.id} contest={contest} priority={i === 0} />
              ))}
            </div>
          )}
        </section>

        {/* Photo section */}
        <section>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 700,
                fontSize: "1.125rem",
                color: "var(--color-text)",
                margin: 0,
              }}
            >
              Photography
            </h2>
            <Link
              href="/contests/photo/archive"
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "11px",
                color: "var(--color-text-muted)",
                textDecoration: "none",
                letterSpacing: "0.06em",
              }}
            >
              Archive →
            </Link>
          </div>

          {photo.length === 0 ? (
            <EmptySection label="photo" />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "16px",
              }}
            >
              {photo.map((contest, i) => (
                <ContestCard key={contest.id} contest={contest} priority={false} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
