// app/contests/page.tsx [SERVER]
import { createPublicClient } from "@/lib/supabase/server";
import { auth } from "@/auth";
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

type UpcomingContest = {
  id: string;
  contest_number: number;
  contest_type: string;
  theme: string | null;
  theme_description: string | null;
  start_date: string;
  end_date: string;
};

function UpcomingCard({ contest, submitHref }: { contest: UpcomingContest; submitHref: string | null }) {
  const isPhoto = contest.contest_type === "photo";
  const votingOpens = new Date(contest.start_date);
  const dateStr = votingOpens.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "America/New_York" });
  const timeStr = votingOpens.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short", timeZone: "America/New_York" });

  const accentColor = isPhoto ? "#f59e0b" : "var(--color-purple-light)";
  const accentBorder = isPhoto ? "rgba(245,158,11,0.2)" : "rgba(139,92,246,0.18)";
  const btnBg = isPhoto ? "rgba(245,158,11,0.1)" : "var(--color-purple-dim)";
  const btnBorder = isPhoto ? "rgba(245,158,11,0.35)" : "rgba(139,92,246,0.35)";

  const title = isPhoto
    ? `Photo Contest #${contest.contest_number}${contest.theme ? ` — ${contest.theme}` : ""}`
    : `AI Art Contest #${contest.contest_number}${contest.theme ? ` — ${contest.theme}` : ""}`;

  return (
    <div
      style={{
        background: "var(--color-bg-surface)",
        border: `1px solid ${accentBorder}`,
        borderRadius: "14px",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "24px",
        flexWrap: "wrap",
      }}
    >
      <div>
        <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.125rem", color: "var(--color-text)", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
          {title}
        </h3>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
            Voting opens
          </span>
          <span style={{ fontFamily: "var(--font-syne)", fontSize: "1.125rem", fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.02em" }}>
            {dateStr}
          </span>
          <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.8125rem", fontWeight: 600, color: accentColor }}>
            {timeStr}
          </span>
        </div>
      </div>

      {submitHref && (
        <Link
          href={submitHref}
          style={{
            padding: "9px 20px",
            background: btnBg,
            border: `1px solid ${btnBorder}`,
            borderRadius: "100px",
            color: accentColor,
            fontFamily: "var(--font-dm-mono)",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textDecoration: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {isPhoto ? "Submit your photo →" : "Submit artwork →"}
        </Link>
      )}
    </div>
  );
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
            {contest.theme ?? `Contest #${contest.contest_number}`}
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
  const session = await auth();

  const [{ data: contests }, { data: upcomingContests }] = await Promise.all([
    supabase
      .from("contests")
      .select("id, contest_number, status, contest_type, theme, theme_description, start_date, end_date, artwork_count, created_at, updated_at, artworks(id, image_url, title, vote_count, contest_id, prompt, created_at, updated_at)")
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase
      .from("contests")
      .select("id, contest_number, contest_type, theme, theme_description, submissions_open_at, start_date, end_date")
      .eq("status", "upcoming")
      .order("contest_number", { ascending: true }),
  ]);

  const allActive = (contests ?? []) as Array<Contest & { artworks: Artwork[] }>;

  const isSignedIn = !!session?.user;

  // Sign-in callbackUrls for the banner buttons
  const photoSignInUrl = `/api/auth/signin?callbackUrl=${encodeURIComponent("/contests/photo/submit")}`;
  const aiArtSignInUrl = `/api/auth/signin?callbackUrl=${encodeURIComponent("/contests/ai-art/submit")}`;

  return (
    <div className="animate-page" style={{ paddingTop: "48px", paddingBottom: "80px" }}>
      <div className="shell">

        {/* ── SUBMIT BANNER ─────────────────────────────────────────── */}
        {!isSignedIn ? (
          /* Unauthenticated: full hero banner */
          <div
            style={{
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border-mid)",
              borderRadius: "16px",
              padding: "36px 40px",
              marginBottom: "56px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* subtle purple glow */}
            <div aria-hidden style={{ position: "absolute", top: "-60px", right: "-60px", width: "260px", height: "260px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
            <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-purple-light)", marginBottom: "12px" }}>
              Enter a contest
            </p>
            <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "clamp(1.5rem, 3vw, 2rem)", letterSpacing: "-0.03em", color: "var(--color-text)", margin: "0 0 8px", lineHeight: 1.1 }}>
              Submit your work. Win the vote.
            </h2>
            <p style={{ fontSize: "0.9375rem", color: "var(--color-text-muted)", lineHeight: 1.6, margin: "0 0 28px", maxWidth: "480px" }}>
              Sign in to enter. Photo contests accept real photography. AI art contests accept AI-generated images.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              <Link
                href={photoSignInUrl}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  background: "rgba(245,158,11,0.1)",
                  border: "1px solid rgba(245,158,11,0.35)",
                  borderRadius: "100px",
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#f59e0b",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Submit your photo &rarr;
              </Link>
              <Link
                href={aiArtSignInUrl}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  background: "var(--color-purple-dim)",
                  border: "1px solid rgba(139,92,246,0.35)",
                  borderRadius: "100px",
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-purple-light)",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Submit AI art &rarr;
              </Link>
            </div>
          </div>
        ) : (
          /* Signed in: compact strip */
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              padding: "14px 20px",
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "10px",
              marginBottom: "40px",
            }}
          >
            <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
              Enter a contest
            </span>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Link
                href="/contests/photo/submit"
                style={{
                  padding: "7px 16px",
                  background: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.25)",
                  borderRadius: "100px",
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#f59e0b",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Submit photo &rarr;
              </Link>
              <Link
                href="/contests/ai-art/submit"
                style={{
                  padding: "7px 16px",
                  background: "var(--color-purple-dim2)",
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: "100px",
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-purple-light)",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Submit AI art &rarr;
              </Link>
            </div>
          </div>
        )}

        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-purple-light)", marginBottom: "16px" }}>
          All contests
        </p>
        <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.03em", color: "var(--color-text)", marginBottom: "12px" }}>
          Contests
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "15px", margin: "0 0 56px" }}>
          Vote on live contests, or submit to upcoming ones.
        </p>

        {/* 1. Live now */}
        <section style={{ marginBottom: "56px" }}>
          <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1.125rem", color: "var(--color-text)", margin: "0 0 20px" }}>
            Live now
          </h2>
          {allActive.length === 0 ? (
            <EmptySection label="active" />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
              {allActive.map((contest, i) => (
                <ContestCard key={contest.id} contest={contest} priority={i === 0} />
              ))}
            </div>
          )}
        </section>

        {/* 2. Coming up */}
        {(upcomingContests ?? []).length > 0 && (
          <section style={{ marginBottom: "56px" }}>
            <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1.125rem", color: "var(--color-text)", margin: "0 0 20px" }}>
              Coming up
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {(upcomingContests ?? []).map((uc) => {
                const submitPath = uc.contest_type === "photo"
                  ? `/contests/photo/${uc.id}/submit`
                  : `/contests/ai-art/${uc.id}/submit`;
              const submitHref = session?.user
                  ? submitPath
                  : `/api/auth/signin?callbackUrl=${encodeURIComponent(submitPath)}`;
                return <UpcomingCard key={uc.id} contest={uc} submitHref={submitHref} />;
              })}
            </div>
          </section>
        )}

        {/* 3. Archives */}
        <section>
          <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1.125rem", color: "var(--color-text)", margin: "0 0 16px" }}>
            Archive
          </h2>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/contests/ai-art/archive" style={{ padding: "10px 20px", background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: "8px", fontFamily: "var(--font-dm-mono)", fontSize: "12px", fontWeight: 600, color: "var(--color-text-muted)", textDecoration: "none", letterSpacing: "0.06em" }}>
              AI Art archive →
            </Link>
            <Link href="/contests/photo/archive" style={{ padding: "10px 20px", background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: "8px", fontFamily: "var(--font-dm-mono)", fontSize: "12px", fontWeight: 600, color: "var(--color-text-muted)", textDecoration: "none", letterSpacing: "0.06em" }}>
              Photography archive →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
