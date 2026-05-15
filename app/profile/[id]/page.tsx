import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getFullProfilePageData } from "@/lib/data/profiles";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ActivityFeed } from "@/components/profile/ActivityFeed";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const session = await auth();
  const data = await getFullProfilePageData(id, session?.user?.id ?? null);

  if (!data) return { title: "Profile not found — AI Art Arena" };

  const name = data.profile.display_name || "Arena Member";
  const description = data.profile.bio || `${name} votes and comments on AI Art Arena.`;
  return {
    title: `${name} — AI Art Arena`,
    description,
    alternates: { canonical: `${SITE_URL}/profile/${id}` },
    robots: { index: false, follow: false },
    openGraph: {
      title: `${name} — AI Art Arena`,
      description,
      url: `${SITE_URL}/profile/${id}`,
      siteName: "AI Art Arena",
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: `${name}'s profile on AI Art Arena` }],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — AI Art Arena`,
      description,
      images: [`${SITE_URL}/og-image.png`],
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const data = await getFullProfilePageData(id, session?.user?.id ?? null);

  if (!data) notFound();

  const { profile, activityFeed, totalVotes, totalComments, isOwnProfile } = data;
  const weeksActive = new Set(
    activityFeed.filter((a) => a.activity_type === "vote").map((a) => a.contest_week)
  ).size;

  return (
    <div className="animate-page" style={{ paddingTop: "48px", paddingBottom: "80px" }}>
      <div className="shell">
        <ProfileHeader
          profile={profile}
          isOwnProfile={isOwnProfile}
          totalVotes={totalVotes}
          totalComments={totalComments}
          weeksActive={weeksActive}
        />
        <ActivityFeed
          activityFeed={activityFeed}
          totalVotes={totalVotes}
          totalComments={totalComments}
        />

        {/* CTA strip */}
        <div
          style={{
            marginTop: "64px",
            background: "var(--color-bg-surface)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: "12px",
            padding: "28px 32px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <div>
            <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "1.125rem", fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.02em", margin: "0 0 4px" }}>
              Want to compete?
            </h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "14px", margin: "0 0 6px" }}>
              Submit your AI artwork for the weekly contest.
            </p>
            <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "var(--color-text-muted)", margin: 0, letterSpacing: "0.04em" }}>
              Built by <a href="/about" style={{ color: "var(--color-purple-light)", textDecoration: "none" }}>Oliver White</a>
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a
              href="/join?track=subscriber"
              style={{
                padding: "10px 20px",
                background: "transparent",
                border: "1px solid rgba(232,213,183,0.4)",
                borderRadius: "6px",
                color: "var(--color-join-amber)",
                fontFamily: "var(--font-dm-mono)",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Subscribe
            </a>
            <a
              href="/join?track=artist"
              style={{
                padding: "10px 20px",
                background: "var(--color-join-amber)",
                borderRadius: "6px",
                color: "var(--color-join-ink)",
                fontFamily: "var(--font-dm-mono)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Apply as Artist
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
