"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function DeleteArtworkButton({ artworkId, artworkTitle }: { artworkId: string; artworkTitle: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${artworkTitle}"? This cannot be undone.`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/artworks/${artworkId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Failed to delete");
      }
      toast.success("Artwork deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete artwork");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title="Delete artwork"
      style={{
        fontSize: "0.75rem",
        fontWeight: 600,
        color: loading ? "var(--color-text-dim)" : "var(--color-status-error)",
        background: "rgba(248,113,113,0.08)",
        border: "1px solid rgba(248,113,113,0.2)",
        borderRadius: "6px",
        padding: "5px 10px",
        cursor: loading ? "not-allowed" : "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
