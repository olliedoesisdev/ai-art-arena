import Link from "next/link";
import Image from "next/image";
import { Contest, Artwork } from "@/lib/types";
import { WinnerBadge } from "./WinnerBadge";

interface ArchiveCardProps {
  contest: Contest & { artworks?: Artwork[] };
}

export function ArchiveCard({ contest }: ArchiveCardProps) {
  const winner = contest.artworks?.slice().sort((a, b) => b.vote_count - a.vote_count)[0];
  const totalVotes = contest.artworks?.reduce((sum, a) => sum + a.vote_count, 0) ?? 0;

  return (
    <Link href={`/archive/${contest.week_number}`} style={{ textDecoration: "none", display: "block" }}>
      <article
        className="group"
        style={{
          background: "var(--color-bg-surface)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "14px",
          overflow: "hidden",
          transition: "transform 0.2s, border-color 0.2s",
        }}
      >
        {winner ? (
          <div style={{ position: "relative", aspectRatio: "1" }}>
            <Image
              src={winner.image_url}
              alt={winner.title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <WinnerBadge />
          </div>
        ) : (
          <div
            style={{
              aspectRatio: "1",
              background: "var(--color-bg-surface2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-dim)" }}>No artworks</span>
          </div>
        )}

        <div style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <h3
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 700,
                fontSize: "1rem",
                color: "var(--color-text)",
              }}
            >
              Week {contest.week_number}
            </h3>
            <span
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
              }}
            >
              {new Date(contest.end_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </span>
          </div>

          {winner && (
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                marginBottom: "6px",
              }}
            >
              {winner.title}
            </p>
          )}

          <p
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "0.75rem",
              color: "var(--color-text-dim)",
            }}
          >
            {totalVotes.toLocaleString()} votes
          </p>
        </div>
      </article>
    </Link>
  );
}
