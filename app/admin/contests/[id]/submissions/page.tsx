// app/admin/contests/[id]/submissions/page.tsx [SERVER]
import { createAdminClient } from "@/lib/supabase/server";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ModerationActions } from "./ModerationActions";

type RouteContext = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: RouteContext) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase.from("contests").select("contest_number, theme").eq("id", id).single();
  const label = data?.theme ?? `Contest #${data?.contest_number}`;
  return { title: `Submissions — ${label} — Admin` };
}

export default async function SubmissionsPage({ params }: RouteContext) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/signin");

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: contest, error: contestError } = await supabase
    .from("contests")
    .select("id, contest_number, theme, status, contest_type")
    .eq("id", id)
    .single();

  if (contestError || !contest) notFound();

  if (contest.contest_type !== "photo") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <Link href={`/admin/contests/${id}`} style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", textDecoration: "none" }}>
          ← Back to contest
        </Link>
        <p style={{ color: "var(--color-text-muted)" }}>This is not a photo contest. No submission queue.</p>
      </div>
    );
  }

  // Fetch submissions with submitter profile
  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, title, description, image_url, status, submitted_at, user_id")
    .eq("contest_id", id)
    .order("submitted_at", { ascending: true });

  // Fetch signed URLs for all pending/rejected submissions (private bucket)
  const submissionsWithUrls = await Promise.all(
    (submissions ?? []).map(async (sub) => {
      if (sub.status === "approved") return { ...sub, signedUrl: null };
      const { data: signed } = await supabase.storage
        .from("photo-submissions-private")
        .createSignedUrl(sub.image_url, 3600);
      return { ...sub, signedUrl: signed?.signedUrl ?? null };
    })
  );

  const label = contest.theme ?? `Contest #${contest.contest_number}`;
  const pending = submissionsWithUrls.filter((s) => s.status === "pending");
  const reviewed = submissionsWithUrls.filter((s) => s.status !== "pending");

  const statusBadgeStyle = (status: string): React.CSSProperties => ({
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "100px",
    fontFamily: "var(--font-dm-mono)",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    background:
      status === "approved"
        ? "rgba(52,211,153,0.12)"
        : status === "rejected"
        ? "rgba(248,113,113,0.12)"
        : "rgba(139,92,246,0.12)",
    color:
      status === "approved"
        ? "var(--color-status-success)"
        : status === "rejected"
        ? "var(--color-status-error)"
        : "var(--color-purple-light)",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Link href="/admin/contests" style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", textDecoration: "none" }}>Contests</Link>
          <span style={{ color: "var(--color-text-dim)" }}>/</span>
          <Link href={`/admin/contests/${id}`} style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", textDecoration: "none" }}>{label}</Link>
          <span style={{ color: "var(--color-text-dim)" }}>/</span>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text)" }}>Submissions</span>
        </div>
        <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.75rem", color: "var(--color-text)", letterSpacing: "-0.03em" }}>
          Submissions — {label}
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "6px" }}>
          {pending.length} pending &middot; {reviewed.length} reviewed
        </p>
      </div>

      {/* Pending queue */}
      {pending.length === 0 ? (
        <div style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: "14px", padding: "40px", textAlign: "center" }}>
          <p style={{ color: "var(--color-text-muted)" }}>No pending submissions.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "var(--color-border-subtle)", borderRadius: "14px", overflow: "hidden", border: "1px solid var(--color-border-subtle)" }}>
          <div style={{ background: "var(--color-bg-surface)", padding: "12px 20px", borderBottom: "1px solid var(--color-border-subtle)" }}>
            <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
              Pending review ({pending.length})
            </p>
          </div>
          {pending.map((sub) => (
            <div
              key={sub.id}
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr auto",
                gap: "20px",
                alignItems: "center",
                padding: "16px 20px",
                background: "var(--color-bg-surface)",
              }}
            >
              {/* Preview */}
              <div style={{ position: "relative", aspectRatio: "1", borderRadius: "8px", overflow: "hidden", background: "var(--color-bg-surface2)" }}>
                {sub.signedUrl ? (
                  <Image src={sub.signedUrl} alt={sub.title} fill sizes="100px" className="object-cover" unoptimized />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "10px", color: "var(--color-text-dim)" }}>No preview</span>
                  </div>
                )}
              </div>

              {/* Meta */}
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 600, color: "var(--color-text)", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {sub.title}
                </p>
                {sub.description && (
                  <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", lineHeight: 1.5, marginBottom: "6px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } as React.CSSProperties}>
                    {sub.description}
                  </p>
                )}
                <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.6875rem", color: "var(--color-text-dim)" }}>
                  {new Date(sub.submitted_at).toLocaleString()}
                </p>
              </div>

              {/* Actions */}
              <ModerationActions submissionId={sub.id} />
            </div>
          ))}
        </div>
      )}

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "var(--color-border-subtle)", borderRadius: "14px", overflow: "hidden", border: "1px solid var(--color-border-subtle)" }}>
          <div style={{ background: "var(--color-bg-surface)", padding: "12px 20px", borderBottom: "1px solid var(--color-border-subtle)" }}>
            <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
              Reviewed ({reviewed.length})
            </p>
          </div>
          {reviewed.map((sub) => (
            <div
              key={sub.id}
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr auto",
                gap: "20px",
                alignItems: "center",
                padding: "16px 20px",
                background: "var(--color-bg-surface)",
                opacity: 0.7,
              }}
            >
              <div style={{ position: "relative", aspectRatio: "1", borderRadius: "8px", overflow: "hidden", background: "var(--color-bg-surface2)" }}>
                {sub.signedUrl ? (
                  <Image src={sub.signedUrl} alt={sub.title} fill sizes="100px" className="object-cover" unoptimized />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "10px", color: "var(--color-text-dim)" }}>—</span>
                  </div>
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 600, color: "var(--color-text)", marginBottom: "4px" }}>{sub.title}</p>
                <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.6875rem", color: "var(--color-text-dim)" }}>
                  {new Date(sub.submitted_at).toLocaleString()}
                </p>
              </div>
              <span style={statusBadgeStyle(sub.status)}>{sub.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
