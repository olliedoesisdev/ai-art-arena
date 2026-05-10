"use client";

import { useState } from "react";
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
}: ArtworkCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [localVoted, setLocalVoted] = useState(() => {
    try {
      return typeof window !== "undefined" && !!localStorage.getItem(localVoteKey(contestId));
    } catch {
      return false;
    }
  });
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const effectivelyVoted = hasVoted || localVoted;
  const showResults = effectivelyVoted || contestEnded;
  const voteCount = artwork.vote_count;
  const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

  async function handleVote() {
    if (effectivelyVoted || isVoting || contestEnded) return;

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
        toast.error(data.error ?? "Vote failed");
        setIsVoting(false);
      }
    } catch {
      toast.error("Network error — try again");
      setIsVoting(false);
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/contest/${contestId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  }

  const clickable = !effectivelyVoted && !contestEnded;

  return (
    <article
      onClick={clickable ? handleVote : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleVote(); } } : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? `Vote for ${artwork.title}` : undefined}
      aria-pressed={isUserVote ? true : undefined}
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
      {/* Image — links to artwork detail page, stops vote click propagation */}
      <Link
        href={`/artwork/${artwork.id}`}
        onClick={(e) => e.stopPropagation()}
        style={{ display: "block", textDecoration: "none" }}
      >
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
      </Link>

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

        {/* Share button — shown on the card the user voted for */}
        {isUserVote && (
          <button
            onClick={(e) => { e.stopPropagation(); handleShare(); }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              width: "100%",
              padding: "9px",
              background: copied ? `${accent}20` : "rgba(255,255,255,0.04)",
              border: `1px solid ${copied ? accent : "rgba(255,255,255,0.1)"}`,
              borderRadius: "8px",
              color: copied ? accent : "rgba(255,255,255,0.4)",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              cursor: "pointer",
              transition: "background 0.2s, border-color 0.2s, color 0.2s",
              marginTop: "8px",
            }}
          >
            {copied ? "LINK COPIED ✓" : "SHARE →"}
          </button>
        )}

        {/* Vote button — shown to everyone before voting */}
        {!effectivelyVoted && !contestEnded && (
          <VoteButtonInline
            isVoting={isVoting}
            accent={accent}
            hovered={hovered}
          />
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
