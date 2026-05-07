"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { LiveVoteCount } from "./LiveVoteCount";
import { Artwork } from "@/lib/types";

interface ArtworkCardProps {
  artwork: Artwork;
  contestId: string;
  index: number;
  isLeading: boolean;
  isUserVote: boolean;
  hasVoted: boolean;
  totalVotes: number;
  contestEnded: boolean;
  isAuthenticated: boolean;
}

function localVoteKey(contestId: string) {
  return `voted:${contestId}`;
}

// Each card gets a unique accent colour cycling through the palette
const ACCENT_COLORS = [
  "#7c3aed",
  "#ff6b35",
  "#06b6d4",
  "#84cc16",
  "#f59e0b",
  "#f472b6",
];

export function ArtworkCard({
  artwork,
  contestId,
  index,
  isLeading,
  isUserVote,
  hasVoted,
  totalVotes,
  contestEnded,
  isAuthenticated,
}: ArtworkCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [localVoted, setLocalVoted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      setLocalVoted(!!localStorage.getItem(localVoteKey(contestId)));
    } catch {
      // localStorage blocked (private browsing)
    }
  }, [contestId]);

  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const effectivelyVoted = hasVoted || localVoted;
  const showResults = effectivelyVoted || contestEnded;
  const voteCount = artwork.vote_count;
  const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

  async function handleVote() {
    if (effectivelyVoted || isVoting || contestEnded) return;

    if (!isAuthenticated) {
      toast.error("Sign in to vote");
      return;
    }

    setIsVoting(true);
    try {
      const res = await fetch("/api/v1/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artwork_id: artwork.id, contest_id: contestId }),
      });
      const data = await res.json();

      if (res.ok) {
        try { localStorage.setItem(localVoteKey(contestId), "1"); } catch { /* blocked */ }
        setLocalVoted(true);
        toast.success(`Voted for "${artwork.title}"`);
        router.refresh();
      } else {
        const messages: Record<number, string> = {
          409: "Already voted in this contest",
          429: "One vote per day",
          401: "Sign in to vote",
        };
        toast.error(messages[res.status] ?? data.error ?? "Vote failed");
        setIsVoting(false);
      }
    } catch {
      toast.error("Network error — try again");
      setIsVoting(false);
    }
  }

  const clickable = !effectivelyVoted && !contestEnded && isAuthenticated;

  return (
    <article
      onClick={clickable ? handleVote : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: isUserVote
          ? `1.5px solid ${accent}`
          : hovered && clickable
          ? `1.5px solid ${accent}60`
          : "1.5px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        overflow: "hidden",
        transition: "border-color 0.25s, transform 0.2s, box-shadow 0.3s",
        transform: isUserVote ? "translateY(-4px)" : hovered && clickable ? "translateY(-2px)" : "none",
        boxShadow: isUserVote
          ? `0 12px 40px ${accent}28`
          : hovered && clickable
          ? `0 8px 24px ${accent}16`
          : "none",
        cursor: clickable ? "pointer" : "default",
        position: "relative",
      }}
    >
      {/* Image */}
      <div className="group" style={{ position: "relative", aspectRatio: "1", overflow: "hidden" }}>
        <Image
          src={artwork.image_url}
          alt={artwork.title}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          priority={index < 2}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* YOUR VOTE badge */}
        {isUserVote && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: accent,
              color: "#000",
              fontSize: "10px",
              fontFamily: "var(--font-dm-mono)",
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: "4px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Your vote
          </div>
        )}

        {/* LEADING / WINNER badge */}
        {isLeading && showResults && !isUserVote && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "rgba(251,191,36,0.92)",
              color: "#08080e",
              fontSize: "10px",
              fontFamily: "var(--font-dm-mono)",
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: "4px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {contestEnded ? "Winner" : "Leading"}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "16px" }}>
        {/* Title */}
        <div
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "1rem",
            fontWeight: 700,
            color: "#eeeeff",
            marginBottom: "4px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {artwork.title}
        </div>

        {/* Prompt */}
        {artwork.prompt && (
          <div
            style={{
              fontSize: "11px",
              fontFamily: "var(--font-dm-mono)",
              color: "rgba(255,255,255,0.35)",
              lineHeight: 1.55,
              marginBottom: "14px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {artwork.prompt}
          </div>
        )}

        {/* Results: bar + counts — shown after voting or when ended */}
        {showResults && (
          <div style={{ marginBottom: "12px" }}>
            <div
              style={{
                height: "3px",
                background: "rgba(255,255,255,0.08)",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: isUserVote ? accent : isLeading ? "#fbbf24" : "#8b5cf6",
                  borderRadius: "2px",
                  transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "6px",
                fontFamily: "var(--font-dm-mono)",
                fontSize: "11px",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              <span>
                <LiveVoteCount artworkId={artwork.id} initialCount={voteCount} />
                {" votes"}
              </span>
              <span style={{ color: isUserVote ? accent : "rgba(255,255,255,0.35)" }}>
                {pct}%
              </span>
            </div>
          </div>
        )}

        {/* Vote button — only shown before voting */}
        {!effectivelyVoted && !contestEnded && (
          isAuthenticated ? (
            <VoteButtonInline
              isVoting={isVoting}
              accent={accent}
              hovered={hovered}
            />
          ) : (
            <Link
              href={`/signin?callbackUrl=${encodeURIComponent(`/contest/${contestId}`)}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                padding: "9px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "8px",
                color: "rgba(255,255,255,0.5)",
                fontFamily: "var(--font-dm-mono)",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textDecoration: "none",
              }}
            >
              SIGN IN TO VOTE
            </Link>
          )
        )}

        {/* Quiet vote count when voted but this isn't the user's pick */}
        {effectivelyVoted && !isUserVote && !showResults && (
          <div
            style={{
              textAlign: "center",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "11px",
              color: "rgba(255,255,255,0.25)",
              padding: "9px 0",
            }}
          >
            <LiveVoteCount artworkId={artwork.id} initialCount={voteCount} /> votes
          </div>
        )}
      </div>
    </article>
  );
}

// Inline — rendered inside ArtworkCard so it inherits the card's hover state
function VoteButtonInline({
  isVoting,
  accent,
  hovered,
}: {
  isVoting: boolean;
  accent: string;
  hovered: boolean;
}) {
  return (
    <div
      style={{
        width: "100%",
        padding: "9px",
        background: hovered ? `${accent}20` : "rgba(255,255,255,0.06)",
        border: `1px solid ${hovered ? accent : "rgba(255,255,255,0.12)"}`,
        borderRadius: "8px",
        color: hovered ? accent : "#eeeeff",
        fontFamily: "var(--font-dm-mono)",
        fontSize: "12px",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textAlign: "center",
        transition: "background 0.2s, border-color 0.2s, color 0.2s",
        cursor: isVoting ? "wait" : "pointer",
        pointerEvents: "none", // click handled by parent article
      }}
    >
      {isVoting ? "SUBMITTING..." : "VOTE"}
    </div>
  );
}
