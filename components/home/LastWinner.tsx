import Image from "next/image";
import Link from "next/link";

interface LastWinnerProps {
  artwork: {
    id: string;
    title: string;
    image_url: string;
    vote_count: number;
    contest_id: string;
  };
  weekNumber: number;
}

export function LastWinner({ artwork, weekNumber }: LastWinnerProps) {
  return (
    <section style={{ paddingBottom: "100px" }}>
      <div className="shell">
        <h2
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-purple-light)",
            marginBottom: "16px",
          }}
        >
          Yesterday&apos;s champion
        </h2>

        <Link
          href={`/contest/${artwork.contest_id}`}
          style={{ textDecoration: "none", display: "block" }}
        >
          <div
            className="group"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "28px",
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "14px",
              padding: "20px",
              transition: "border-color 0.2s, transform 0.2s",
            }}
          >
            {/* Thumbnail */}
            <div
              style={{
                position: "relative",
                width: "120px",
                height: "120px",
                flexShrink: 0,
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <Image
                src={artwork.image_url}
                alt={artwork.title}
                fill
                sizes="120px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Winner badge */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-status-warning)",
                  background: "var(--color-status-warning-dim)",
                  border: "1px solid rgba(251,191,36,0.2)", /* status-warning at 20% — no alpha token */
                  padding: "3px 10px",
                  borderRadius: "100px",
                  marginBottom: "10px",
                }}
              >
                ★ Day {weekNumber} Winner
              </span>

              <h3
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 700,
                  fontSize: "1.125rem",
                  color: "var(--color-text)",
                  marginBottom: "6px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {artwork.title}
              </h3>

              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                <span
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    color: "var(--color-purple-light)",
                    fontWeight: 500,
                  }}
                >
                  {artwork.vote_count.toLocaleString()}
                </span>{" "}
                votes
              </p>
            </div>

            {/* Arrow */}
            <span
              aria-hidden
              style={{
                fontSize: "1.25rem",
                color: "var(--color-text-muted)",
                flexShrink: 0,
                transition: "color 0.2s",
              }}
            >
              →
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
