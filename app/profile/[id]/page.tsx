import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { createClient } from "@/lib/supabase/server";
import { getFullProfilePageData } from "@/lib/data/profiles";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ActivityFeed } from "@/components/profile/ActivityFeed";
import { SITE_URL } from "@/lib/site";
import Link from "next/link";

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
    activityFeed.filter((a) => a.activity_type === "vote").map((a) => a.contest_number)
  ).size;

  let photoContests: Array<{ id: string; contest_number: number; theme: string | null; theme_description: string | null; end_date: string; start_date: string }> = [];
  let mySubmissions: Array<{ contest_id: string; status: string }> = [];

  if (isOwnProfile && session?.user?.id) {
    const supabase = await createClient();
    const [{ data: contests }, { data: subs }] = await Promise.all([
      supabase
        .from("contests")
        .select("id, contest_number, theme, theme_description, end_date, start_date")
        .eq("status", "upcoming")
        .eq("contest_type", "photo")
        .order("start_date", { ascending: true }),
      supabase
        .from("submissions")
        .select("contest_id, status")
        .eq("user_id", session.user.id),
    ]);
    photoContests = contests ?? [];
    mySubmissions = subs ?? [];
  }

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

        {/* Photo submission panel — own profile only */}
        {isOwnProfile && (
          <div style={{ marginTop: "48px" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "20px", gap: "12px" }}>
              <div>
                <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-purple-light)", marginBottom: "4px" }}>
                  Photo contest
                </p>
                <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.25rem", color: "var(--color-text)", letterSpacing: "-0.02em", margin: 0 }}>
                  Submit your photos
                </h2>
              </div>
              {photoContests.length > 0 && (
                <Link
                  href="/contests/photo/submit"
                  style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", fontWeight: 600, color: "var(--color-purple-light)", textDecoration: "none", letterSpacing: "0.06em", whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  All contests &rarr;
                </Link>
              )}
            </div>

            {photoContests.length === 0 ? (
              <div
                style={{
                  background: "var(--color-bg-surface)",
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: "12px",
                  padding: "32px 28px",
                  textAlign: "center",
                }}
              >
                <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-purple-light)", marginBottom: "8px" }}>
                  No open contests
                </p>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: 1.6, margin: 0 }}>
                  There are no active photo contests right now. Check back soon.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {photoContests.map((contest) => {
                  const submission = mySubmissions.find((s) => s.contest_id === contest.id);
                  const startsAt = new Date(contest.start_date);
                  const msUntilVoting = startsAt.getTime() - new Date().getTime();
                  const daysUntilVoting = Math.ceil(msUntilVoting / 86400000);
                  const votingLabel = daysUntilVoting > 0 ? `Voting opens in ${daysUntilVoting}d` : "Voting opens soon";
                  const contestTitle = contest.theme ?? `Photo Contest #${contest.contest_number}`;

                  const statusColors: Record<string, { text: string; bg: string; border: string }> = {
                    pending: { text: "var(--color-status-warning)", bg: "var(--color-status-warningDim)", border: "rgba(251,191,36,0.25)" },
                    approved: { text: "var(--color-status-success)", bg: "var(--color-status-successDim)", border: "rgba(52,211,153,0.25)" },
                    rejected: { text: "var(--color-status-error)", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)" },
                  };

                  return (
                    <div
                      key={contest.id}
                      style={{
                        background: "var(--color-bg-surface)",
                        border: "1px solid var(--color-border-subtle)",
                        borderRadius: "12px",
                        padding: "20px 24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-purple-light)", marginBottom: "4px" }}>
                          Contest #{contest.contest_number} &middot; {votingLabel}
                        </p>
                        <p style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1rem", color: "var(--color-text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {contestTitle}
                        </p>
                      </div>

                      {submission ? (
                        <span
                          style={{
                            padding: "5px 12px",
                            background: statusColors[submission.status]?.bg ?? "var(--color-bg-surface2)",
                            border: `1px solid ${statusColors[submission.status]?.border ?? "var(--color-border-subtle)"}`,
                            borderRadius: "100px",
                            fontFamily: "var(--font-dm-mono)",
                            fontSize: "10px",
                            fontWeight: 600,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: statusColors[submission.status]?.text ?? "var(--color-text-muted)",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}
                        >
                          {submission.status === "pending" ? "In review" : submission.status === "approved" ? "Approved" : "Not accepted"}
                        </span>
                      ) : (
                        <Link
                          href={`/contests/photo/${contest.id}/submit`}
                          style={{
                            padding: "8px 18px",
                            background: "var(--color-purple-dim)",
                            border: "1px solid rgba(139,92,246,0.3)",
                            borderRadius: "100px",
                            color: "var(--color-purple-light)",
                            fontFamily: "var(--font-dm-mono)",
                            fontSize: "11px",
                            fontWeight: 600,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}
                        >
                          Submit &rarr;
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

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
