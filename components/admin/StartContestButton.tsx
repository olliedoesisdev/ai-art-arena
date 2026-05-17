"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function StartContestButton({ contestId }: { contestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    if (!confirm("Start this contest now? Voting will open immediately and submissions will close.")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/contests/${contestId}/start`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Failed to start contest");
      }
      toast.success("Contest is now live — voting open!");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start contest");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleStart}
      disabled={loading}
      style={{
        fontSize: "0.8125rem",
        fontWeight: 600,
        color: loading ? "var(--color-text-dim)" : "var(--color-bg-base)",
        background: loading ? "var(--color-text-dim)" : "var(--color-status-success)",
        border: "none",
        borderRadius: "8px",
        padding: "8px 16px",
        cursor: loading ? "not-allowed" : "pointer",
      }}
    >
      {loading ? "Starting..." : "Start now"}
    </button>
  );
}
