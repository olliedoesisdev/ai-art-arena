import Image from "next/image";

interface LeaderboardFeaturedProps {
  artwork: {
    id: string;
    title: string;
    image_url: string;
    vote_count: number;
    contests: { week_number: number } | null;
  };
}

export function LeaderboardFeatured({ artwork }: LeaderboardFeaturedProps) {
  return (
    <div
      style={{
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-status-warning-border)",
        borderRadius: "14px",
        overflow: "hidden",
        position: "sticky",
        top: "80px",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", aspectRatio: "1" }}>
        <Image
          src={artwork.image_url}
          alt={artwork.title}
          fill
          sizes="(max-width: 1024px) 100vw, 400px"
          priority
          className="object-cover"
        />
        <div
          style={{
            position: "absolute",
            top: "14px",
            left: "14px",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-status-warning)",
            background: "var(--color-status-warning-dim2)",
            border: "1px solid var(--color-status-warning-border-mid)",
            padding: "4px 10px",
            borderRadius: "100px",
          }}
        >
          ★ All-time #1
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "20px" }}>
        <h3
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: "1.125rem",
            color: "var(--color-text)",
            marginBottom: "8px",
          }}
        >
          {artwork.title}
        </h3>

        {artwork.contests && (
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "16px" }}>
            Week {artwork.contests.week_number}
          </p>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "6px",
            padding: "12px 16px",
            background: "var(--color-status-warning-dim)",
            border: "1px solid var(--color-status-warning-dim2)",
            borderRadius: "8px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "1.75rem",
              fontWeight: 500,
              color: "var(--color-status-warning)",
            }}
          >
            {artwork.vote_count.toLocaleString()}
          </span>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>votes</span>
        </div>
      </div>
    </div>
  );
}
