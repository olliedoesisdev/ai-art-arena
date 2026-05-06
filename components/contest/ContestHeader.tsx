import { ContestTimer } from "./ContestTimer";

interface ContestHeaderProps {
  weekNumber: number;
  endDate: string;
  status: "active" | "archived";
}

export function ContestHeader({ weekNumber, endDate, status }: ContestHeaderProps) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <p
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#a78bfa",
          marginBottom: "8px",
        }}
      >
        {status === "active" ? "Live now" : "Archived"}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "clamp(2rem, 5vw, 3rem)",
            letterSpacing: "-0.03em",
            color: "#eeeeff",
            lineHeight: 1,
          }}
        >
          Week {weekNumber}
        </h1>

        {status === "active" && <ContestTimer endDate={endDate} />}
      </div>
    </div>
  );
}
