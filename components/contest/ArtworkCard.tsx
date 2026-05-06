import Image from "next/image";
import { Artwork } from "@/lib/types";
import { VoteButton } from "./VoteButton";
import { LiveVoteCount } from "./LiveVoteCount";

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

const RANK_COLORS: Record<number, string> = {
  0: "#fbbf24",
  1: "#b0b0c8",
  2: "#c07840",
};

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
  const votePercentage =
    totalVotes > 0 ? ((artwork.vote_count / totalVotes) * 100).toFixed(1) : "0";
  const showResults = hasVoted || contestEnded;
  const rankColor = RANK_COLORS[index] ?? "#3a3a58";

  return (
    <article
      className="animate-card"
      style={
        {
          "--card-delay": `${index * 60}ms`,
          background: "#111119",
          border: `1px solid ${isUserVote ? "rgba(52,211,153,0.4)" : isLeading && showResults ? "rgba(251,191,36,0.3)" : "rgba(139,92,246,0.12)"}`,
          borderRadius: "14px",
          overflow: "hidden",
          transition: "transform 0.2s, border-color 0.2s",
        } as React.CSSProperties
      }
    >
      {/* Image */}
      <div className="group" style={{ position: "relative", aspectRatio: "1" }}>
        <Image
          src={artwork.image_url}
          alt={artwork.title}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          priority={index < 2}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay badges */}
        {isLeading && showResults && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: "rgba(251,191,36,0.9)",
              color: "#08080e",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: "100px",
            }}
          >
            {contestEnded ? "Winner" : "Leading"}
          </div>
        )}
        {isUserVote && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              background: "rgba(52,211,153,0.9)",
              color: "#08080e",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: "100px",
            }}
          >
            Your vote
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 700,
              fontSize: "1rem",
              color: "#eeeeff",
              lineHeight: 1.3,
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {artwork.title}
          </h3>

          {/* Rank badge */}
          <span
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "0.6875rem",
              fontWeight: 700,
              color: rankColor,
              flexShrink: 0,
            }}
          >
            #{index + 1}
          </span>
        </div>

        {artwork.prompt && (
          <p
            style={{
              fontSize: "0.8125rem",
              color: "#7878a0",
              lineHeight: 1.5,
              marginBottom: "14px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            &ldquo;{artwork.prompt}&rdquo;
          </p>
        )}

        {/* Vote count + percentage */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontWeight: 500,
              fontSize: "1rem",
              color: "#eeeeff",
            }}
          >
            <LiveVoteCount artworkId={artwork.id} initialCount={artwork.vote_count} />
            <span style={{ fontSize: "0.75rem", color: "#7878a0", marginLeft: "4px" }}>
              votes
            </span>
          </span>
          {showResults && totalVotes > 0 && (
            <span
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "0.8125rem",
                color: "#7878a0",
              }}
            >
              {votePercentage}%
            </span>
          )}
        </div>

        {/* Progress bar */}
        {showResults && totalVotes > 0 && (
          <div
            style={{
              height: "3px",
              background: "#1f1f2a",
              borderRadius: "100px",
              overflow: "hidden",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${votePercentage}%`,
                background: isLeading ? "#fbbf24" : isUserVote ? "#34d399" : "#8b5cf6",
                borderRadius: "100px",
                transition: "width 0.5s ease",
              }}
            />
          </div>
        )}

        {/* Vote button */}
        {!hasVoted && !contestEnded && (
          <VoteButton
            artworkId={artwork.id}
            contestId={contestId}
            isAuthenticated={isAuthenticated}
          />
        )}
      </div>
    </article>
  );
}
