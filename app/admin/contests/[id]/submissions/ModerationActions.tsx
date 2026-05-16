"use client";
// app/admin/contests/[id]/submissions/ModerationActions.tsx [CLIENT]
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ModerationActionsProps {
  submissionId: string;
}

export function ModerationActions({ submissionId }: ModerationActionsProps) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const router = useRouter();

  async function act(action: "approve" | "reject") {
    setLoading(action);
    try {
      const res = await fetch(`/api/v1/admin/submissions/${submissionId}/${action}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(action === "approve" ? "Submission approved and live." : "Submission rejected.");
        router.refresh();
      } else {
        toast.error(data.error ?? `Failed to ${action} submission.`);
        setLoading(null);
      }
    } catch {
      toast.error("Network error. Please try again.");
      setLoading(null);
    }
  }

  return (
    <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
      <button
        onClick={() => act("approve")}
        disabled={loading !== null}
        style={{
          padding: "7px 16px",
          background: loading === "approve" ? "rgba(52,211,153,0.08)" : "rgba(52,211,153,0.12)",
          border: "1px solid rgba(52,211,153,0.3)",
          borderRadius: "6px",
          color: "var(--color-status-success)",
          fontFamily: "var(--font-dm-mono)",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.06em",
          cursor: loading !== null ? "not-allowed" : "pointer",
          opacity: loading !== null ? 0.6 : 1,
        }}
      >
        {loading === "approve" ? "..." : "Approve"}
      </button>
      <button
        onClick={() => act("reject")}
        disabled={loading !== null}
        style={{
          padding: "7px 16px",
          background: "transparent",
          border: "1px solid rgba(248,113,113,0.25)",
          borderRadius: "6px",
          color: "var(--color-status-error)",
          fontFamily: "var(--font-dm-mono)",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.06em",
          cursor: loading !== null ? "not-allowed" : "pointer",
          opacity: loading !== null ? 0.6 : 1,
        }}
      >
        {loading === "reject" ? "..." : "Reject"}
      </button>
    </div>
  );
}
