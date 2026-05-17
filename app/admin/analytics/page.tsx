import { getAnalyticsSummary } from "@/lib/data/analytics";
import { MetricCard } from "@/components/admin/analytics/MetricCard";
import { VoteTrendChart } from "@/components/admin/analytics/VoteTrendChart";
import { ContestBarChart } from "@/components/admin/analytics/ContestBarChart";
import { EngagementDonut } from "@/components/admin/analytics/EngagementDonut";
import { TopArtworksTable } from "@/components/admin/analytics/TopArtworksTable";
import { ContestStatsTable } from "@/components/admin/analytics/ContestStatsTable";
import { createAdminClient } from "@/lib/supabase/server";

export const metadata = { title: "Analytics — Admin" };
export const revalidate = 300;

const card: React.CSSProperties = {
  background: "var(--color-bg-surface)",
  border: "1px solid rgba(139,92,246,0.12)",
  borderRadius: "14px",
  padding: "24px",
};

const cardLabel: React.CSSProperties = {
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: "20px",
};

export default async function AnalyticsPage() {
  const supabase = createAdminClient();
  const [analytics, { data: usersRaw }, { data: subscribersRaw }] = await Promise.all([
    getAnalyticsSummary(),
    supabase.from("users").select("id, email, name, role, created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("subscribers").select("id, email, name, subscribed_at, is_active").order("subscribed_at", { ascending: false }).limit(100),
  ]);

  const users = usersRaw ?? [];
  const subscribers = subscribersRaw ?? [];

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
        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-purple)", marginBottom: "8px" }}>
          Admin
        </p>
        <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.75rem", color: "var(--color-text)", letterSpacing: "-0.03em", margin: 0 }}>
          Analytics
        </h1>
      </div>

      {/* Key metrics grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
        <MetricCard
          label="Total Votes"
          value={totalVotes}
          sub={weekTrend !== null ? `${weekTrend.startsWith("-") ? "" : "+"}${weekTrend}% vs last 7 days` : undefined}
          color="var(--color-purple)"
        />
        <MetricCard
          label="Avg per Contest"
          value={avgVotesPerContest.toFixed(1)}
          sub={`across ${totalContests} contest${totalContests !== 1 ? "s" : ""}`}
          color="var(--color-purple-light)"
        />
        <MetricCard
          label="Avg per Artwork"
          value={avgVotesPerArtwork.toFixed(1)}
          sub={`across ${totalArtworks} artwork${totalArtworks !== 1 ? "s" : ""}`}
          color="var(--color-status-success)"
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
        <p style={{ fontSize: "0.6875rem", color: "var(--color-text-dim)", marginTop: "10px", fontFamily: "var(--font-dm-mono)" }}>
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

      {/* Registered users */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <p style={cardLabel}>Registered Users ({users.length})</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 140px", gap: "8px" }}>
          {["Email", "Name", "Role", "Joined"].map((h) => (
            <div key={h} style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-dim)", paddingBottom: "8px", borderBottom: "1px solid var(--color-border-subtle)" }}>{h}</div>
          ))}
          {users.map((u) => (
            <>
              <div key={`${u.id}-email`} style={{ fontSize: "0.8125rem", color: "var(--color-text)", padding: "10px 0", borderBottom: "1px solid rgba(139,92,246,0.06)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
              <div key={`${u.id}-name`} style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", padding: "10px 0", borderBottom: "1px solid rgba(139,92,246,0.06)" }}>{u.name ?? <span style={{ color: "var(--color-text-dim)" }}>—</span>}</div>
              <div key={`${u.id}-role`} style={{ fontSize: "0.75rem", padding: "10px 0", borderBottom: "1px solid rgba(139,92,246,0.06)" }}>
                <span style={{ color: u.role === "admin" ? "var(--color-status-warning)" : "var(--color-text-dim)", fontFamily: "var(--font-dm-mono)", fontWeight: 600 }}>{u.role}</span>
              </div>
              <div key={`${u.id}-date`} style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.75rem", color: "var(--color-text-muted)", padding: "10px 0", borderBottom: "1px solid rgba(139,92,246,0.06)" }}>
                {new Date(u.created_at).toLocaleDateString()}
              </div>
            </>
          ))}
        </div>
      </div>

      {/* Newsletter subscribers */}
      {subscribers.length > 0 && (
        <div style={card}>
          <p style={cardLabel}>Newsletter Subscribers ({subscribers.length})</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 140px", gap: "8px" }}>
            {["Email", "Name", "Active", "Subscribed"].map((h) => (
              <div key={h} style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-dim)", paddingBottom: "8px", borderBottom: "1px solid var(--color-border-subtle)" }}>{h}</div>
            ))}
            {subscribers.map((s) => (
              <>
                <div key={`${s.id}-email`} style={{ fontSize: "0.8125rem", color: "var(--color-text)", padding: "10px 0", borderBottom: "1px solid rgba(139,92,246,0.06)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.email}</div>
                <div key={`${s.id}-name`} style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", padding: "10px 0", borderBottom: "1px solid rgba(139,92,246,0.06)" }}>{s.name ?? <span style={{ color: "var(--color-text-dim)" }}>—</span>}</div>
                <div key={`${s.id}-active`} style={{ fontSize: "0.75rem", padding: "10px 0", borderBottom: "1px solid rgba(139,92,246,0.06)" }}>
                  <span style={{ color: s.is_active ? "var(--color-status-success)" : "var(--color-status-error)", fontFamily: "var(--font-dm-mono)", fontWeight: 600 }}>{s.is_active ? "yes" : "no"}</span>
                </div>
                <div key={`${s.id}-date`} style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.75rem", color: "var(--color-text-muted)", padding: "10px 0", borderBottom: "1px solid rgba(139,92,246,0.06)" }}>
                  {new Date(s.subscribed_at).toLocaleDateString()}
                </div>
              </>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
