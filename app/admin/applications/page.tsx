import { createAdminClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Image from "next/image";
import type { ArtistApplication, ArtistApplicationStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Artist Applications — Admin" };
export const revalidate = 0;

const STATUS_STYLES: Record<ArtistApplicationStatus, React.CSSProperties> = {
  pending: {
    background: "rgba(251,191,36,0.1)",
    border: "1px solid rgba(251,191,36,0.3)",
    color: "#fbbf24",
  },
  approved: {
    background: "rgba(52,211,153,0.1)",
    border: "1px solid rgba(52,211,153,0.3)",
    color: "#34d399",
  },
  rejected: {
    background: "rgba(248,113,113,0.1)",
    border: "1px solid rgba(248,113,113,0.3)",
    color: "#f87171",
  },
  waitlisted: {
    background: "rgba(139,92,246,0.1)",
    border: "1px solid rgba(139,92,246,0.3)",
    color: "#a78bfa",
  },
};

function StatusBadge({ status }: { status: ArtistApplicationStatus }) {
  return (
    <span
      style={{
        ...STATUS_STYLES[status],
        fontFamily: "var(--font-dm-mono)",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        padding: "3px 10px",
        borderRadius: "100px",
        flexShrink: 0,
      }}
    >
      {status}
    </span>
  );
}

export default async function ApplicationsPage() {
  const supabase = createAdminClient();

  const { data: applications } = await supabase
    .from("artist_applications")
    .select("*")
    .order("applied_at", { ascending: false });

  const rows = (applications ?? []) as ArtistApplication[];
  const pending = rows.filter((r) => r.status === "pending").length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <p style={{
          fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "#8b5cf6", margin: "0 0 8px",
        }}>
          Admin
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
          <h1 style={{
            fontFamily: "var(--font-syne)", fontSize: "1.75rem", fontWeight: 800,
            color: "#eeeeff", letterSpacing: "-0.03em", margin: 0,
          }}>
            Artist Applications
          </h1>
          {pending > 0 && (
            <span style={{
              background: "rgba(251,191,36,0.15)",
              border: "1px solid rgba(251,191,36,0.3)",
              color: "#fbbf24",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "11px",
              fontWeight: 700,
              padding: "2px 10px",
              borderRadius: "100px",
            }}>
              {pending} pending
            </span>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 20px",
          background: "#111119", border: "1px solid rgba(139,92,246,0.12)",
          borderRadius: "12px",
        }}>
          <p style={{ fontSize: "14px", color: "#7878a0", margin: 0 }}>
            No applications yet.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {rows.map((app) => (
            <div
              key={app.id}
              style={{
                background: "#111119",
                border: "1px solid rgba(139,92,246,0.1)",
                borderRadius: "12px",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              {/* Thumbnail */}
              <div style={{
                position: "relative",
                width: "72px",
                height: "72px",
                borderRadius: "8px",
                overflow: "hidden",
                flexShrink: 0,
                border: "1px solid rgba(139,92,246,0.15)",
              }}>
                <Image
                  src={app.submission_image_url}
                  alt={app.submission_title}
                  fill
                  className="object-cover"
                  sizes="72px"
                />
              </div>

              {/* Main info */}
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "15px", fontWeight: 600, color: "#eeeeff" }}>
                    {app.name}
                  </span>
                  <StatusBadge status={app.status} />
                </div>
                <p style={{ fontSize: "13px", color: "#7878a0", margin: "0 0 4px", fontFamily: "var(--font-dm-mono)" }}>
                  {app.email}
                </p>
                <p style={{ fontSize: "13px", color: "#eeeeff", margin: "0 0 6px", fontWeight: 500 }}>
                  &quot;{app.submission_title}&quot;
                </p>
                <p style={{ fontSize: "12px", color: "#3a3a58", margin: 0, fontFamily: "var(--font-dm-mono)" }}>
                  {app.art_style}
                  {app.primary_tools?.length > 0 && (
                    <> &middot; {app.primary_tools.join(", ")}</>
                  )}
                </p>
              </div>

              {/* Date */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "11px",
                  color: "#3a3a58",
                  margin: 0,
                }}>
                  {new Date(app.applied_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
