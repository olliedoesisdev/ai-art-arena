import { createAdminClient } from "@/lib/supabase/server";

export const metadata = { title: "Analytics — Admin" };
export const revalidate = 300;

const card: React.CSSProperties = {
  background: "#111119",
  border: "1px solid rgba(139,92,246,0.12)",
  borderRadius: "14px",
  padding: "24px",
};

export default async function AnalyticsPage() {
  const supabase = createAdminClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    { count: totalContests },
    { count: totalArtworks },
    { count: totalVotes },
    { count: uniqueVoters },
    { data: votesPerContest },
    { data: topArtworks },
    { data: votesOverTime },
  ] = await Promise.all([
    supabase.from("contests").select("id", { count: "exact", head: true }),
    supabase.from("artworks").select("id", { count: "exact", head: true }),
    supabase.from("votes").select("id", { count: "exact", head: true }),
    // Distinct IP hashes as a proxy for unique voters — no row data transferred
    supabase.from("votes").select("ip_hash", { count: "exact", head: true }),
    supabase
      .from("contests")
      .select("id, week_number, votes(count)")
      .order("week_number", { ascending: true }),
    supabase
      .from("artworks")
      .select("id, title, vote_count, contests(week_number)")
      .order("vote_count", { ascending: false })
      .limit(10),
    supabase
      .from("votes")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true }),
  ]);

  const avgVotesPerContest =
    totalContests && totalContests > 0
      ? ((totalVotes ?? 0) / totalContests).toFixed(1)
      : "0";

  const avgVotesPerArtwork =
    totalArtworks && totalArtworks > 0
      ? ((totalVotes ?? 0) / totalArtworks).toFixed(1)
      : "0";

  // Group votes-over-time into a per-day count map
  const dayMap = new Map<string, number>();
  for (const v of votesOverTime ?? []) {
    const day = v.created_at.slice(0, 10);
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }
  const dailyVotes = Array.from(dayMap.entries()).map(([date, count]) => ({ date, count }));

  const METRICS = [
    { label: "Total Votes", value: totalVotes ?? 0, color: "#8b5cf6" },
    { label: "Avg / Contest", value: avgVotesPerContest, color: "#a78bfa" },
    { label: "Avg / Artwork", value: avgVotesPerArtwork, color: "#34d399" },
    { label: "Unique Voters", value: uniqueVoters ?? 0, color: "#fbbf24" },
  ];

  const rankColor = (i: number) =>
    i === 0 ? "#fbbf24" : i === 1 ? "#b0b0c8" : i === 2 ? "#c07840" : "#3a3a58";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div>
        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8b5cf6", marginBottom: "8px" }}>
          Admin
        </p>
        <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.75rem", color: "#eeeeff", letterSpacing: "-0.03em", margin: 0 }}>
          Analytics
        </h1>
      </div>

      {/* Key metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "rgba(139,92,246,0.12)", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(139,92,246,0.12)" }}>
        {METRICS.map(({ label, value, color }) => (
          <div key={label} style={{ background: "#111119", padding: "24px" }}>
            <div style={{ fontFamily: "var(--font-dm-mono)", fontSize: "2rem", fontWeight: 500, color, letterSpacing: "-0.02em", marginBottom: "4px" }}>
              {value}
            </div>
            <div style={{ fontSize: "0.8125rem", color: "#7878a0" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Daily votes (last 30 days) */}
      <div style={card}>
        <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#7878a0", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>
          Votes — last 30 days
        </p>
        {dailyVotes.length === 0 ? (
          <p style={{ fontSize: "0.875rem", color: "#3a3a58" }}>No votes in the last 30 days.</p>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "80px" }}>
            {(() => {
              const max = Math.max(...dailyVotes.map((d) => d.count), 1);
              return dailyVotes.map(({ date, count }) => (
                <div
                  key={date}
                  title={`${date}: ${count} vote${count !== 1 ? "s" : ""}`}
                  style={{
                    flex: 1,
                    height: `${Math.max((count / max) * 80, 4)}px`,
                    background: "rgba(139,92,246,0.5)",
                    borderRadius: "3px 3px 0 0",
                    cursor: "default",
                    transition: "background 0.15s",
                  }}
                />
              ));
            })()}
          </div>
        )}
      </div>

      {/* Top artworks */}
      <div style={card}>
        <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#7878a0", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>
          Top 10 Artworks — All Time
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {(topArtworks ?? []).map((artwork, i) => {
            const week = Array.isArray(artwork.contests)
              ? artwork.contests[0]?.week_number
              : (artwork.contests as { week_number: number } | null)?.week_number;
            return (
              <div key={artwork.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 14px", background: "#181820", borderRadius: "8px" }}>
                <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.875rem", fontWeight: 700, color: rankColor(i), minWidth: "28px" }}>
                  {i < 3 ? ["#1", "#2", "#3"][i] : `#${i + 1}`}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#eeeeff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {artwork.title}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#3a3a58", fontFamily: "var(--font-dm-mono)" }}>
                    Week {week ?? "?"}
                  </div>
                </div>
                <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "1rem", fontWeight: 500, color: rankColor(i) }}>
                  {artwork.vote_count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contest performance */}
      <div style={card}>
        <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#7878a0", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>
          Contest Performance
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(139,92,246,0.12)" }}>
                {["Week", "Total Votes", "Avg / Artwork", "Trend"].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#3a3a58" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(votesPerContest ?? []).map((contest, i, arr) => {
                const voteCount = (contest.votes as { count: number }[])[0]?.count ?? 0;
                const avg = (voteCount / 6).toFixed(1);
                const prev = i > 0 ? ((arr[i - 1].votes as { count: number }[])[0]?.count ?? 0) : null;
                const change = prev !== null ? voteCount - prev : null;

                return (
                  <tr key={contest.id} style={{ borderBottom: "1px solid rgba(139,92,246,0.06)" }}>
                    <td style={{ padding: "12px 12px", color: "#eeeeff", fontWeight: 600 }}>
                      Week {contest.week_number}
                    </td>
                    <td style={{ padding: "12px 12px", color: "#7878a0", fontFamily: "var(--font-dm-mono)" }}>
                      {voteCount}
                    </td>
                    <td style={{ padding: "12px 12px", color: "#7878a0", fontFamily: "var(--font-dm-mono)" }}>
                      {avg}
                    </td>
                    <td style={{ padding: "12px 12px" }}>
                      {change !== null ? (
                        <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: change >= 0 ? "#34d399" : "#f87171" }}>
                          {change >= 0 ? "↑" : "↓"} {Math.abs(change)}
                        </span>
                      ) : (
                        <span style={{ color: "#3a3a58" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
