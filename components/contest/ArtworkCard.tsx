"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { LiveVoteCount } from "./LiveVoteCount";
import { Artwork } from "@/lib/types";
import { trackEvent } from "@/lib/gtag";

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

// Per-card accent colours — documented in globals.css under "Artwork card accents"
const ACCENT_COLORS = [
  "var(--color-card-accent-0)",
  "var(--color-card-accent-1)",
  "var(--color-card-accent-2)",
  "var(--color-card-accent-3)",
  "var(--color-card-accent-4)",
  "var(--color-card-accent-5)",
];

const ACCENT_BORDER = [
  "var(--color-card-accent-0-border)",
  "var(--color-card-accent-1-border)",
  "var(--color-card-accent-2-border)",
  "var(--color-card-accent-3-border)",
  "var(--color-card-accent-4-border)",
  "var(--color-card-accent-5-border)",
];

const ACCENT_SHADOW = [
  "var(--color-card-accent-0-shadow)",
  "var(--color-card-accent-1-shadow)",
  "var(--color-card-accent-2-shadow)",
  "var(--color-card-accent-3-shadow)",
  "var(--color-card-accent-4-shadow)",
  "var(--color-card-accent-5-shadow)",
];

const ACCENT_SHADOW_SM = [
  "var(--color-card-accent-0-shadow-sm)",
  "var(--color-card-accent-1-shadow-sm)",
  "var(--color-card-accent-2-shadow-sm)",
  "var(--color-card-accent-3-shadow-sm)",
  "var(--color-card-accent-4-shadow-sm)",
  "var(--color-card-accent-5-shadow-sm)",
];

const ACCENT_DIM = [
  "var(--color-card-accent-0-dim)",
  "var(--color-card-accent-1-dim)",
  "var(--color-card-accent-2-dim)",
  "var(--color-card-accent-3-dim)",
  "var(--color-card-accent-4-dim)",
  "var(--color-card-accent-5-dim)",
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
  const accentBorder = ACCENT_BORDER[index % ACCENT_BORDER.length];
  const accentShadow = ACCENT_SHADOW[index % ACCENT_SHADOW.length];
  const accentShadowSm = ACCENT_SHADOW_SM[index % ACCENT_SHADOW_SM.length];
  const accentDim = ACCENT_DIM[index % ACCENT_DIM.length];
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
        body: JSON.stringify({ artwork_id: artwork.id }),
      });
      const data = await res.json();

      if (res.ok) {
        try { localStorage.setItem(localVoteKey(contestId), "1"); } catch { /* blocked */ }
        setLocalVoted(true);
        trackEvent('vote_submitted', { contest_id: contestId, artwork_id: artwork.id, artwork_title: artwork.title })
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

  // Border and shadow use per-accent CSS token variants — defined in globals.css
  const cardStyle: React.CSSProperties = {
    border: isUserVote
      ? `1.5px solid ${accent}`
      : hovered && clickable
      ? `1.5px solid ${accentBorder}`
      : "1.5px solid var(--color-border-subtle)",
    transform: isUserVote ? "translateY(-4px)" : hovered && clickable ? "translateY(-2px)" : "none",
    boxShadow: isUserVote
      ? `0 12px 40px ${accentShadow}`
      : hovered && clickable
      ? `0 8px 24px ${accentShadowSm}`
      : "none",
  };

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
      className="relative overflow-hidden rounded-2xl bg-white/3 transition-[border-color,transform,box-shadow] duration-200"
      style={{ ...cardStyle, cursor: clickable ? "pointer" : "default" }}
    >
      {/* Image — links to artwork detail page, stops vote click propagation */}
      <Link
        href={`/artwork/${artwork.id}`}
        onClick={(e) => e.stopPropagation()}
        className="block no-underline"
      >
        <div className="group relative aspect-square overflow-hidden">
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
              className="absolute right-2.5 top-2.5 rounded-[4px] px-2 py-[3px] font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-bg-base"
              style={{ background: accent }}
            >
              Your vote
            </div>
          )}

          {/* LEADING / WINNER badge */}
          {isLeading && showResults && !isUserVote && (
            <div className="absolute right-2.5 top-2.5 rounded-[4px] bg-status-warning/90 px-2 py-[3px] font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-bg-base">
              {contestEnded ? "Winner" : "Leading"}
            </div>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="p-4">
        {/* Title */}
        <div className="mb-1 overflow-hidden text-ellipsis whitespace-nowrap font-sans text-base font-bold text-text">
          {artwork.title}
        </div>

        {/* Prompt */}
        {artwork.prompt && (
          <div
            className="mb-3.5 overflow-hidden font-mono text-[11px] leading-[1.55] text-text-muted"
            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
          >
            {artwork.prompt}
          </div>
        )}

        {/* Results: bar + counts — shown after voting or when ended */}
        {showResults && (
          <div className="mb-3">
            <div className="h-[3px] overflow-hidden rounded-xs bg-border-subtle">
              <div
                className="h-full rounded-xs transition-[width] duration-800 ease-in-out"
                style={{
                  width: `${pct}%`,
                  background: isUserVote ? accent : isLeading ? "var(--color-status-warning)" : "var(--color-purple)",
                }}
              />
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[11px] text-text-muted">
              <span>
                <LiveVoteCount artworkId={artwork.id} initialCount={voteCount} />
                {" votes"}
              </span>
              <span style={{ color: isUserVote ? accent : undefined }}>
                {pct}%
              </span>
            </div>
          </div>
        )}

        {/* Share button — shown on the card the user voted for */}
        {isUserVote && (
          <button
            onClick={(e) => { e.stopPropagation(); handleShare(); }}
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-(--radius-sm) px-0 py-[9px] font-mono text-[11px] font-semibold uppercase tracking-[0.08em] transition-[background,border-color,color] duration-200"
            style={{
              background: copied ? accentDim : "var(--color-purple-dim2)",
              border: `1px solid ${copied ? accent : "var(--color-border-subtle)"}`,
              color: copied ? accent : "var(--color-text-muted)",
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
            accentDim={accentDim}
            hovered={hovered}
          />
        )}

        {/* Quiet vote count when voted but this is not the user's pick */}
        {effectivelyVoted && !isUserVote && !showResults && (
          <div className="py-[9px] text-center font-mono text-[11px] text-text-dim">
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
  accentDim,
  hovered,
}: {
  isVoting: boolean;
  accent: string;
  accentDim: string;
  hovered: boolean;
}) {
  return (
    <div
      className="w-full rounded-(--radius-sm) px-0 py-[9px] text-center font-mono text-[12px] font-semibold uppercase tracking-[0.08em] transition-[background,border-color,color] duration-200"
      style={{
        background: hovered ? accentDim : "var(--color-purple-dim2)",
        border: `1px solid ${hovered ? accent : "var(--color-border-subtle)"}`,
        color: hovered ? accent : "var(--color-text)",
        cursor: isVoting ? "wait" : "pointer",
        pointerEvents: "none", // click handled by parent article
      }}
    >
      {isVoting ? "SUBMITTING..." : "VOTE"}
    </div>
  );
}
