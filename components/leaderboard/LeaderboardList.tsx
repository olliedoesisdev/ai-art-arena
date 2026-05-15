import Image from "next/image";

interface LeaderboardEntry {
  id: string;
  title: string;
  image_url: string;
  vote_count: number;
  contest_id: string;
  contests: { week_number: number } | null;
}

const RANK_COLORS: Record<number, string> = {
  1: "var(--color-status-warning)",   /* gold */
  2: "var(--color-rank-silver)",      /* documented in globals.css */
  3: "var(--color-rank-bronze)",      /* documented in globals.css */
};

export function LeaderboardList({ artworks }: { artworks: LeaderboardEntry[] }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1px",
        background: "var(--color-border-subtle)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "14px",
        overflow: "hidden",
      }}
    >
      {artworks.map((artwork, index) => {
        const rank = index + 1;
        const rankColor = RANK_COLORS[rank] ?? "var(--color-text-muted)";
        const isTop3 = rank <= 3;

        return (
          <div
            key={artwork.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "14px 20px",
              background: "var(--color-bg-surface)",
            }}
          >
            {/* Rank */}
            <span
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontWeight: 700,
                fontSize: isTop3 ? "1rem" : "0.8125rem",
                color: rankColor,
                width: "32px",
                flexShrink: 0,
                textAlign: "right",
              }}
            >
              {rank}
            </span>

            {/* Thumbnail */}
            <div
              style={{
                position: "relative",
                width: "52px",
                height: "52px",
                flexShrink: 0,
                borderRadius: "6px",
                overflow: "hidden",
                border: isTop3 ? "1px solid var(--color-border-mid)" : "none",
              }}
            >
              <Image
                src={artwork.image_url}
                alt={artwork.title}
                fill
                sizes="52px"
                priority={index === 0}
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--color-text)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginBottom: "3px",
                }}
              >
                {artwork.title}
              </p>
              {artwork.contests && (
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                  Week {artwork.contests.week_number}
                </p>
              )}
            </div>

            {/* Vote count */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <span
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "0.9375rem",
                  fontWeight: 500,
                  color: isTop3 ? rankColor : "var(--color-text-muted)",
                }}
              >
                {artwork.vote_count.toLocaleString()}
              </span>
              <span style={{ display: "block", fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>votes</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
