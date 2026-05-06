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
  1: "#fbbf24",
  2: "#b0b0c8",
  3: "#c07840",
};

export function LeaderboardList({ artworks }: { artworks: LeaderboardEntry[] }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1px",
        background: "rgba(139,92,246,0.12)",
        border: "1px solid rgba(139,92,246,0.12)",
        borderRadius: "14px",
        overflow: "hidden",
      }}
    >
      {artworks.map((artwork, index) => {
        const rank = index + 1;
        const rankColor = RANK_COLORS[rank] ?? "#3a3a58";
        const isTop3 = rank <= 3;

        return (
          <div
            key={artwork.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "14px 20px",
              background: "#111119",
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
                border: isTop3 ? `1px solid ${rankColor}40` : "none",
              }}
            >
              <Image
                src={artwork.image_url}
                alt={artwork.title}
                fill
                sizes="52px"
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#eeeeff",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginBottom: "3px",
                }}
              >
                {artwork.title}
              </p>
              {artwork.contests && (
                <p style={{ fontSize: "0.75rem", color: "#3a3a58" }}>
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
                  color: isTop3 ? rankColor : "#7878a0",
                }}
              >
                {artwork.vote_count.toLocaleString()}
              </span>
              <span style={{ display: "block", fontSize: "0.6875rem", color: "#3a3a58" }}>votes</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
