import { createPublicClient } from "@/lib/supabase/server";
import { ArchiveCard } from "@/components/archive/ArchiveCard";
import { Contest, Artwork } from "@/lib/types";

export const revalidate = 3600;

export const metadata = {
  title: "Archive — AI Art Arena",
  description: "Browse past AI Art Arena contests and their winning artworks.",
  alternates: { canonical: "https://olliedoesis.dev/archive" },
  openGraph: {
    title: "Archive — AI Art Arena",
    description: "Browse past AI Art Arena contests and their winning artworks.",
    url: "https://olliedoesis.dev/archive",
    siteName: "AI Art Arena",
    images: [{ url: "https://olliedoesis.dev/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Archive — AI Art Arena",
    description: "Browse past AI Art Arena contests and their winning artworks.",
    images: ["https://olliedoesis.dev/og-image.png"],
  },
};

export default async function ArchivePage() {
  const supabase = createPublicClient();

  const { data: contests } = await supabase
    .from("contests")
    .select("id, week_number, start_date, end_date, status, artwork_count, created_at, updated_at, artworks(id, image_url, title, vote_count, contest_id, prompt, created_at, updated_at)")
    .eq("status", "archived")
    .order("week_number", { ascending: false });

  return (
    <div className="animate-page" style={{ paddingTop: "48px", paddingBottom: "80px" }}>
      <div className="shell">
        <p
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#a78bfa",
            marginBottom: "16px",
          }}
        >
          Hall of fame
        </p>
        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "clamp(2rem, 5vw, 3rem)",
            letterSpacing: "-0.03em",
            color: "#eeeeff",
            marginBottom: "48px",
          }}
        >
          Contest Archive
        </h1>

        {!contests || contests.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              background: "#111119",
              border: "1px solid rgba(139,92,246,0.12)",
              borderRadius: "14px",
            }}
          >
            <p style={{ fontSize: "0.875rem", color: "#7878a0" }}>
              No archived contests yet. Check back after the first contest ends.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            {(contests as Array<Contest & { artworks: Artwork[] }>).map((contest) => (
              <ArchiveCard key={contest.id} contest={contest} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
