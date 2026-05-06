import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { ArchiveButton } from "@/components/admin/ArchiveButton";

export const metadata = { title: "Contests — Admin" };

export default async function ManageContestsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/signin");

  const supabase = await createClient();
  const { data: contests } = await supabase
    .from("contests")
    .select("id, week_number, start_date, end_date, status, artworks(count)")
    .order("week_number", { ascending: false });

  const total = contests?.length ?? 0;
  const active = contests?.filter((c) => c.status === "active").length ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8b5cf6", marginBottom: "8px" }}>Manage</p>
          <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.75rem", color: "#eeeeff", letterSpacing: "-0.03em" }}>Contests</h1>
        </div>
        <Link href="/admin/contests/new" style={{
          fontSize: "0.875rem", fontWeight: 700, color: "#08080e",
          background: "#8b5cf6", padding: "10px 20px", borderRadius: "8px",
          textDecoration: "none",
        }}>
          + New Contest
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "rgba(139,92,246,0.12)", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(139,92,246,0.12)" }}>
        {[
          { label: "Total", value: total },
          { label: "Active", value: active },
          { label: "Archived", value: total - active },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "#111119", padding: "20px 24px" }}>
            <div style={{ fontFamily: "var(--font-dm-mono)", fontSize: "1.75rem", fontWeight: 500, color: "#eeeeff" }}>{value}</div>
            <div style={{ fontSize: "0.8125rem", color: "#7878a0" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#111119", border: "1px solid rgba(139,92,246,0.12)", borderRadius: "14px", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr 100px 80px 120px", gap: "16px", padding: "12px 20px", borderBottom: "1px solid rgba(139,92,246,0.12)" }}>
          {["Week", "Start", "End", "Status", "Art", "Actions"].map((h) => (
            <div key={h} style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3a3a58" }}>{h}</div>
          ))}
        </div>

        {!contests || contests.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ color: "#7878a0", marginBottom: "12px" }}>No contests yet</p>
            <Link href="/admin/contests/new" style={{ color: "#8b5cf6", fontSize: "0.875rem", textDecoration: "none" }}>Create your first contest →</Link>
          </div>
        ) : contests.map((c, i) => {
          const artworkCount = (c.artworks as any)?.[0]?.count ?? 0;
          return (
            <div key={c.id} style={{
              display: "grid", gridTemplateColumns: "80px 1fr 1fr 100px 80px 120px",
              gap: "16px", padding: "14px 20px", alignItems: "center",
              borderBottom: i < contests.length - 1 ? "1px solid rgba(139,92,246,0.08)" : "none",
            }}>
              <div style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.875rem", fontWeight: 500, color: "#eeeeff" }}>
                W{c.week_number}
              </div>
              <div style={{ fontSize: "0.8125rem", color: "#7878a0" }}>{new Date(c.start_date).toLocaleDateString()}</div>
              <div style={{ fontSize: "0.8125rem", color: "#7878a0" }}>{new Date(c.end_date).toLocaleDateString()}</div>
              <div>
                <span style={{
                  fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                  padding: "3px 8px", borderRadius: "100px",
                  background: c.status === "active" ? "rgba(52,211,153,0.12)" : "rgba(139,92,246,0.08)",
                  color: c.status === "active" ? "#34d399" : "#7878a0",
                }}>
                  {c.status}
                </span>
              </div>
              <div style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.8125rem", color: "#7878a0" }}>{artworkCount}</div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <Link href={`/contest/${c.id}`} target="_blank" style={{ fontSize: "0.8125rem", color: "#8b5cf6", textDecoration: "none" }}>
                  View
                </Link>
                {c.status === "active" && <ArchiveButton contestId={c.id} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
