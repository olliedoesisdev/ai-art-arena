// components/contest/ContestHeader.tsx [SERVER]
import Link from "next/link";
import { ContestTimer } from "./ContestTimer";
import { ThemeBadge } from "./ThemeBadge";
import { ContestType } from "@/lib/types";

interface ContestHeaderProps {
  contestId: string;
  contestNumber: number;
  endDate: string;
  status: "active" | "archived";
  contestType: ContestType;
  theme?: string | null;
  themeDescription?: string | null;
}

export function ContestHeader({
  contestId,
  contestNumber,
  endDate,
  status,
  contestType,
  theme,
  themeDescription,
}: ContestHeaderProps) {
  const typeLabel = contestType === "photo" ? "Photo Contest" : "AI Art Contest";
  const basePath = contestType === "photo" ? "/contests/photo" : "/contests/ai-art";

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
      {/* Left: eyebrow + title + theme */}
      <div>
        <div
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "11px",
            letterSpacing: "0.2em",
            color: "var(--color-text-muted)",
            marginBottom: "8px",
            textTransform: "uppercase",
          }}
        >
          {typeLabel} &middot; Contest #{contestNumber} &middot;{" "}
          {status === "active" ? "Open for voting" : "Archived"}
        </div>

        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "clamp(2rem, 5vw, 3rem)",
            letterSpacing: "-0.03em",
            color: "var(--color-text)",
            lineHeight: 1.05,
            margin: "0 0 12px",
          }}
        >
          {theme ? theme : `The Arena — Contest #${contestNumber}`}
        </h1>

        {/* Theme badge + description */}
        {theme && (
          <div style={{ marginBottom: "12px" }}>
            <ThemeBadge theme={theme} />
            {themeDescription && (
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--color-text-muted)",
                  lineHeight: 1.55,
                  margin: "8px 0 0",
                  maxWidth: "480px",
                }}
              >
                {themeDescription}
              </p>
            )}
          </div>
        )}

        {/* Photo contest submit CTA */}
        {contestType === "photo" && status === "active" && (
          <Link
            href={`${basePath}/${contestId}/submit`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "8px",
              padding: "8px 16px",
              background: "var(--color-purple-dim)",
              border: "1px solid rgba(139,92,246,0.35)",
              borderRadius: "100px",
              color: "var(--color-purple-light)",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            Submit your photo →
          </Link>
        )}
      </div>

      {/* Right: timer */}
      {status === "active" && (
        <div>
          <div
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "10px",
              letterSpacing: "0.15em",
              color: "var(--color-text-muted)",
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
