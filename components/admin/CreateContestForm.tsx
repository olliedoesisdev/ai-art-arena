"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  background: "var(--color-bg-surface2)",
  border: "1px solid rgba(139,92,246,0.25)",
  borderRadius: "8px",
  color: "var(--color-text)",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
  colorScheme: "dark",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8125rem",
  fontWeight: 500,
  color: "var(--color-text-muted)",
  marginBottom: "6px",
};

interface CreateContestFormProps {
  suggestedWeekNumber: number;
}

export function CreateContestForm({ suggestedWeekNumber }: CreateContestFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const fmt = (d: Date) => d.toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    weekNumber: suggestedWeekNumber,
    startDate: fmt(today),
    endDate: fmt(nextWeek),
    status: "active" as "active" | "archived",
    artworkCount: 6,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setError("End date must be after start date");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/contests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week_number: formData.weekNumber,
          start_date: new Date(formData.startDate).toISOString(),
          end_date: new Date(formData.endDate).toISOString(),
          status: formData.status,
          artwork_count: formData.artworkCount,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create contest");
      router.push("/admin/contests");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <label style={labelStyle}>Week Number</label>
        <input type="number" min="1" required value={formData.weekNumber} style={inputStyle}
          onChange={(e) => setFormData({ ...formData, weekNumber: parseInt(e.target.value) })} />
        <p style={{ fontSize: "0.75rem", color: "var(--color-text-dim)", marginTop: "4px" }}>Suggested: {suggestedWeekNumber}</p>
      </div>

      <div>
        <label style={labelStyle}>Number of Artworks</label>
        <input type="number" min="1" max="50" required value={formData.artworkCount} style={inputStyle}
          onChange={(e) => setFormData({ ...formData, artworkCount: Math.max(1, parseInt(e.target.value) || 1) })} />
        <p style={{ fontSize: "0.75rem", color: "var(--color-text-dim)", marginTop: "4px" }}>How many artworks will be in this contest (1â€“50)</p>
      </div>

      <div>
        <label style={labelStyle}>Start Date & Time</label>
        <input type="datetime-local" required value={formData.startDate} style={inputStyle}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
      </div>

      <div>
        <label style={labelStyle}>End Date & Time</label>
        <input type="datetime-local" required value={formData.endDate} style={inputStyle}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
      </div>

      <div>
        <label style={labelStyle}>Status</label>
        <select required value={formData.status} style={inputStyle}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "archived" })}>
          <option value="active">Active â€” live now</option>
          <option value="archived">Archived â€” not accepting votes</option>
        </select>
      </div>

      {error && (
        <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "8px", padding: "10px 14px", fontSize: "0.875rem", color: "var(--color-status-error)" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", paddingTop: "4px" }}>
        <button type="submit" disabled={isSubmitting} style={{
          flex: 1, padding: "11px", background: isSubmitting ? "var(--color-text-dim)" : "var(--color-purple)",
          border: "none", borderRadius: "8px", color: "var(--color-text)",
          fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.9375rem",
          cursor: isSubmitting ? "not-allowed" : "pointer",
        }}>
          {isSubmitting ? "Creating..." : "Create Contest"}
        </button>
        <button type="button" onClick={() => router.back()} disabled={isSubmitting} style={{
          padding: "11px 20px", background: "transparent",
          border: "1px solid rgba(139,92,246,0.25)", borderRadius: "8px",
          color: "var(--color-text-muted)", fontSize: "0.875rem", cursor: "pointer",
        }}>
          Cancel
        </button>
      </div>
    </form>
  );
}
