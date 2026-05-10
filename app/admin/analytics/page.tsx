import { getAnalyticsSummary } from "@/lib/data/analytics";
import { MetricCard } from "@/components/admin/analytics/MetricCard";
import { VoteTrendChart } from "@/components/admin/analytics/VoteTrendChart";
import { ContestBarChart } from "@/components/admin/analytics/ContestBarChart";
import { EngagementDonut } from "@/components/admin/analytics/EngagementDonut";
import { TopArtworksTable } from "@/components/admin/analytics/TopArtworksTable";
import { ContestStatsTable } from "@/components/admin/analytics/ContestStatsTable";

export const metadata = { title: "Analytics — Admin" };
export const revalidate = 300;

const card: React.CSSProperties = {
  background: "#111119",
  border: "1px solid rgba(139,92,246,0.12)",
  borderRadius: "14px",
  padding: "24px",
};

const cardLabel: React.CSSProperties = {
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "#7878a0",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: "20px",
};

export default async function AnalyticsPage() {
  const analytics = await getAnalyticsSummary();

  const {
    totalVotes,
    totalArtworks,
    totalContests,
    avgVotesPerContest,
    avgVotesPerArtwork,
    engagement,
    dailyVotes,
    contestStats,
    topArtworks,
  } = analytics;

  const last7 = dailyVotes.slice(-7).reduce((s, d) => s + d.vote_count, 0);
  const prev7 = dailyVotes.slice(-14, -7).reduce((s, d) => s + d.vote_count, 0);
  const weekTrend = prev7 > 0 ? (((last7 - prev7) / prev7) * 100).toFixed(0) : null;

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

      {/* Key metrics grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
        <MetricCard
          label="Total Votes"
          value={totalVotes}
          sub={weekTrend !== null ? `${weekTrend.startsWith("-") ? "" : "+"}${weekTrend}% vs last 7 days` : undefined}
          color="#8b5cf6"
        />
        <MetricCard
          label="Avg per Contest"
          value={avgVotesPerContest.toFixed(1)}
          sub={`across ${totalContests} contest${totalContests !== 1 ? "s" : ""}`}
          color="#a78bfa"
        />
        <MetricCard
          label="Avg per Artwork"
          value={avgVotesPerArtwork.toFixed(1)}
          sub={`across ${totalArtworks} artwork${totalArtworks !== 1 ? "s" : ""}`}
          color="#34d399"
        />
      </div>

      {/* Vote trend + engagement row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "16px" }}>
        <div style={card}>
          <p style={cardLabel}>Votes — last 30 days</p>
          <VoteTrendChart data={dailyVotes} days={30} />
        </div>
        <div style={card}>
          <p style={cardLabel}>Voter Breakdown</p>
          <EngagementDonut data={engagement} />
        </div>
      </div>

      {/* Contest performance bar chart */}
      <div style={card}>
        <p style={cardLabel}>Votes per Contest</p>
        <ContestBarChart data={contestStats} />
        <p style={{ fontSize: "0.6875rem", color: "#3a3a58", marginTop: "10px", fontFamily: "var(--font-dm-mono)" }}>
          Green bar = active contest
        </p>
      </div>

      {/* Top artworks + 90-day trend side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div style={card}>
          <p style={cardLabel}>Top 10 Artworks</p>
          <TopArtworksTable artworks={topArtworks} />
        </div>
        <div style={card}>
          <p style={cardLabel}>Votes — last 90 days</p>
          <VoteTrendChart data={dailyVotes} days={90} />
        </div>
      </div>

      {/* Contest detail table */}
      <div style={card}>
        <p style={cardLabel}>Contest Breakdown</p>
        <ContestStatsTable data={contestStats} />
      </div>
    </div>
  );
}
