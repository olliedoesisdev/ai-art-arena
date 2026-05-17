// app/admin/submissions/page.tsx [SERVER]
import { createAdminClient } from "@/lib/supabase/server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ModerationActions } from "@/app/admin/contests/[id]/submissions/ModerationActions";

export const metadata = { title: "Photo Submissions — Admin" };
export const revalidate = 0;

export default async function AllSubmissionsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/signin");

  const supabase = createAdminClient();

  // Fetch all pending submissions across all photo contests, joined with contest info
  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, title, description, image_url, status, submitted_at, contest_id, contests(contest_number, theme, status)")
    .eq("status", "pending")
    .order("submitted_at", { ascending: true });

  // Generate signed URLs (private bucket, 1h expiry)
  const submissionsWithUrls = await Promise.all(
    (submissions ?? []).map(async (sub) => {
      const { data: signed } = await supabase.storage
        .from("photo-submissions-private")
        .createSignedUrl(sub.image_url, 3600);
      return { ...sub, signedUrl: signed?.signedUrl ?? null };
    })
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div>
        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-purple)", marginBottom: "8px" }}>
          Moderation
        </p>
        <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.75rem", color: "var(--color-text)", letterSpacing: "-0.03em" }}>
          Photo Submissions
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "6px" }}>
          {submissionsWithUrls.length} pending across all contests
        </p>
      </div>

      {submissionsWithUrls.length === 0 ? (
        <div style={{
          background: "var(--color-bg-surface)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "14px",
          padding: "60px 40px",
          textAlign: "center",
        }}>
          <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            No pending submissions
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-dim)", marginTop: "8px" }}>
            New photo submissions will appear here for review.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "var(--color-border-subtle)", borderRadius: "14px", overflow: "hidden", border: "1px solid var(--color-border-subtle)" }}>
          {/* Table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "100px 1fr 160px auto",
            gap: "20px",
            alignItems: "center",
            padding: "10px 20px",
            background: "var(--color-bg-surface)",
            borderBottom: "1px solid var(--color-border-subtle)",
          }}>
            {["Photo", "Title & description", "Contest", "Actions"].map((h) => (
              <div key={h} style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-dim)" }}>
                {h}
              </div>
            ))}
          </div>

          {submissionsWithUrls.map((sub) => {
            type ContestMeta = { contest_number: number; theme: string | null; status: string };
            const raw = sub.contests;
            const contest: ContestMeta | null = Array.isArray(raw) ? (raw[0] as ContestMeta ?? null) : (raw as ContestMeta | null);
            const contestLabel = contest?.theme ?? `Contest #${contest?.contest_number}`;

            return (
              <div
                key={sub.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr 160px auto",
                  gap: "20px",
                  alignItems: "center",
                  padding: "16px 20px",
                  background: "var(--color-bg-surface)",
                }}
              >
                {/* Preview */}
                <div style={{ position: "relative", aspectRatio: "1", borderRadius: "8px", overflow: "hidden", background: "var(--color-bg-surface2)" }}>
                  {sub.signedUrl ? (
                    <Image src={sub.signedUrl} alt={sub.title} fill sizes="100px" style={{ objectFit: "cover" }} unoptimized />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "10px", color: "var(--color-text-dim)" }}>No preview</span>
                    </div>
                  )}
                </div>

                {/* Title + description */}
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: "var(--color-text)", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {sub.title}
                  </p>
                  {sub.description && (
                    <p style={{
                      fontSize: "0.8125rem",
                      color: "var(--color-text-muted)",
                      lineHeight: 1.5,
                      marginBottom: "6px",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    } as React.CSSProperties}>
                      {sub.description}
                    </p>
                  )}
                  <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.6875rem", color: "var(--color-text-dim)" }}>
                    {new Date(sub.submitted_at).toLocaleString()}
                  </p>
                </div>

                {/* Contest link */}
                <div>
                  <Link
                    href={`/admin/contests/${sub.contest_id}/submissions`}
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "var(--color-purple-light)",
                      textDecoration: "none",
                    }}
                  >
                    {contestLabel}
                  </Link>
                  {contest && (
                    <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.6875rem", color: "var(--color-text-dim)", marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {contest.status}
                    </p>
                  )}
                </div>

                {/* Approve / Reject */}
                <ModerationActions submissionId={sub.id} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
