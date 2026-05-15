import { createAdminClient } from "@/lib/supabase/server";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArchiveButton } from "@/components/admin/ArchiveButton";

type RouteContext = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: RouteContext) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase.from("contests").select("week_number").eq("id", id).single();
  return { title: data ? `Day ${data.week_number} — Admin` : "Contest — Admin" };
}

export default async function ContestDetailPage({ params }: RouteContext) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/signin");

  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: contest }, { data: artworks }] = await Promise.all([
    supabase.from("contests").select("*").eq("id", id).single(),
    supabase.from("artworks").select("id, title, image_url, vote_count, prompt, display_order").eq("contest_id", id).order("display_order"),
  ]);

  if (!contest) notFound();

  const totalVotes = artworks?.reduce((s, a) => s + a.vote_count, 0) ?? 0;
  const leading = artworks?.reduce((top, a) => (a.vote_count > (top?.vote_count ?? -1) ? a : top), artworks[0]);

  const cell: React.CSSProperties = { fontSize: "0.8125rem", color: "var(--color-text-muted)", padding: "13px 16px" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Breadcrumb + header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Link href="/admin/contests" style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", textDecoration: "none" }}>Contests</Link>
          <span style={{ color: "var(--color-text-dim)" }}>/</span>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text)" }}>Day {contest.week_number}</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-purple)", marginBottom: "8px" }}>Contest</p>
            <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.75rem", color: "var(--color-text)", letterSpacing: "-0.03em" }}>
              Day {contest.week_number}
            </h1>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexShrink: 0, paddingTop: "28px" }}>
            <Link href={`/contest/${id}`} target="_blank" style={{
              fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-purple)",
              border: "1px solid rgba(139,92,246,0.3)", borderRadius: "8px",
              padding: "8px 16px", textDecoration: "none",
            }}>
              View live →
            </Link>
            {contest.status === "active" && <ArchiveButton contestId={id} />}
          </div>
        </div>
      </div>

      {/* Meta strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "var(--color-border-subtle)", borderRadius: "14px", overflow: "hidden", border: "1px solid var(--color-border-subtle)" }}>
        {[
          { label: "Status", value: contest.status },
          { label: "Total votes", value: totalVotes },
          { label: "Artworks", value: artworks?.length ?? 0 },
          { label: "Ends", value: new Date(contest.end_date).toLocaleDateString() },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "var(--color-bg-surface)", padding: "20px 24px" }}>
            <div style={{ fontFamily: "var(--font-dm-mono)", fontSize: "1.5rem", fontWeight: 500, color: "var(--color-text)" }}>{value}</div>
            <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: "2px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Artworks table */}
      <div style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: "14px", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--color-border-subtle)" }}>
          <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Artworks ({artworks?.length ?? 0} / {contest.artwork_count})
          </p>
          <Link href="/admin/artworks/upload" style={{
            fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-status-success)",
            border: "1px solid rgba(52,211,153,0.25)", borderRadius: "6px",
            padding: "6px 14px", textDecoration: "none",
          }}>
            + Upload more
          </Link>
        </div>

        {!artworks || artworks.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "12px" }}>No artworks yet</p>
            <Link href="/admin/artworks/upload" style={{ color: "var(--color-purple)", fontSize: "0.875rem", textDecoration: "none" }}>
              Upload artworks →
            </Link>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 1fr 80px 100px", gap: "8px", padding: "8px 16px", borderBottom: "1px solid rgba(139,92,246,0.08)" }}>
              {["#", "Artwork", "Prompt", "Votes", "Share"].map((h) => (
                <div key={h} style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-dim)" }}>{h}</div>
              ))}
            </div>

            {artworks.map((artwork, i) => {
              const pct = totalVotes > 0 ? Math.round((artwork.vote_count / totalVotes) * 100) : 0;
              const isLeading = artwork.id === leading?.id && totalVotes > 0;
              return (
                <div key={artwork.id} style={{
                  display: "grid", gridTemplateColumns: "48px 1fr 1fr 80px 100px",
                  gap: "8px", alignItems: "center",
                  borderBottom: i < artworks.length - 1 ? "1px solid rgba(139,92,246,0.08)" : "none",
                  background: isLeading ? "rgba(251,191,36,0.04)" : "transparent",
                }}>
                  {/* Thumbnail + rank */}
                  <div style={{ ...cell, paddingRight: 0 }}>
                    <div style={{ position: "relative", width: "36px", height: "36px", borderRadius: "6px", overflow: "hidden", background: "var(--color-bg-surface2)" }}>
                      <Image src={artwork.image_url} alt={artwork.title} fill sizes="36px" style={{ objectFit: "cover" }} />
                    </div>
                  </div>

                  {/* Title + bar */}
                  <div style={cell}>
                    <div style={{ fontSize: "0.875rem", fontWeight: 600, color: isLeading ? "var(--color-status-warning)" : "var(--color-text)", marginBottom: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {artwork.title}
                      {isLeading && <span style={{ fontSize: "0.6875rem", marginLeft: "8px", color: "var(--color-status-warning)" }}>LEADING</span>}
                    </div>
                    <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: isLeading ? "var(--color-status-warning)" : "var(--color-purple)", borderRadius: "2px", transition: "width 0.6s ease" }} />
                    </div>
                  </div>

                  {/* Prompt */}
                  <div style={{ ...cell, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>
                    {artwork.prompt ?? <span style={{ color: "var(--color-text-dim)" }}>—</span>}
                  </div>

                  {/* Vote count + pct */}
                  <div style={cell}>
                    <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.9375rem", color: "var(--color-text)" }}>{artwork.vote_count}</span>
                    <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.75rem", color: "var(--color-text-dim)", marginLeft: "4px" }}>{pct}%</span>
                  </div>

                  {/* Display order */}
                  <div style={cell}>
                    <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.75rem", color: "var(--color-text-dim)" }}>
                      #{artwork.display_order}
                    </span>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Dates */}
      <div style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: "14px", padding: "20px 24px" }}>
        <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>Schedule</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-dim)", marginBottom: "4px" }}>Start</div>
            <div style={{ fontSize: "0.875rem", color: "var(--color-text)" }}>{new Date(contest.start_date).toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-dim)", marginBottom: "4px" }}>End</div>
            <div style={{ fontSize: "0.875rem", color: "var(--color-text)" }}>{new Date(contest.end_date).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
