// app/contests/photo/archive/page.tsx [SERVER]
import { createPublicClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";
import { ArchiveCard } from "@/components/archive/ArchiveCard";
import { Contest, Artwork } from "@/lib/types";
import { Metadata } from "next";
import Link from "next/link";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Photo Archive — AI Art Arena",
  description: "Browse past photo voting contests and their winning photographs.",
  alternates: { canonical: `${SITE_URL}/contests/photo/archive` },
  openGraph: {
    title: "Photo Archive — AI Art Arena",
    description: "Browse past photo voting contests and their winning photographs.",
    url: `${SITE_URL}/contests/photo/archive`,
    siteName: "AI Art Arena",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "AI Art Arena photo archive" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Photo Archive — AI Art Arena",
    description: "Browse past photo voting contests and their winning photographs.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default async function PhotoArchivePage() {
  const supabase = createPublicClient();

  const { data: contests } = await supabase
    .from("contests")
    .select("id, contest_number, start_date, end_date, status, contest_type, theme, artwork_count, created_at, updated_at, artworks(id, image_url, title, vote_count, contest_id, prompt, created_at, updated_at)")
    .eq("status", "archived")
    .eq("contest_type", "photo")
    .order("end_date", { ascending: false });

  return (
    <div className="animate-page" style={{ paddingTop: "48px", paddingBottom: "80px" }}>
      <div className="shell">
        <Link
          href="/contests"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.8125rem", color: "var(--color-text-muted)", textDecoration: "none", marginBottom: "32px" }}
        >
          ← Contests
        </Link>

        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-purple-light)", marginBottom: "16px" }}>
          Hall of fame
        </p>
        <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.03em", color: "var(--color-text)", marginBottom: "12px" }}>
          Photo Archive
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "15px", margin: "0 0 48px" }}>
          Every past photo contest, final votes, and winner on record.
        </p>

        {!contests || contests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: "14px" }}>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
              No archived photo contests yet.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
            {(contests as Array<Contest & { artworks: Artwork[] }>).map((contest, index) => (
              <ArchiveCard key={contest.id} contest={contest} priority={index < 2} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
