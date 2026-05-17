"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  contestId: string;
  currentStartDate: string;
  currentEndDate: string;
}

function toLocalDateHour(iso: string): { date: string; hour: number } {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return { date: `${yyyy}-${mm}-${dd}`, hour: d.getHours() };
}

function toISOFromDateHour(date: string, hour: number): string {
  const d = new Date(`${date}T${String(hour).padStart(2, "0")}:00:00`);
  return d.toISOString();
}

export function EditContestDatesModal({ contestId, currentStartDate, currentEndDate }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const initStart = toLocalDateHour(currentStartDate);
  const initEnd = toLocalDateHour(currentEndDate);

  const [startDate, setStartDate] = useState(initStart.date);
  const [startHour, setStartHour] = useState(initStart.hour);
  const [endDate, setEndDate] = useState(initEnd.date);
  const [endHour, setEndHour] = useState(initEnd.hour);

  async function handleSave() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/contests/${contestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_date: toISOFromDateHour(startDate, startHour),
          end_date: toISOFromDateHour(endDate, endHour),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const inputStyle: React.CSSProperties = {
    background: "var(--color-bg-surface2)",
    border: "1px solid var(--color-border-subtle)",
    borderRadius: "6px",
    color: "var(--color-text)",
    fontFamily: "var(--font-dm-mono)",
    fontSize: "0.8125rem",
    padding: "7px 10px",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.6875rem",
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--color-text-dim)",
    marginBottom: "6px",
    display: "block",
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: "var(--color-purple-light)",
          border: "1px solid rgba(139,92,246,0.3)",
          borderRadius: "8px",
          padding: "8px 16px",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        Edit dates
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(8,8,14,0.8)",
            backdropFilter: "blur(6px)",
            zIndex: 200,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border-mid)",
              borderRadius: "14px",
              padding: "28px 32px",
              width: "100%",
              maxWidth: "420px",
            }}
          >
            <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.125rem", color: "var(--color-text)", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
              Edit contest dates
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: "0 0 24px" }}>
              Time is set to the nearest whole hour (local time).
            </p>

            {/* Start */}
            <div style={{ marginBottom: "20px" }}>
              <span style={labelStyle}>Voting starts</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(Number(e.target.value))}
                  style={{ ...inputStyle, width: "90px" }}
                >
                  {hours.map((h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* End */}
            <div style={{ marginBottom: "24px" }}>
              <span style={labelStyle}>Voting ends</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <select
                  value={endHour}
                  onChange={(e) => setEndHour(Number(e.target.value))}
                  style={{ ...inputStyle, width: "90px" }}
                >
                  {hours.map((h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <p style={{ fontSize: "0.8125rem", color: "var(--color-status-error)", marginBottom: "16px" }}>{error}</p>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  fontSize: "0.8125rem", fontWeight: 600,
                  color: "var(--color-text-muted)",
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: "6px", padding: "8px 16px",
                  background: "transparent", cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                style={{
                  fontSize: "0.8125rem", fontWeight: 700,
                  color: "#fff",
                  background: loading ? "rgba(139,92,246,0.4)" : "var(--color-purple)",
                  border: "none", borderRadius: "6px",
                  padding: "8px 20px", cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
