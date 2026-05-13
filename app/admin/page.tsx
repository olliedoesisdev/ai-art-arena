import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Admin â€” AI Art Arena" };
export const revalidate = 120;

const card: React.CSSProperties = {
  background: "var(--color-bg-surface)",
  border: "1px solid rgba(139,92,246,0.12)",
  borderRadius: "14px",
  padding: "24px",
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/signin");

  const supabase = createAdminClient();

  const todayISO = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

  const [contestsResult, artworksResult, totalVotesResult, votesTodayResult, recentContests, recentVotes] =
    await Promise.all([
      supabase.from("contests").select("id, status"),
      supabase.from("artworks").select("id", { count: "exact", head: true }),
      supabase.from("votes").select("id", { count: "exact", head: true }),
      supabase.from("votes").select("id", { count: "exact", head: true }).gte("created_at", todayISO),
      supabase.from("contests").select("id, week_number, status, start_date, end_date").order("week_number", { ascending: false }).limit(5),
      supabase.from("votes").select("id, created_at, artworks(title, contests(week_number))").order("created_at", { ascending: false }).limit(8),
    ]);

  const activeContests = contestsResult.data?.filter((c) => c.status === "active").length ?? 0;
  const totalContests = contestsResult.data?.length ?? 0;
  const totalArtworks = artworksResult.count ?? 0;
  const totalVotes = totalVotesResult.count ?? 0;
  const votesToday = votesTodayResult.count ?? 0;

  const STATS = [
    { label: "Active contests", value: activeContests, sub: `${totalContests - activeContests} archived` },
    { label: "Total artworks", value: totalArtworks, sub: "across all contests" },
    { label: "Total votes", value: totalVotes, sub: `${votesToday} today` },
    { label: "Total contests", value: totalContests, sub: activeContests > 0 ? "currently active" : "none active" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-purple)", marginBottom: "8px" }}>
          Overview
        </p>
        <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.75rem", color: "var(--color-text)", letterSpacing: "-0.03em" }}>
          Dashboard
        </h1>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "rgba(139,92,246,0.12)", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(139,92,246,0.12)" }}>
        {STATS.map(({ label, value, sub }) => (
          <div key={label} style={{ background: "var(--color-bg-surface)", padding: "24px" }}>
            <div style={{ fontFamily: "var(--font-dm-mono)", fontSize: "2rem", fontWeight: 500, color: "var(--color-text)", letterSpacing: "-0.02em", marginBottom: "4px" }}>
              {value}
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "2px" }}>{label}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-dim)" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={card}>
        <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Quick actions</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
          {[
            { href: "/admin/contests/new", label: "New Contest", color: "var(--color-purple)" },
            { href: "/admin/artworks/upload", label: "Upload Artworks", color: "var(--color-status-success)" },
            { href: "/admin/analytics", label: "Analytics", color: "var(--color-purple-light)" },
            { href: "/admin/contests", label: "Manage Contests", color: "var(--color-status-warning)" },
          ].map(({ href, label, color }) => (
            <Link key={href} href={href} style={{
              display: "block", padding: "14px 18px", borderRadius: "10px",
              border: `1px solid ${color}30`, background: `${color}08`,
              color, fontSize: "0.875rem", fontWeight: 600, textDecoration: "none",
            }}>
              {label} â†’
            </Link>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Recent contests */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Recent Contests</p>
            <Link href="/admin/contests" style={{ fontSize: "0.75rem", color: "var(--color-purple)", textDecoration: "none" }}>View all</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {(recentContests.data ?? []).length === 0 ? (
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-dim)" }}>No contests yet</p>
            ) : (recentContests.data ?? []).map((c) => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--color-bg-surface2)", borderRadius: "8px" }}>
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>Week {c.week_number}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    {new Date(c.start_date).toLocaleDateString()} â€” {new Date(c.end_date).toLocaleDateString()}
                  </div>
                </div>
                <span style={{
                  fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                  padding: "3px 8px", borderRadius: "100px",
                  background: c.status === "active" ? "rgba(52,211,153,0.12)" : "rgba(139,92,246,0.08)",
                  color: c.status === "active" ? "var(--color-status-success)" : "var(--color-text-muted)",
                }}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent votes */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Recent Votes</p>
            <Link href="/admin/analytics" style={{ fontSize: "0.75rem", color: "var(--color-purple)", textDecoration: "none" }}>Analytics</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {(recentVotes.data ?? []).length === 0 ? (
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-dim)" }}>No votes yet</p>
            ) : (recentVotes.data ?? []).map((v, i) => {
              const artworkRaw = Array.isArray(v.artworks) ? v.artworks[0] : v.artworks;
              const artwork = artworkRaw as { title: string; contests: { week_number: number }[] | null } | null;
              return (
                <div key={v.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 14px", background: "var(--color-bg-surface2)", borderRadius: "8px" }}>
                  <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.75rem", color: "var(--color-text-dim)", minWidth: "20px" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.8125rem", color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {artwork?.title ?? "Unknown"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Week {artwork?.contests?.[0]?.week_number ?? "?"}</div>
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--color-text-dim)" }}>
                    {new Date(v.created_at).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
