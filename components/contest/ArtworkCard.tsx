"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { LiveVoteCount } from "./LiveVoteCount";
import { Artwork } from "@/lib/types";
import { trackEvent } from "@/lib/gtag";

const MAX_VOTES_PER_CONTEST = 50;
const MAX_VOTES_PER_ARTWORK = 50;

interface ArtworkCardProps {
  artwork: Artwork;
  contestId: string;
  index: number;
  isLeading: boolean;
  userVotesOnArtwork: number;
  userVotesOnContest: number;
  totalVotes: number;
  contestEnded: boolean;
}

function localVoteKey(contestId: string) {
  return `votes:${contestId}`;
}

function localArtworkVoteKey(contestId: string, artworkId: string) {
  return `votes:${contestId}:${artworkId}`;
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
  userVotesOnArtwork,
  userVotesOnContest,
  totalVotes,
  contestEnded,
}: ArtworkCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [hovered, setHovered] = useState(false);
  // Local vote counts for optimistic UI (authenticated users rely on server counts)
  const [localContestVotes, setLocalContestVotes] = useState(() => {
    try {
      return typeof window !== "undefined"
        ? parseInt(localStorage.getItem(localVoteKey(contestId)) ?? "0", 10)
        : 0;
    } catch { return 0; }
  });
  const [localArtworkVotes, setLocalArtworkVotes] = useState(() => {
    try {
      return typeof window !== "undefined"
        ? parseInt(localStorage.getItem(localArtworkVoteKey(contestId, artwork.id)) ?? "0", 10)
        : 0;
    } catch { return 0; }
  });
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const accentBorder = ACCENT_BORDER[index % ACCENT_BORDER.length];
  const accentShadow = ACCENT_SHADOW[index % ACCENT_SHADOW.length];
  const accentShadowSm = ACCENT_SHADOW_SM[index % ACCENT_SHADOW_SM.length];
  const accentDim = ACCENT_DIM[index % ACCENT_DIM.length];

  // Effective vote counts — server count wins for authenticated users (accurate after refresh),
  // local count used as optimistic fallback for anonymous users between refreshes
  const effectiveContestVotes = Math.max(userVotesOnContest, localContestVotes);
  const effectiveArtworkVotes = Math.max(userVotesOnArtwork, localArtworkVotes);

  const contestLimitReached = effectiveContestVotes >= MAX_VOTES_PER_CONTEST;
  const artworkLimitReached = effectiveArtworkVotes >= MAX_VOTES_PER_ARTWORK;
  const hasVotedOnThis = effectiveArtworkVotes > 0;
  const canVote = !contestLimitReached && !artworkLimitReached && !contestEnded;
  const showResults = effectiveContestVotes > 0 || contestEnded;
  const voteCount = artwork.vote_count;
  const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

  async function handleVote() {
    if (!canVote || isVoting) return;

    setIsVoting(true);
    try {
      const res = await fetch("/api/v1/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artwork_id: artwork.id }),
      });
      const data = await res.json();

      if (res.ok) {
        const newContestVotes = localContestVotes + 1;
        const newArtworkVotes = localArtworkVotes + 1;
        try {
          localStorage.setItem(localVoteKey(contestId), String(newContestVotes));
          localStorage.setItem(localArtworkVoteKey(contestId, artwork.id), String(newArtworkVotes));
        } catch { /* blocked */ }
        setLocalContestVotes(newContestVotes);
        setLocalArtworkVotes(newArtworkVotes);
        trackEvent('vote_submitted', { contest_id: contestId, artwork_id: artwork.id, artwork_title: artwork.title });
        const remaining = MAX_VOTES_PER_CONTEST - newContestVotes;
        if (remaining > 0) {
          toast.success(`Voted for "${artwork.title}" — ${remaining} vote${remaining !== 1 ? "s" : ""} left`);
        } else {
          toast.success(`Voted for "${artwork.title}" — all votes used`);
        }
        router.refresh();
        setIsVoting(false);
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

  const clickable = canVote;

  // Border and shadow use per-accent CSS token variants — defined in globals.css
  const cardStyle: React.CSSProperties = {
    border: hasVotedOnThis
      ? `1.5px solid ${accent}`
      : hovered && clickable
      ? `1.5px solid ${accentBorder}`
      : "1.5px solid var(--color-border-subtle)",
    transform: hasVotedOnThis ? "translateY(-4px)" : hovered && clickable ? "translateY(-2px)" : "none",
    boxShadow: hasVotedOnThis
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
      aria-pressed={hasVotedOnThis ? true : undefined}
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
          {hasVotedOnThis && (
            <div
              className="absolute right-2.5 top-2.5 rounded-[4px] px-2 py-[3px] font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-bg-base"
              style={{ background: accent }}
            >
              {effectiveArtworkVotes > 1 ? `Your vote ×${effectiveArtworkVotes}` : "Your vote"}
            </div>
          )}

          {/* LEADING / WINNER badge */}
          {isLeading && showResults && !hasVotedOnThis && (
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
                  background: hasVotedOnThis ? accent : isLeading ? "var(--color-status-warning)" : "var(--color-purple)",
                }}
              />
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[11px] text-text-muted">
              <span>
                <LiveVoteCount artworkId={artwork.id} initialCount={voteCount} />
                {" votes"}
              </span>
              <span style={{ color: hasVotedOnThis ? accent : undefined }}>
                {pct}%
              </span>
            </div>
          </div>
        )}

        {/* Share button — shown on the card the user voted for */}
        {hasVotedOnThis && (
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

        {/* Vote button — shown when user can still vote on this artwork */}
        {canVote && (
          <VoteButtonInline
            isVoting={isVoting}
            accent={accent}
            accentDim={accentDim}
            hovered={hovered}
            votesLeft={MAX_VOTES_PER_CONTEST - effectiveContestVotes}
            artworkVotesLeft={MAX_VOTES_PER_ARTWORK - effectiveArtworkVotes}
          />
        )}

        {/* Contest limit reached — show disabled state */}
        {contestLimitReached && !contestEnded && (
          <div className="py-[9px] text-center font-mono text-[11px] text-text-dim">
            All {MAX_VOTES_PER_CONTEST} votes used
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
  votesLeft,
  artworkVotesLeft,
}: {
  isVoting: boolean;
  accent: string;
  accentDim: string;
  hovered: boolean;
  votesLeft: number;
  artworkVotesLeft: number;
}) {
  const label = isVoting
    ? "SUBMITTING..."
    : votesLeft === MAX_VOTES_PER_CONTEST
    ? "VOTE"
    : `VOTE (${votesLeft} left)`;

  const subLabel = artworkVotesLeft < MAX_VOTES_PER_ARTWORK
    ? `${artworkVotesLeft} more on this`
    : null;

  return (
    <div
      className="w-full rounded-(--radius-sm) px-0 py-[9px] text-center font-mono font-semibold uppercase tracking-[0.08em] transition-[background,border-color,color] duration-200"
      style={{
        background: hovered ? accentDim : "var(--color-purple-dim2)",
        border: `1px solid ${hovered ? accent : "var(--color-border-subtle)"}`,
        color: hovered ? accent : "var(--color-text)",
        cursor: isVoting ? "wait" : "pointer",
        pointerEvents: "none", // click handled by parent article
        fontSize: subLabel ? "11px" : "12px",
        lineHeight: subLabel ? "1.3" : undefined,
      }}
    >
      <div>{label}</div>
      {subLabel && (
        <div style={{ fontSize: "9px", opacity: 0.6, marginTop: "2px" }}>{subLabel}</div>
      )}
    </div>
  );
}
