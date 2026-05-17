import { createPublicClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";
import { LeaderboardList } from "@/components/leaderboard/LeaderboardList";
import { LeaderboardFeatured } from "@/components/leaderboard/LeaderboardFeatured";
import { JsonLd } from "@/components/layout/JsonLd";

export const revalidate = 300;

export const metadata = {
  title: "Leaderboard — AI Art Arena",
  description: "All-time highest-voted artworks across every AI Art Arena contest.",
  alternates: { canonical: `${SITE_URL}/leaderboard` },
  openGraph: {
    title: "Leaderboard — AI Art Arena",
    description: "All-time highest-voted artworks across every AI Art Arena contest.",
    url: `${SITE_URL}/leaderboard`,
    siteName: "AI Art Arena",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "AI Art Arena all-time leaderboard" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Leaderboard — AI Art Arena",
    description: "All-time highest-voted artworks across every AI Art Arena contest.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default async function LeaderboardPage() {
  const supabase = createPublicClient();

  const { data: artworks } = await supabase
    .from("artworks")
    .select("id, title, image_url, vote_count, contest_id, contests(contest_number, contest_type)")
    .gte("vote_count", 25)
    .order("vote_count", { ascending: false })
    .limit(40);

  type LeaderboardEntry = {
    id: string;
    title: string;
    image_url: string;
    vote_count: number;
    contest_id: string;
    contests: { contest_number: number; contest_type: string } | null;
  };

  type RawRow = {
    id: string;
    title: string;
    image_url: string;
    vote_count: number;
    contest_id: string;
    contests: { contest_number: number; contest_type: string } | { contest_number: number; contest_type: string }[] | null;
  };

  const entries: LeaderboardEntry[] = ((artworks ?? []) as RawRow[]).map((a) => ({
    id: a.id,
    title: a.title,
    image_url: a.image_url,
    vote_count: a.vote_count,
    contest_id: a.contest_id,
    contests: Array.isArray(a.contests)
      ? (a.contests[0] as { contest_number: number; contest_type: string } | undefined) ?? null
      : (a.contests as { contest_number: number; contest_type: string } | null),
  }));

  const aiArtEntries = entries.filter((e) => e.contests?.contest_type === "ai_art" || e.contests?.contest_type == null);
  const photoEntries = entries.filter((e) => e.contests?.contest_type === "photo");

  const topAiArt = aiArtEntries[0] ?? null;
  const topPhoto = photoEntries[0] ?? null;

  const allTop10 = entries.slice(0, 10);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "AI Art Arena — All-Time Leaderboard",
    description: "Top artworks by all-time vote count across every AI Art Arena contest.",
    url: `${SITE_URL}/leaderboard`,
    numberOfItems: entries.length,
    itemListElement: allTop10.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: a.title,
      url: a.contests?.contest_number ? `${SITE_URL}/archive/${a.contests.contest_number}` : `${SITE_URL}/leaderboard`,
    })),
  };

  return (
    <div className="animate-page" style={{ paddingTop: "48px", paddingBottom: "80px" }}>
      <div className="shell">
        <JsonLd data={jsonLd} />
        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-purple-light)", marginBottom: "16px" }}>
          All time
        </p>
        <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.03em", color: "var(--color-text)", marginBottom: "12px" }}>
          Leaderboard
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "15px", margin: "0 0 56px" }}>
          Highest-voted artworks of all time, by contest type.
        </p>

        {/* ── AI Art ───────────────────────────────────────────────── */}
        <section style={{ marginBottom: "64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1.125rem", color: "var(--color-text)", margin: 0 }}>
              AI Art
            </h2>
            <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-purple-light)", background: "var(--color-purple-dim)", border: "1px solid var(--color-border-subtle)", borderRadius: "100px", padding: "3px 10px" }}>
              {aiArtEntries.length} entries
            </span>
          </div>
          {aiArtEntries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: "14px" }}>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", margin: 0 }}>No AI art has reached 25 votes yet.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: topAiArt ? "1fr 360px" : "1fr", gap: "32px", alignItems: "start" }}>
              <LeaderboardList artworks={aiArtEntries.slice(0, 20)} />
              {topAiArt && <LeaderboardFeatured artwork={topAiArt} />}
            </div>
          )}
        </section>

        {/* ── Photography ──────────────────────────────────────────── */}
        <section style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1.125rem", color: "var(--color-text)", margin: 0 }}>
              Photography
            </h2>
            <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#f59e0b", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "100px", padding: "3px 10px" }}>
              {photoEntries.length} entries
            </span>
          </div>
          {photoEntries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: "14px" }}>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", margin: 0 }}>No photos have reached 25 votes yet.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: topPhoto ? "1fr 360px" : "1fr", gap: "32px", alignItems: "start" }}>
              <LeaderboardList artworks={photoEntries.slice(0, 20)} />
              {topPhoto && <LeaderboardFeatured artwork={topPhoto} />}
            </div>
          )}
        </section>

        <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "var(--color-text-muted)", margin: "0", letterSpacing: "0.04em" }}>
          Built by <a href="/about" style={{ color: "var(--color-purple-light)", textDecoration: "none" }}>Oliver White</a>
        </p>
      </div>
    </div>
  );
}
