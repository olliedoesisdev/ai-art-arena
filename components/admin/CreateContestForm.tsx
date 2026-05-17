"use client";
// components/admin/CreateContestForm.tsx [CLIENT]
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

const hintStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--color-text-dim)",
  marginTop: "4px",
};

interface CreateContestFormProps {
  suggestedContestNumber: number;
}

export function CreateContestForm({ suggestedContestNumber }: CreateContestFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const fmt = (d: Date) => d.toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    contestType: "ai_art" as "ai_art" | "photo",
    contestNumber: suggestedContestNumber,
    startDate: fmt(today),
    endDate: fmt(nextWeek),
    status: "active" as "active" | "archived",
    artworkCount: 6,
    theme: "",
    themeDescription: "",
    maxSubmissions: "" as string,
  });

  function set<K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

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
      const body: Record<string, unknown> = {
        contest_number: formData.contestNumber,
        contest_type: formData.contestType,
        start_date: new Date(formData.startDate).toISOString(),
        end_date: new Date(formData.endDate).toISOString(),
        status: formData.status,
        artwork_count: formData.artworkCount,
      };

      if (formData.theme.trim()) {
        body.theme = formData.theme.trim();
        if (formData.themeDescription.trim()) {
          body.theme_description = formData.themeDescription.trim();
        }
      }

      if (formData.contestType === "photo" && formData.maxSubmissions) {
        const cap = parseInt(formData.maxSubmissions);
        if (!isNaN(cap) && cap > 0) body.max_submissions = cap;
      }

      const res = await fetch("/api/admin/contests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

      {/* Contest type */}
      <div>
        <label style={labelStyle}>Contest type</label>
        <select
          required
          value={formData.contestType}
          style={inputStyle}
          onChange={(e) => set("contestType", e.target.value as "ai_art" | "photo")}
        >
          <option value="ai_art">AI Art — admin uploads artworks</option>
          <option value="photo">Photo — user submissions with moderation queue</option>
        </select>
      </div>

      {/* Contest number */}
      <div>
        <label style={labelStyle}>Contest number</label>
        <input
          type="number"
          min="1"
          required
          value={formData.contestNumber}
          style={inputStyle}
          onChange={(e) => set("contestNumber", parseInt(e.target.value))}
        />
        <p style={hintStyle}>Suggested: {suggestedContestNumber}</p>
      </div>

      {/* Theme (optional) */}
      <div>
        <label style={labelStyle}>
          Theme <span style={{ fontWeight: 400 }}>(optional — max 80 chars)</span>
        </label>
        <input
          type="text"
          maxLength={80}
          value={formData.theme}
          style={inputStyle}
          placeholder="e.g. Golden Hour, Urban Decay"
          onChange={(e) => set("theme", e.target.value)}
        />
        <p style={hintStyle}>
          {formData.theme ? `${formData.theme.length}/80` : "Leave blank for open submission"}
        </p>
      </div>

      {/* Theme description — only shown when theme is filled */}
      {formData.theme.trim() && (
        <div>
          <label style={labelStyle}>
            Theme description <span style={{ fontWeight: 400 }}>(optional — max 300 chars)</span>
          </label>
          <textarea
            maxLength={300}
            value={formData.themeDescription}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
            rows={3}
            placeholder="Describe the theme and what photographers should capture..."
            onChange={(e) => set("themeDescription", e.target.value)}
          />
          <p style={hintStyle}>{formData.themeDescription.length}/300</p>
        </div>
      )}

      {/* Artwork count (AI art only) */}
      {formData.contestType === "ai_art" && (
        <div>
          <label style={labelStyle}>Number of artworks</label>
          <input
            type="number"
            min="1"
            max="50"
            required
            value={formData.artworkCount}
            style={inputStyle}
            onChange={(e) => set("artworkCount", Math.max(1, parseInt(e.target.value) || 1))}
          />
          <p style={hintStyle}>How many artworks will be in this contest (1–50)</p>
        </div>
      )}

      {/* Max submissions (photo only) */}
      {formData.contestType === "photo" && (
        <div>
          <label style={labelStyle}>
            Max submissions <span style={{ fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            type="number"
            min="1"
            value={formData.maxSubmissions}
            style={inputStyle}
            placeholder="Unlimited"
            onChange={(e) => set("maxSubmissions", e.target.value)}
          />
          <p style={hintStyle}>Leave blank for no cap on entries</p>
        </div>
      )}

      {/* Start date */}
      <div>
        <label style={labelStyle}>Start date &amp; time</label>
        <input
          type="datetime-local"
          required
          value={formData.startDate}
          style={inputStyle}
          onChange={(e) => set("startDate", e.target.value)}
        />
      </div>

      {/* End date */}
      <div>
        <label style={labelStyle}>End date &amp; time</label>
        <input
          type="datetime-local"
          required
          value={formData.endDate}
          style={inputStyle}
          onChange={(e) => set("endDate", e.target.value)}
        />
        <p style={hintStyle}>The contest archives automatically when this date passes.</p>
      </div>

      {/* Status */}
      <div>
        <label style={labelStyle}>Status</label>
        <select
          required
          value={formData.status}
          style={inputStyle}
          onChange={(e) => set("status", e.target.value as "active" | "archived")}
        >
          <option value="active">Active — live now</option>
          <option value="archived">Archived — not accepting votes</option>
        </select>
      </div>

      {error && (
        <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "8px", padding: "10px 14px", fontSize: "0.875rem", color: "var(--color-status-error)" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", paddingTop: "4px" }}>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            flex: 1,
            padding: "11px",
            background: isSubmitting ? "var(--color-text-dim)" : "var(--color-purple)",
            border: "none",
            borderRadius: "8px",
            color: "var(--color-text)",
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: "0.9375rem",
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}
        >
          {isSubmitting ? "Creating..." : "Create contest"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          style={{
            padding: "11px 20px",
            background: "transparent",
            border: "1px solid rgba(139,92,246,0.25)",
            borderRadius: "8px",
            color: "var(--color-text-muted)",
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
