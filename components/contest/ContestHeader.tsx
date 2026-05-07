import { ContestTimer } from "./ContestTimer";

interface ContestHeaderProps {
  weekNumber: number;
  endDate: string;
  status: "active" | "archived";
}

export function ContestHeader({ weekNumber, endDate, status }: ContestHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "24px",
        flexWrap: "wrap",
        marginBottom: "40px",
      }}
    >
      {/* Left: eyebrow + title */}
      <div>
        <div
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "11px",
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.35)",
            marginBottom: "8px",
            textTransform: "uppercase",
          }}
        >
          Week {weekNumber} &middot; {status === "active" ? "Open for voting" : "Archived"}
        </div>
        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "clamp(2rem, 5vw, 3rem)",
            letterSpacing: "-0.03em",
            color: "#eeeeff",
            lineHeight: 1.05,
            margin: 0,
          }}
        >
          The Arena
        </h1>
      </div>

      {/* Right: timer */}
      {status === "active" && (
        <div>
          <div
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "10px",
              letterSpacing: "0.15em",
              color: "rgba(255,255,255,0.3)",
              marginBottom: "8px",
              textTransform: "uppercase",
            }}
          >
            Contest closes in
          </div>
          <ContestTimer endDate={endDate} />
        </div>
      )}
    </div>
  );
}
