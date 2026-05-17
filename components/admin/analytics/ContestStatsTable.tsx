import type { ContestVoteStat } from "@/lib/types";

interface Props {
  data: ContestVoteStat[];
}

export function ContestStatsTable({ data }: Props) {
  if (data.length === 0) {
    return <p style={{ fontSize: "0.875rem", color: "var(--color-text-dim)" }}>No contests yet.</p>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(139,92,246,0.12)" }}>
            {["Contest #", "Status", "Artworks", "Total Votes", "Avg / Artwork", "vs Prev"].map((h) => (
              <th
                key={h}
                style={{
                  padding: "8px 12px",
                  textAlign: "left",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-text-dim)",
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((contest, i) => {
            const prev = i > 0 ? data[i - 1].total_votes : null;
            const delta = prev !== null ? contest.total_votes - prev : null;

            return (
              <tr key={contest.id} style={{ borderBottom: "1px solid rgba(139,92,246,0.06)" }}>
                <td style={{ padding: "12px 12px", color: "var(--color-text)", fontWeight: 600, fontFamily: "var(--font-dm-mono)" }}>
                  {contest.contest_number}
                </td>
                <td style={{ padding: "12px 12px" }}>
                  <span style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: contest.status === "active" ? "var(--color-status-success)" : "var(--color-text-dim)",
                    background: contest.status === "active" ? "rgba(52,211,153,0.08)" : "rgba(58,58,88,0.15)",
                    padding: "2px 8px",
                    borderRadius: "100px",
                  }}>
                    {contest.status}
                  </span>
                </td>
                <td style={{ padding: "12px 12px", color: "var(--color-text-muted)", fontFamily: "var(--font-dm-mono)" }}>
                  {contest.artwork_count}
                </td>
                <td style={{ padding: "12px 12px", color: "var(--color-text)", fontFamily: "var(--font-dm-mono)", fontWeight: 600 }}>
                  {contest.total_votes}
                </td>
                <td style={{ padding: "12px 12px", color: "var(--color-text-muted)", fontFamily: "var(--font-dm-mono)" }}>
                  {contest.avg_votes_per_artwork.toFixed(1)}
                </td>
                <td style={{ padding: "12px 12px" }}>
                  {delta !== null ? (
                    <span style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: delta > 0 ? "var(--color-status-success)" : delta < 0 ? "var(--color-status-error)" : "var(--color-text-dim)",
                    }}>
                      {delta > 0 ? "+" : ""}{delta}
                    </span>
                  ) : (
                    <span style={{ color: "var(--color-text-dim)" }}>â€”</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
