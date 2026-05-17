"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
  artworkId: string;
  initialTitle: string;
  initialPrompt: string | null;
}

export function EditArtworkModal({ artworkId, initialTitle, initialPrompt }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [prompt, setPrompt] = useState(initialPrompt ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/artworks/${artworkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, prompt: prompt || undefined }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Failed to save");
      }
      toast.success("Artwork updated");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    background: "var(--color-bg-surface2)",
    border: "1px solid var(--color-border-mid)",
    borderRadius: "8px",
    color: "var(--color-text)",
    fontSize: "0.875rem",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "var(--color-purple-light)",
          background: "var(--color-purple-dim)",
          border: "1px solid rgba(139,92,246,0.25)",
          borderRadius: "6px",
          padding: "5px 10px",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Edit
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(8,8,14,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border-mid)",
              borderRadius: "14px",
              padding: "32px",
              width: "100%",
              maxWidth: "480px",
            }}
          >
            <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.25rem", color: "var(--color-text)", letterSpacing: "-0.02em", marginBottom: "24px" }}>
              Edit artwork
            </h2>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-muted)", marginBottom: "6px" }}>
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={100}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-muted)", marginBottom: "6px" }}>
                  Prompt / description
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  maxLength={500}
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{
                    padding: "9px 18px", background: "transparent",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: "8px", color: "var(--color-text-muted)",
                    fontSize: "0.875rem", cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "9px 18px",
                    background: loading ? "var(--color-text-dim)" : "var(--color-purple)",
                    border: "none", borderRadius: "8px",
                    color: "var(--color-bg-base)",
                    fontFamily: "var(--font-syne)",
                    fontWeight: 700, fontSize: "0.875rem",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
