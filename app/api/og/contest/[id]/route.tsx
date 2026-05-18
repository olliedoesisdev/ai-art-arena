import { ImageResponse } from "next/og";
import { createPublicClient } from "@/lib/supabase/server";

export const runtime = "edge";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = createPublicClient();

  const { data: contest } = await supabase
    .from("contests")
    .select(
      "contest_number, theme, contest_type, end_date, artworks(id, title, image_url, vote_count)"
    )
    .eq("id", id)
    .eq("status", "archived")
    .single();

  if (!contest) {
    return new Response("Not found", { status: 404 });
  }

  const artworks = (
    contest.artworks as Array<{
      id: string;
      title: string;
      image_url: string;
      vote_count: number;
    }>
  )
    .slice()
    .sort((a, b) => b.vote_count - a.vote_count);

  const winner = artworks[0] ?? null;
  const totalVotes = artworks.reduce((s, a) => s + a.vote_count, 0);
  const pct =
    winner && totalVotes > 0
      ? Math.round((winner.vote_count / totalVotes) * 100)
      : 0;

  const typeLabel =
    contest.contest_type === "photo" ? "Photo Contest" : "AI Art Contest";
  const contestLabel = contest.theme
    ? `${typeLabel} — ${contest.theme}`
    : `${typeLabel} #${contest.contest_number}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          background: "#08080e",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Purple orb top-left */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            left: "-80px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        {/* Purple orb bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "-60px",
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Winner image — left half */}
        {winner ? (
          <div
            style={{
              width: "560px",
              height: "630px",
              flexShrink: 0,
              position: "relative",
              display: "flex",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={winner.image_url}
              alt={winner.title}
              style={{
                width: "560px",
                height: "630px",
                objectFit: "cover",
              }}
            />
            {/* Gradient overlay to blend into right panel */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to right, transparent 60%, #08080e 100%)",
              }}
            />
            {/* Winner badge */}
            <div
              style={{
                position: "absolute",
                top: "24px",
                left: "24px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(251,191,36,0.15)",
                border: "1px solid rgba(251,191,36,0.4)",
                borderRadius: "100px",
                padding: "6px 14px",
              }}
            >
              <span style={{ fontSize: "14px" }}>★</span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#fbbf24",
                }}
              >
                Winner
              </span>
            </div>
          </div>
        ) : (
          <div
            style={{
              width: "560px",
              height: "630px",
              flexShrink: 0,
              background: "#111119",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "14px", color: "#3a3a58" }}>
              No artwork
            </span>
          </div>
        )}

        {/* Right panel */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "48px 52px 48px 40px",
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#a78bfa",
              marginBottom: "16px",
            }}
          >
            AI Art Arena
          </div>

          {/* Contest label */}
          <div
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "#7878a0",
              letterSpacing: "0.02em",
              marginBottom: "12px",
              lineHeight: 1.3,
            }}
          >
            {contestLabel}
          </div>

          {/* Winner title */}
          <div
            style={{
              fontSize: winner?.title && winner.title.length > 28 ? "28px" : "34px",
              fontWeight: 800,
              color: "#eeeeff",
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              marginBottom: "28px",
            }}
          >
            {winner?.title ?? "No winner yet"}
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: "28px",
              marginBottom: "32px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: 500,
                  color: "#eeeeff",
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.02em",
                }}
              >
                {winner?.vote_count.toLocaleString() ?? "0"}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#7878a0",
                }}
              >
                Votes
              </span>
            </div>
            <div
              style={{
                width: "1px",
                background: "rgba(139,92,246,0.2)",
                alignSelf: "stretch",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: 500,
                  color: "#eeeeff",
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.02em",
                }}
              >
                {pct}%
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#7878a0",
                }}
              >
                Share
              </span>
            </div>
            <div
              style={{
                width: "1px",
                background: "rgba(139,92,246,0.2)",
                alignSelf: "stretch",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: 500,
                  color: "#eeeeff",
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.02em",
                }}
              >
                {totalVotes.toLocaleString()}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#7878a0",
                }}
              >
                Total votes
              </span>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: "rgba(139,92,246,0.15)",
              marginBottom: "24px",
            }}
          />

          {/* Bottom brand line */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#8b5cf6",
              }}
            />
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#7878a0",
                letterSpacing: "0.04em",
              }}
            >
              olliedoesis.dev
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
