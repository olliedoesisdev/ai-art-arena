import { createClient } from "@/lib/supabase/server";
import { LeaderboardList } from "@/components/leaderboard/LeaderboardList";
import { LeaderboardFeatured } from "@/components/leaderboard/LeaderboardFeatured";

export const revalidate = 300;

export const metadata = {
  title: "Leaderboard — AI Art Arena",
  description: "All-time highest-voted artworks across every AI Art Arena contest.",
  openGraph: {
    title: "Leaderboard — AI Art Arena",
    description: "All-time highest-voted artworks across every AI Art Arena contest.",
    url: "https://olliedoesis.dev/leaderboard",
    siteName: "AI Art Arena",
    images: [{ url: "https://olliedoesis.dev/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Leaderboard — AI Art Arena",
    description: "All-time highest-voted artworks across every AI Art Arena contest.",
    images: ["https://olliedoesis.dev/og-image.png"],
  },
};

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const { data: artworks } = await supabase
    .from("artworks")
    .select("id, title, image_url, vote_count, contest_id, contests(week_number)")
    .order("vote_count", { ascending: false })
    .limit(20);

  type LeaderboardEntry = {
    id: string;
    title: string;
    image_url: string;
    vote_count: number;
    contest_id: string;
    contests: { week_number: number } | null;
  };

  const entries: LeaderboardEntry[] = (artworks ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    image_url: a.image_url,
    vote_count: a.vote_count,
    contest_id: a.contest_id,
    contests: Array.isArray(a.contests)
      ? (a.contests[0] as { week_number: number } | undefined) ?? null
      : (a.contests as { week_number: number } | null),
  }));

  const topArtwork = entries[0] ?? null;

  return (
    <div className="animate-page" style={{ paddingTop: "48px", paddingBottom: "80px" }}>
      <div className="shell">
        <p
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#a78bfa",
            marginBottom: "16px",
          }}
        >
          All time
        </p>
        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "clamp(2rem, 5vw, 3rem)",
            letterSpacing: "-0.03em",
            color: "#eeeeff",
            marginBottom: "48px",
          }}
        >
          Leaderboard
        </h1>

        {entries.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              background: "#111119",
              border: "1px solid rgba(139,92,246,0.12)",
              borderRadius: "14px",
            }}
          >
            <p style={{ fontSize: "0.875rem", color: "#7878a0" }}>
              No votes have been cast yet. Be the first to vote!
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: topArtwork ? "1fr 360px" : "1fr",
              gap: "32px",
              alignItems: "start",
            }}
          >
            <LeaderboardList artworks={entries} />
            {topArtwork && <LeaderboardFeatured artwork={topArtwork} />}
          </div>
        )}
      </div>
    </div>
  );
}
