"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import type { ArtistApplication, ArtistApplicationStatus } from "@/lib/types";

const STATUS_STYLES: Record<ArtistApplicationStatus, React.CSSProperties> = {
  pending:    { background: "rgba(251,191,36,0.1)",  border: "1px solid rgba(251,191,36,0.3)",  color: "var(--color-status-warning)" },
  approved:   { background: "rgba(52,211,153,0.1)",  border: "1px solid rgba(52,211,153,0.3)",  color: "var(--color-status-success)" },
  rejected:   { background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "var(--color-status-error)" },
  waitlisted: { background: "rgba(139,92,246,0.1)",  border: "1px solid rgba(139,92,246,0.3)",  color: "var(--color-purple-light)" },
};

function StatusBadge({ status }: { status: ArtistApplicationStatus }) {
  return (
    <span style={{
      ...STATUS_STYLES[status],
      fontFamily: "var(--font-dm-mono)",
      fontSize: "10px", fontWeight: 700,
      letterSpacing: "0.12em", textTransform: "uppercase",
      padding: "3px 10px", borderRadius: "100px", flexShrink: 0,
    }}>
      {status}
    </span>
  );
}

function ApplicationCard({
  app,
  onStatusChange,
}: {
  app: ArtistApplication;
  onStatusChange: (id: string, status: ArtistApplicationStatus, notes?: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(app.admin_notes ?? "");

  async function handle(status: ArtistApplicationStatus) {
    setBusy(true);
    await onStatusChange(app.id, status, notes || undefined);
    setBusy(false);
    setExpanded(false);
  }

  return (
    <div style={{
      background: "var(--color-bg-surface)",
      border: `1px solid ${app.status === "pending" ? "rgba(251,191,36,0.15)" : "rgba(139,92,246,0.1)"}`,
      borderRadius: "12px",
      overflow: "hidden",
    }}>
      {/* Main row */}
      <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", width: "72px", height: "72px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, border: "1px solid rgba(139,92,246,0.15)" }}>
          <Image src={app.submission_image_url} alt={app.submission_title} fill className="object-cover" sizes="72px" />
        </div>

        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text)" }}>{app.name}</span>
            <StatusBadge status={app.status} />
          </div>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: "0 0 4px", fontFamily: "var(--font-dm-mono)" }}>{app.email}</p>
          <p style={{ fontSize: "13px", color: "var(--color-text)", margin: "0 0 4px", fontWeight: 500 }}>&quot;{app.submission_title}&quot;</p>
          <p style={{ fontSize: "12px", color: "var(--color-text-dim)", margin: 0, fontFamily: "var(--font-dm-mono)" }}>
            {app.art_style}{app.primary_tools?.length > 0 && <> &middot; {app.primary_tools.join(", ")}</>}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
          <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "var(--color-text-dim)", margin: 0 }}>
            {new Date(app.applied_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </p>
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              fontSize: "0.75rem", fontWeight: 600, color: "var(--color-purple-light)",
              background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)",
              borderRadius: "6px", padding: "4px 12px", cursor: "pointer",
            }}
          >
            {expanded ? "Close" : "Review"}
          </button>
        </div>
      </div>

      {/* Expanded review panel */}
      {expanded && (
        <div style={{ padding: "0 24px 24px", borderTop: "1px solid rgba(139,92,246,0.08)" }}>
          <div style={{ paddingTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>Bio</p>
              <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.6 }}>{app.artist_bio}</p>
            </div>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>Prompt</p>
              <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.6 }}>{app.submission_prompt}</p>
            </div>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>Years using AI</p>
              <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>{app.years_using_ai}</p>
            </div>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>Location</p>
              <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>{app.location ?? "â€”"}</p>
            </div>
          </div>

          {(app.portfolio_url || app.social_handle) && (
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
              {app.portfolio_url && (
                <a href={app.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "var(--color-purple)", textDecoration: "none" }}>
                  Portfolio â†—
                </a>
              )}
              {app.social_handle && (
                <span style={{ fontSize: "13px", color: "var(--color-text-muted)", fontFamily: "var(--font-dm-mono)" }}>{app.social_handle}</span>
              )}
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>Admin notes (sent in email)</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional feedback for the applicant..."
              rows={3}
              style={{
                width: "100%", background: "var(--color-bg-surface2)", border: "1px solid rgba(139,92,246,0.2)",
                borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "var(--color-text)",
                outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => void handle("approved")}
              disabled={busy || app.status === "approved"}
              style={{
                padding: "8px 18px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)",
                borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "var(--color-status-success)",
                cursor: busy || app.status === "approved" ? "not-allowed" : "pointer", opacity: app.status === "approved" ? 0.5 : 1,
              }}
            >
              {busy ? "Saving..." : "Approve"}
            </button>
            <button
              onClick={() => void handle("waitlisted")}
              disabled={busy || app.status === "waitlisted"}
              style={{
                padding: "8px 18px", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)",
                borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "var(--color-purple-light)",
                cursor: busy || app.status === "waitlisted" ? "not-allowed" : "pointer", opacity: app.status === "waitlisted" ? 0.5 : 1,
              }}
            >
              Waitlist
            </button>
            <button
              onClick={() => void handle("rejected")}
              disabled={busy || app.status === "rejected"}
              style={{
                padding: "8px 18px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
                borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "var(--color-status-error)",
                cursor: busy || app.status === "rejected" ? "not-allowed" : "pointer", opacity: app.status === "rejected" ? 0.5 : 1,
              }}
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApplicationsPage() {
  const [rows, setRows] = useState<ArtistApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<ArtistApplicationStatus | "all">("all");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/applications");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json() as { applications: ArtistApplication[] };
      setRows(data.applications);
    } catch {
      setError("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchApplications(); }, [fetchApplications]);

  const handleStatusChange = useCallback(async (id: string, status: ArtistApplicationStatus, notes?: string) => {
    const res = await fetch(`/api/admin/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, admin_notes: notes }),
    });
    if (res.ok) {
      setRows((prev) => prev.map((r) => r.id === id ? { ...r, status, admin_notes: notes ?? null } : r));
    }
  }, []);

  const pending = rows.filter((r) => r.status === "pending").length;
  const FILTERS: Array<ArtistApplicationStatus | "all"> = ["all", "pending", "approved", "waitlisted", "rejected"];
  const visible = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-purple)", margin: "0 0 8px" }}>
          Admin
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.03em", margin: 0 }}>
            Artist Applications
          </h1>
          {pending > 0 && (
            <span style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", color: "var(--color-status-warning)", fontFamily: "var(--font-dm-mono)", fontSize: "11px", fontWeight: 700, padding: "2px 10px", borderRadius: "100px" }}>
              {pending} pending
            </span>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      {rows.length > 0 && (
        <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
          {FILTERS.map((f) => {
            const count = f === "all" ? rows.length : rows.filter((r) => r.status === f).length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "5px 14px", borderRadius: "100px", fontSize: "12px", fontWeight: 600,
                  cursor: "pointer", textTransform: "capitalize",
                  background: filter === f ? "rgba(139,92,246,0.15)" : "transparent",
                  border: filter === f ? "1px solid rgba(139,92,246,0.4)" : "1px solid rgba(139,92,246,0.12)",
                  color: filter === f ? "var(--color-purple-light)" : "var(--color-text-dim)",
                }}
              >
                {f} <span style={{ fontFamily: "var(--font-dm-mono)", opacity: 0.7 }}>({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {loading && <p style={{ fontSize: "14px", color: "var(--color-text-dim)" }}>Loading...</p>}
      {error && <p style={{ fontSize: "14px", color: "var(--color-status-error)" }}>{error}</p>}

      {!loading && !error && visible.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--color-bg-surface)", border: "1px solid rgba(139,92,246,0.12)", borderRadius: "12px" }}>
          <p style={{ fontSize: "14px", color: "var(--color-text-muted)", margin: 0 }}>
            {filter === "all" ? "No applications yet." : `No ${filter} applications.`}
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {visible.map((app) => (
          <ApplicationCard key={app.id} app={app} onStatusChange={handleStatusChange} />
        ))}
      </div>
    </div>
  );
}
