import Image from "next/image";
import type { TopArtwork } from "@/lib/types";

interface Props {
  artworks: TopArtwork[];
}

const RANK_COLOR = ["var(--color-status-warning)", "var(--color-rank-silver)", "var(--color-rank-bronze)"];

export function TopArtworksTable({ artworks }: Props) {
  if (artworks.length === 0) {
    return <p style={{ fontSize: "0.875rem", color: "var(--color-text-dim)" }}>No artworks yet.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {artworks.map((artwork, i) => {
        const rankColor = RANK_COLOR[i] ?? "var(--color-text-dim)";
        const maxVotes = artworks[0].vote_count || 1;
        const pct = (artwork.vote_count / maxVotes) * 100;

        return (
          <div
            key={artwork.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 12px",
              background: "var(--color-bg-surface2)",
              borderRadius: "8px",
            }}
          >
            <span style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "0.8125rem",
              fontWeight: 700,
              color: rankColor,
              minWidth: "28px",
            }}>
              #{i + 1}
            </span>

            <div style={{ position: "relative", width: "36px", height: "36px", borderRadius: "6px", overflow: "hidden", flexShrink: 0 }}>
              <Image
                src={artwork.image_url}
                alt={artwork.title}
                fill
                sizes="36px"
                className="object-cover"
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {artwork.title}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <div style={{ flex: 1, height: "3px", background: "var(--color-bg-base)", borderRadius: "100px", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: rankColor, borderRadius: "100px", transition: "width 0.3s" }} />
                </div>
                {artwork.contest_number !== null && (
                  <span style={{ fontSize: "0.6875rem", color: "var(--color-text-dim)", fontFamily: "var(--font-dm-mono)", flexShrink: 0 }}>
                    #{artwork.contest_number}
                  </span>
                )}
              </div>
            </div>

            <span style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: rankColor,
              minWidth: "32px",
              textAlign: "right",
            }}>
              {artwork.vote_count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
