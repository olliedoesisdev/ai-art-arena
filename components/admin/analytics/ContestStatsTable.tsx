import type { ContestVoteStat } from "@/lib/types";

interface Props {
  data: ContestVoteStat[];
}

export function ContestStatsTable({ data }: Props) {
  if (data.length === 0) {
    return <p style={{ fontSize: "0.875rem", color: "#3a3a58" }}>No contests yet.</p>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(139,92,246,0.12)" }}>
            {["Week", "Status", "Artworks", "Total Votes", "Avg / Artwork", "vs Prev"].map((h) => (
              <th
                key={h}
                style={{
                  padding: "8px 12px",
                  textAlign: "left",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#3a3a58",
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
                <td style={{ padding: "12px 12px", color: "#eeeeff", fontWeight: 600, fontFamily: "var(--font-dm-mono)" }}>
                  {contest.week_number}
                </td>
                <td style={{ padding: "12px 12px" }}>
                  <span style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: contest.status === "active" ? "#34d399" : "#3a3a58",
                    background: contest.status === "active" ? "rgba(52,211,153,0.08)" : "rgba(58,58,88,0.15)",
                    padding: "2px 8px",
                    borderRadius: "100px",
                  }}>
                    {contest.status}
                  </span>
                </td>
                <td style={{ padding: "12px 12px", color: "#7878a0", fontFamily: "var(--font-dm-mono)" }}>
                  {contest.artwork_count}
                </td>
                <td style={{ padding: "12px 12px", color: "#eeeeff", fontFamily: "var(--font-dm-mono)", fontWeight: 600 }}>
                  {contest.total_votes}
                </td>
                <td style={{ padding: "12px 12px", color: "#7878a0", fontFamily: "var(--font-dm-mono)" }}>
                  {contest.avg_votes_per_artwork.toFixed(1)}
                </td>
                <td style={{ padding: "12px 12px" }}>
                  {delta !== null ? (
                    <span style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: delta > 0 ? "#34d399" : delta < 0 ? "#f87171" : "#3a3a58",
                    }}>
                      {delta > 0 ? "+" : ""}{delta}
                    </span>
                  ) : (
                    <span style={{ color: "#3a3a58" }}>—</span>
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
