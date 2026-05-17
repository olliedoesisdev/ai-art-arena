"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Contest {
  id: string;
  contest_number: number;
  status: string;
  start_date: string;
  end_date: string;
  artwork_count: number;
}

interface ArtworkSlot {
  id: string;
  title: string;
  prompt: string;
  file: File | null;
  previewUrl: string;
  uploading: boolean;
  uploadedUrl: string;
  error: string;
}

function emptySlot(): ArtworkSlot {
  return {
    id: crypto.randomUUID(),
    title: "",
    prompt: "",
    file: null,
    previewUrl: "",
    uploading: false,
    uploadedUrl: "",
    error: "",
  };
}

interface UploadArtworksFormProps {
  contests: Contest[];
  defaultContestId?: string;
  defaultArtworkCount?: number;
}

export function UploadArtworksForm({ contests, defaultContestId, defaultArtworkCount = 6 }: UploadArtworksFormProps) {
  const router = useRouter();
  const [selectedContestId, setSelectedContestId] = useState(
    defaultContestId || contests[0]?.id || ""
  );
  const [slots, setSlots] = useState<ArtworkSlot[]>(() =>
    Array.from({ length: defaultArtworkCount }, emptySlot)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function updateSlot(id: string, patch: Partial<ArtworkSlot>) {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function addSlot() {
    setSlots((prev) => [...prev, emptySlot()]);
  }

  function removeSlot(id: string) {
    setSlots((prev) => {
      const next = prev.filter((s) => s.id !== id);
      return next.length === 0 ? [emptySlot()] : next;
    });
  }

  async function handleFileChange(id: string, file: File | null) {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      updateSlot(id, { error: "Invalid file type. Use JPG, PNG, WebP, or GIF." });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      updateSlot(id, { error: "File too large. Max 10MB." });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    updateSlot(id, { file, previewUrl, uploading: true, error: "", uploadedUrl: "" });

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/artworks/upload-image", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      updateSlot(id, { uploading: false, uploadedUrl: data.url });
    } catch (err) {
      updateSlot(id, {
        uploading: false,
        error: err instanceof Error ? err.message : "Upload failed",
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!selectedContestId) {
      setFormError("Please select a contest");
      return;
    }

    const filled = slots.filter((s) => s.uploadedUrl || s.title);
    if (filled.length === 0) {
      setFormError("Add at least one artwork with an image and title");
      return;
    }

    for (const s of filled) {
      if (!s.title.trim()) {
        setFormError("All artworks need a title");
        return;
      }
      if (!s.uploadedUrl) {
        setFormError(`"${s.title}" doesn't have a successfully uploaded image yet`);
        return;
      }
      if (s.uploading) {
        setFormError("Wait for all images to finish uploading");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/artworks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artworks: filled.map((s) => ({
            contest_id: selectedContestId,
            title: s.title.trim(),
            prompt: s.prompt.trim() || null,
            image_url: s.uploadedUrl,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save artworks");

      router.push("/admin/contests");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  }

  const filledCount = slots.filter((s) => s.uploadedUrl).length;

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", background: "var(--color-bg-surface2)",
    border: "1px solid rgba(139,92,246,0.25)", borderRadius: "8px",
    color: "var(--color-text)", fontSize: "0.875rem", outline: "none",
    boxSizing: "border-box", colorScheme: "dark" as const,
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Contest selector */}
      <div>
        <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-muted)", marginBottom: "6px" }}>
          Contest *
        </label>
        <select
          required
          value={selectedContestId}
          onChange={(e) => {
            const id = e.target.value;
            setSelectedContestId(id);
            const contest = contests.find((c) => c.id === id);
            if (contest) {
              setSlots(Array.from({ length: contest.artwork_count }, emptySlot));
            }
          }}
          style={inputStyle}
        >
          <option value="">â€” Select a contest â€”</option>
          {contests.map((c) => (
            <option key={c.id} value={c.id}>
              Contest #{c.contest_number} ({c.status}) — {new Date(c.start_date).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {/* Artwork slots */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-muted)" }}>
            Artworks ({filledCount}/{slots.length} ready)
          </p>
          <button type="button" onClick={addSlot} style={{
            fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-purple)",
            background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
            borderRadius: "6px", padding: "6px 12px", cursor: "pointer",
          }}>
            + Add slot
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {slots.map((slot, i) => (
            <div key={slot.id} style={{ background: "var(--color-bg-surface2)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: "12px", overflow: "hidden" }}>
              {/* Image zone */}
              <div
                style={{ position: "relative", aspectRatio: "1", background: "var(--color-bg-surface)", cursor: "pointer" }}
                onClick={() => fileInputRefs.current[slot.id]?.click()}
              >
                {slot.previewUrl ? (
                  <>
                    <Image src={slot.previewUrl} alt={slot.title || `Artwork ${i + 1}`} fill style={{ objectFit: "cover" }} unoptimized />
                    {slot.uploading && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "0.8125rem", color: "var(--color-text)", fontWeight: 500 }}>Uploading...</span>
                      </div>
                    )}
                    {slot.uploadedUrl && !slot.uploading && (
                      <div style={{ position: "absolute", top: "8px", right: "8px", background: "var(--color-status-success)", color: "var(--color-bg-base)", fontSize: "0.6875rem", fontWeight: 700, padding: "2px 8px", borderRadius: "100px" }}>
                        Ready
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", color: "var(--color-text-dim)" }}>
                    <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-8m-4 4h8M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>Click to upload</span>
                    <span style={{ fontSize: "0.6875rem" }}>JPG PNG WebP â€” 10MB max</span>
                  </div>
                )}
                <input
                  ref={(el) => { fileInputRefs.current[slot.id] = el; }}
                  type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: "none" }}
                  onChange={(e) => handleFileChange(slot.id, e.target.files?.[0] ?? null)}
                />
              </div>

              {slot.error && (
                <p style={{ fontSize: "0.75rem", color: "var(--color-status-error)", padding: "6px 12px 0" }}>{slot.error}</p>
              )}

              <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <input
                  type="text"
                  placeholder={`Title ${i + 1} *`}
                  value={slot.title}
                  onChange={(e) => updateSlot(slot.id, { title: e.target.value })}
                  style={{ ...inputStyle, fontSize: "0.8125rem", padding: "8px 12px" }}
                />
                <textarea
                  rows={2}
                  placeholder="AI prompt (optional)"
                  value={slot.prompt}
                  onChange={(e) => updateSlot(slot.id, { prompt: e.target.value })}
                  style={{ ...inputStyle, fontSize: "0.8125rem", padding: "8px 12px", resize: "none" }}
                />
                {slots.length > 1 && (
                  <button type="button" onClick={() => removeSlot(slot.id)}
                    style={{ fontSize: "0.75rem", color: "var(--color-status-error)", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {formError && (
        <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "8px", padding: "10px 14px", fontSize: "0.875rem", color: "var(--color-status-error)" }}>
          {formError}
        </div>
      )}

      <div style={{ display: "flex", gap: "12px" }}>
        <button type="submit" disabled={isSubmitting || filledCount === 0} style={{
          flex: 1, padding: "11px",
          background: isSubmitting || filledCount === 0 ? "var(--color-text-dim)" : "var(--color-purple)",
          border: "none", borderRadius: "8px", color: "var(--color-text)",
          fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.9375rem",
          cursor: isSubmitting || filledCount === 0 ? "not-allowed" : "pointer",
        }}>
          {isSubmitting ? "Saving..." : `Save ${filledCount} artwork${filledCount !== 1 ? "s" : ""}`}
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
