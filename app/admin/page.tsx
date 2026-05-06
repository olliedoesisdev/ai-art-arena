import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Admin — AI Art Arena" };

const card: React.CSSProperties = {
  background: "#111119",
  border: "1px solid rgba(139,92,246,0.12)",
  borderRadius: "14px",
  padding: "24px",
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/signin");

  const supabase = await createClient();

  const [contestsResult, artworksResult, votesResult, recentContests, recentVotes] =
    await Promise.all([
      supabase.from("contests").select("id, status"),
      supabase.from("artworks").select("id", { count: "exact", head: true }),
      supabase.from("votes").select("id, created_at"),
      supabase.from("contests").select("id, week_number, status, start_date, end_date").order("week_number", { ascending: false }).limit(5),
      supabase.from("votes").select("id, created_at, artworks(title, contests(week_number))").order("created_at", { ascending: false }).limit(8),
    ]);

  const activeContests = contestsResult.data?.filter((c) => c.status === "active").length ?? 0;
  const totalContests = contestsResult.data?.length ?? 0;
  const totalArtworks = artworksResult.count ?? 0;
  const totalVotes = votesResult.data?.length ?? 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const votesToday = votesResult.data?.filter((v) => new Date(v.created_at) >= today).length ?? 0;

  const STATS = [
    { label: "Active contests", value: activeContests, sub: `${totalContests - activeContests} archived` },
    { label: "Total artworks", value: totalArtworks, sub: "across all contests" },
    { label: "Total votes", value: totalVotes, sub: `${votesToday} today` },
    { label: "Total contests", value: totalContests, sub: activeContests > 0 ? "currently active" : "none active" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8b5cf6", marginBottom: "8px" }}>
          Overview
        </p>
        <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.75rem", color: "#eeeeff", letterSpacing: "-0.03em" }}>
          Dashboard
        </h1>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "rgba(139,92,246,0.12)", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(139,92,246,0.12)" }}>
        {STATS.map(({ label, value, sub }) => (
          <div key={label} style={{ background: "#111119", padding: "24px" }}>
            <div style={{ fontFamily: "var(--font-dm-mono)", fontSize: "2rem", fontWeight: 500, color: "#eeeeff", letterSpacing: "-0.02em", marginBottom: "4px" }}>
              {value}
            </div>
            <div style={{ fontSize: "0.8125rem", color: "#7878a0", marginBottom: "2px" }}>{label}</div>
            <div style={{ fontSize: "0.75rem", color: "#3a3a58" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={card}>
        <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#7878a0", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Quick actions</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
          {[
            { href: "/admin/contests/new", label: "New Contest", color: "#8b5cf6" },
            { href: "/admin/artworks/upload", label: "Upload Artworks", color: "#34d399" },
            { href: "/admin/analytics", label: "Analytics", color: "#a78bfa" },
            { href: "/admin/contests", label: "Manage Contests", color: "#fbbf24" },
          ].map(({ href, label, color }) => (
            <Link key={href} href={href} style={{
              display: "block", padding: "14px 18px", borderRadius: "10px",
              border: `1px solid ${color}30`, background: `${color}08`,
              color, fontSize: "0.875rem", fontWeight: 600, textDecoration: "none",
            }}>
              {label} →
            </Link>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Recent contests */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#7878a0", textTransform: "uppercase", letterSpacing: "0.08em" }}>Recent Contests</p>
            <Link href="/admin/contests" style={{ fontSize: "0.75rem", color: "#8b5cf6", textDecoration: "none" }}>View all</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {(recentContests.data ?? []).length === 0 ? (
              <p style={{ fontSize: "0.875rem", color: "#3a3a58" }}>No contests yet</p>
            ) : (recentContests.data ?? []).map((c) => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#181820", borderRadius: "8px" }}>
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#eeeeff" }}>Week {c.week_number}</div>
                  <div style={{ fontSize: "0.75rem", color: "#7878a0" }}>
                    {new Date(c.start_date).toLocaleDateString()} — {new Date(c.end_date).toLocaleDateString()}
                  </div>
                </div>
                <span style={{
                  fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                  padding: "3px 8px", borderRadius: "100px",
                  background: c.status === "active" ? "rgba(52,211,153,0.12)" : "rgba(139,92,246,0.08)",
                  color: c.status === "active" ? "#34d399" : "#7878a0",
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
            <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#7878a0", textTransform: "uppercase", letterSpacing: "0.08em" }}>Recent Votes</p>
            <Link href="/admin/analytics" style={{ fontSize: "0.75rem", color: "#8b5cf6", textDecoration: "none" }}>Analytics</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {(recentVotes.data ?? []).length === 0 ? (
              <p style={{ fontSize: "0.875rem", color: "#3a3a58" }}>No votes yet</p>
            ) : (recentVotes.data ?? []).map((v, i) => {
              const artwork = v.artworks as any;
              return (
                <div key={v.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 14px", background: "#181820", borderRadius: "8px" }}>
                  <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.75rem", color: "#3a3a58", minWidth: "20px" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.8125rem", color: "#eeeeff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {artwork?.title ?? "Unknown"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#7878a0" }}>Week {(artwork?.contests as any)?.week_number ?? "?"}</div>
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: "#3a3a58" }}>
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
