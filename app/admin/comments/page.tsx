"use client";

import { useEffect, useState, useCallback } from "react";

interface CommentRow {
  id: string;
  artwork_id: string;
  parent_id: string | null;
  author_name: string;
  author_email: string | null;
  body: string;
  is_admin_reply: boolean;
  is_approved: boolean;
  created_at: string;
  artwork_title: string;
}

interface GroupedArtwork {
  artwork_id: string;
  artwork_title: string;
  comments: CommentRow[];
}

interface CommentsResponse {
  groups: GroupedArtwork[];
  page: number;
  totalPages: number;
  totalCount: number;
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) { const m = Math.floor(diff / 60); return `${m}m ago`; }
  if (diff < 86400) { const h = Math.floor(diff / 3600); return `${h}h ago`; }
  const d = Math.floor(diff / 86400);
  return `${d}d ago`;
}

function AdminCommentCard({
  comment,
  onApprove,
  onDelete,
  onReply,
}: {
  comment: CommentRow;
  onApprove: (id: string, approved: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReply: (parentId: string, body: string) => Promise<void>;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleApprove() {
    setBusy(true);
    await onApprove(comment.id, !comment.is_approved);
    setBusy(false);
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setBusy(true);
    await onDelete(comment.id);
    setBusy(false);
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setBusy(true);
    await onReply(comment.id, replyBody);
    setReplyBody("");
    setReplyOpen(false);
    setBusy(false);
  }

  const isReply = !!comment.parent_id;

  return (
    <div
      style={{
        background: comment.is_admin_reply ? "rgba(139,92,246,0.05)" : "var(--color-bg-surface2)",
        border: comment.is_admin_reply ? "1px solid rgba(139,92,246,0.2)" : "1px solid rgba(139,92,246,0.1)",
        borderLeft: comment.is_admin_reply ? "3px solid var(--color-purple)" : undefined,
        borderRadius: "10px",
        padding: "14px 16px",
        marginLeft: isReply ? "24px" : "0",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text)" }}>
              {comment.author_name}
            </span>
            {comment.author_email && (
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-dim)", fontFamily: "var(--font-dm-mono)" }}>
                {comment.author_email}
              </span>
            )}
            {comment.is_admin_reply && (
              <span style={{
                fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                color: "var(--color-purple)", background: "rgba(139,92,246,0.12)", padding: "2px 7px", borderRadius: "100px",
              }}>
                Admin
              </span>
            )}
            <span style={{ fontSize: "0.6875rem", color: "var(--color-text-dim)", fontFamily: "var(--font-dm-mono)" }}>
              {timeAgo(comment.created_at)}
            </span>
            <span
              style={{
                fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                color: comment.is_approved ? "var(--color-status-success)" : "var(--color-status-warning)",
                background: comment.is_approved ? "rgba(52,211,153,0.08)" : "rgba(251,191,36,0.08)",
                padding: "2px 7px", borderRadius: "100px",
              }}
            >
              {comment.is_approved ? "Approved" : "Pending"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
          <button
            onClick={handleApprove}
            disabled={busy}
            style={{
              fontSize: "0.75rem", fontWeight: 600,
              color: comment.is_approved ? "var(--color-status-warning)" : "var(--color-status-success)",
              background: comment.is_approved ? "rgba(251,191,36,0.08)" : "rgba(52,211,153,0.08)",
              border: comment.is_approved ? "1px solid rgba(251,191,36,0.2)" : "1px solid rgba(52,211,153,0.2)",
              borderRadius: "6px", padding: "4px 10px", cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            {comment.is_approved ? "Unapprove" : "Approve"}
          </button>

          {!isReply && (
            <button
              onClick={() => setReplyOpen((o) => !o)}
              style={{
                fontSize: "0.75rem", fontWeight: 600, color: "var(--color-purple-light)",
                background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)",
                borderRadius: "6px", padding: "4px 10px", cursor: "pointer",
              }}
            >
              Reply
            </button>
          )}

          <button
            onClick={handleDelete}
            disabled={busy}
            style={{
              fontSize: "0.75rem", fontWeight: 600,
              color: confirmDelete ? "var(--color-text)" : "var(--color-status-error)",
              background: confirmDelete ? "var(--color-status-error)" : "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.2)",
              borderRadius: "6px", padding: "4px 10px", cursor: busy ? "not-allowed" : "pointer",
            }}
            onBlur={() => setConfirmDelete(false)}
          >
            {confirmDelete ? "Confirm delete" : "Delete"}
          </button>
        </div>
      </div>

      {/* Body */}
      <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {comment.body}
      </p>

      {/* Inline reply form */}
      {replyOpen && (
        <form onSubmit={handleReply} style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <textarea
            required
            minLength={5}
            maxLength={500}
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="Write your admin reply..."
            rows={3}
            style={{
              width: "100%", background: "var(--color-bg-surface)", border: "1px solid rgba(139,92,246,0.25)",
              borderRadius: "8px", padding: "10px 14px", fontSize: "0.875rem", color: "var(--color-text)",
              outline: "none", resize: "vertical", fontFamily: "inherit",
            }}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="submit"
              disabled={busy || !replyBody.trim()}
              style={{
                padding: "7px 18px", background: "var(--color-purple)", border: "none", borderRadius: "6px",
                fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text)",
                cursor: busy ? "not-allowed" : "pointer",
              }}
            >
              {busy ? "Posting..." : "Post reply"}
            </button>
            <button
              type="button"
              onClick={() => { setReplyOpen(false); setReplyBody(""); }}
              style={{
                padding: "7px 14px", background: "transparent", border: "1px solid rgba(139,92,246,0.2)",
                borderRadius: "6px", fontSize: "0.8125rem", color: "var(--color-text-muted)", cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function AdminCommentsPage() {
  const [groups, setGroups] = useState<GroupedArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchComments = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/comments?page=${targetPage}`);
      if (!res.ok) throw new Error("Failed to load comments");
      const data = (await res.json()) as CommentsResponse;
      setGroups(data.groups);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch {
      setError("Failed to load comments. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchComments(1); }, [fetchComments]);

  const handleApprove = useCallback(async (id: string, approved: boolean) => {
    await fetch(`/api/admin/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_approved: approved }),
    });
    await fetchComments(page);
  }, [fetchComments, page]);

  const handleDelete = useCallback(async (id: string) => {
    await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
    await fetchComments(page);
  }, [fetchComments, page]);

  const handleReply = useCallback(async (parentId: string, body: string) => {
    let artworkId = "";
    for (const group of groups) {
      const parent = group.comments.find((c) => c.id === parentId);
      if (parent) { artworkId = parent.artwork_id; break; }
    }
    await fetch("/api/admin/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parent_id: parentId, artwork_id: artworkId, body }),
    });
    await fetchComments(page);
  }, [fetchComments, page, groups]);

  const totalPending = groups.reduce(
    (n, g) => n + g.comments.filter((c) => !c.is_approved).length,
    0
  );

  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    padding: "7px 16px",
    borderRadius: "8px",
    border: "1px solid rgba(139,92,246,0.2)",
    background: disabled ? "rgba(139,92,246,0.04)" : "rgba(139,92,246,0.1)",
    color: disabled ? "var(--color-text-dim)" : "var(--color-purple-light)",
    fontSize: "0.8125rem",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
  });

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: "32px" }}>
        <p style={{
          fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "var(--color-purple-light)", marginBottom: "8px",
        }}>
          Moderation
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h1 style={{
            fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.75rem",
            color: "var(--color-text)", margin: 0,
          }}>
            Comments
          </h1>
          {totalPending > 0 && (
            <span style={{
              fontSize: "0.75rem", fontWeight: 700, color: "var(--color-status-warning)",
              background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)",
              borderRadius: "100px", padding: "3px 10px",
            }}>
              {totalPending} pending
            </span>
          )}
          {totalCount > 0 && (
            <span style={{
              fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)",
              fontFamily: "var(--font-dm-mono)",
            }}>
              {totalCount} total
            </span>
          )}
        </div>
      </div>

      {loading && (
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-dim)" }}>Loading...</p>
      )}

      {error && (
        <div style={{
          background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)",
          borderRadius: "10px", padding: "14px 18px", fontSize: "0.875rem", color: "var(--color-status-error)",
        }}>
          {error}
        </div>
      )}

      {!loading && !error && groups.length === 0 && (
        <div style={{
          background: "var(--color-bg-surface)", border: "1px solid rgba(139,92,246,0.12)",
          borderRadius: "14px", padding: "48px 24px", textAlign: "center",
        }}>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-dim)" }}>No comments yet.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <button
            onClick={() => void fetchComments(page - 1)}
            disabled={page <= 1}
            style={btnStyle(page <= 1)}
          >
            â† Prev
          </button>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", fontFamily: "var(--font-dm-mono)" }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => void fetchComments(page + 1)}
            disabled={page >= totalPages}
            style={btnStyle(page >= totalPages)}
          >
            Next â†’
          </button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
        {groups.map((group) => {
          // Build threaded view: top-level + their replies
          const topLevel = group.comments.filter((c) => !c.parent_id);
          const replies = group.comments.filter((c) => !!c.parent_id);

          return (
            <div key={group.artwork_id}>
              <p style={{
                fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text)",
                marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px",
              }}>
                <span style={{ color: "var(--color-text-dim)" }}>Artwork:</span>
                {group.artwork_title}
                <span style={{
                  fontSize: "0.6875rem", fontFamily: "var(--font-dm-mono)", color: "var(--color-text-dim)",
                }}>
                  ({group.comments.length})
                </span>
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {topLevel.map((comment) => (
                  <div key={comment.id}>
                    <AdminCommentCard
                      comment={comment}
                      onApprove={handleApprove}
                      onDelete={handleDelete}
                      onReply={handleReply}
                    />
                    {replies
                      .filter((r) => r.parent_id === comment.id)
                      .map((reply) => (
                        <div key={reply.id} style={{ marginTop: "8px" }}>
                          <AdminCommentCard
                            comment={reply}
                            onApprove={handleApprove}
                            onDelete={handleDelete}
                            onReply={handleReply}
                          />
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
          <button
            onClick={() => void fetchComments(page - 1)}
            disabled={page <= 1}
            style={btnStyle(page <= 1)}
          >
            â† Prev
          </button>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", fontFamily: "var(--font-dm-mono)" }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => void fetchComments(page + 1)}
            disabled={page >= totalPages}
            style={btnStyle(page >= totalPages)}
          >
            Next â†’
          </button>
        </div>
      )}
    </div>
  );
}
