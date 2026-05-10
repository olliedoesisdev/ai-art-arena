"use client";

import { useState } from "react";
import type { VoteHistoryItem, CommentHistoryItem } from "@/lib/types";
import { VoteHistory } from "./VoteHistory";
import { CommentHistory } from "./CommentHistory";

interface Props {
  votes: VoteHistoryItem[];
  comments: CommentHistoryItem[];
}

type Tab = "votes" | "comments";

export function ProfileTabs({ votes, comments }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("votes");

  const tabStyle = (tab: Tab): React.CSSProperties => ({
    padding: "12px 4px",
    background: "none",
    border: "none",
    borderBottom: activeTab === tab ? "2px solid #a78bfa" : "2px solid transparent",
    color: activeTab === tab ? "#a78bfa" : "#7878a0",
    fontFamily: "var(--font-dm-mono)",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "color 0.15s, border-color 0.15s",
    marginBottom: "-1px",
  });

  return (
    <div>
      {/* Tab bar */}
      <div style={{
        display: "flex",
        gap: "24px",
        borderBottom: "1px solid rgba(139,92,246,0.12)",
        marginBottom: "24px",
      }}>
        <button style={tabStyle("votes")} onClick={() => setActiveTab("votes")}>
          Votes ({votes.length})
        </button>
        <button style={tabStyle("comments")} onClick={() => setActiveTab("comments")}>
          Comments ({comments.length})
        </button>
      </div>

      {/* Content */}
      <div style={{ opacity: 1, transition: "opacity 0.15s" }}>
        {activeTab === "votes" ? (
          <VoteHistory votes={votes} />
        ) : (
          <CommentHistory comments={comments} />
        )}
      </div>
    </div>
  );
}
