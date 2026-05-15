import { createPublicClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";
import { ArchiveCard } from "@/components/archive/ArchiveCard";
import { JsonLd } from "@/components/layout/JsonLd";
import { Contest, Artwork } from "@/lib/types";

export const revalidate = 3600;

export const metadata = {
  title: "Archive — AI Art Arena",
  description: "Browse past AI Art Arena contests and their winning artworks.",
  alternates: { canonical: `${SITE_URL}/archive` },
  openGraph: {
    title: "Archive — AI Art Arena",
    description: "Browse past AI Art Arena contests and their winning artworks.",
    url: `${SITE_URL}/archive`,
    siteName: "AI Art Arena",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "AI Art Arena contest archive" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Archive — AI Art Arena",
    description: "Browse past AI Art Arena contests and their winning artworks.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default async function ArchivePage() {
  const supabase = createPublicClient();

  const { data: contests } = await supabase
    .from("contests")
    .select("id, week_number, start_date, end_date, status, artwork_count, created_at, updated_at, artworks(id, image_url, title, vote_count, contest_id, prompt, created_at, updated_at)")
    .eq("status", "archived")
    .order("week_number", { ascending: false });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AI Art Arena — Contest Archive",
    description: "Every past daily AI art voting contest, final standings, and winner on record.",
    url: `${SITE_URL}/archive`,
    isPartOf: { "@type": "WebSite", name: "AI Art Arena", url: SITE_URL },
    ...(contests && contests.length > 0 ? {
      hasPart: contests.map((c) => ({
        "@type": "Event",
        name: `AI Art Arena — Day ${c.week_number}`,
        url: `${SITE_URL}/archive/${c.week_number}`,
        startDate: c.start_date,
        endDate: c.end_date,
        eventStatus: "https://schema.org/EventEnded",
        eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      })),
    } : {}),
  };

  return (
    <div className="animate-page" style={{ paddingTop: "48px", paddingBottom: "80px" }}>
      <div className="shell">
        <JsonLd data={jsonLd} />
        <p
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-purple-light)",
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
            color: "var(--color-text)",
            marginBottom: "12px",
          }}
        >
          Contest Archive
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "15px", margin: "0 0 48px" }}>
          Every past contest, final votes, and winner on record.
        </p>

        {!contests || contests.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              background: "var(--color-bg-surface)",
              border: "1px solid rgba(139,92,246,0.12)",
              borderRadius: "14px",
            }}
          >
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
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
            {(contests as Array<Contest & { artworks: Artwork[] }>).map((contest, index) => (
              <ArchiveCard key={contest.id} contest={contest} priority={index < 2} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
