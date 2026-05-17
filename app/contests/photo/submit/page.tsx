// app/contests/photo/submit/page.tsx [SERVER]
import { createClient } from "@/lib/supabase/server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import Link from "next/link";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Submit a Photo — AI Art Arena",
  description: "Sign in and submit a photo to an active photo contest. Submissions are reviewed before going live.",
  alternates: { canonical: `${SITE_URL}/contests/photo/submit` },
  robots: { index: false, follow: true },
};

export default async function PhotoSubmitLandingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/contests/photo/submit");
  }

  const supabase = await createClient();

  const { data: activeContests } = await supabase
    .from("contests")
    .select("id, week_number, theme, theme_description, end_date")
    .eq("status", "active")
    .eq("contest_type", "photo")
    .order("end_date", { ascending: true });

  return (
    <div className="animate-page" style={{ paddingTop: "48px", paddingBottom: "80px" }}>
      <div className="shell" style={{ maxWidth: "640px" }}>

        <Link
          href="/contests"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.8125rem",
            color: "var(--color-text-muted)",
            textDecoration: "none",
            marginBottom: "40px",
          }}
        >
          ← All contests
        </Link>

        <p style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--color-purple-light)",
          fontFamily: "var(--font-dm-mono)",
          marginBottom: "12px",
        }}>
          Photo contest
        </p>

        <h1 style={{
          fontFamily: "var(--font-syne)",
          fontWeight: 800,
          fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
          letterSpacing: "-0.03em",
          color: "var(--color-text)",
          margin: "0 0 12px",
          lineHeight: 1.1,
        }}>
          Submit your photo
        </h1>

        <p style={{
          fontSize: "0.9375rem",
          color: "var(--color-text-muted)",
          lineHeight: 1.65,
          margin: "0 0 40px",
        }}>
          Pick an active contest below and upload your photo. All submissions are reviewed before going live.
        </p>

        {!activeContests || activeContests.length === 0 ? (
          <div
            style={{
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "14px",
              padding: "48px 32px",
              textAlign: "center",
            }}
          >
            <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-purple-light)", marginBottom: "10px" }}>
              No active contests
            </p>
            <p style={{ fontSize: "0.9375rem", color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: "24px" }}>
              There are no open photo contests right now. Check back soon.
            </p>
            <Link
              href="/contests"
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--color-purple-light)",
                textDecoration: "none",
                letterSpacing: "0.04em",
              }}
            >
              Browse all contests &rarr;
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {activeContests.map((contest) => {
              const endsAt = new Date(contest.end_date);
              const daysLeft = Math.ceil((endsAt.getTime() - Date.now()) / 86400000);
              const contestTitle = contest.theme ?? `Photo Contest — Day ${contest.week_number}`;

              return (
                <Link
                  key={contest.id}
                  href={`/contests/photo/${contest.id}/submit`}
                  style={{ textDecoration: "none" }}
                >
                  <div className="photo-contest-card" style={{
                      background: "var(--color-bg-surface)",
                      border: "1px solid var(--color-border-subtle)",
                      borderRadius: "12px",
                      padding: "24px 28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      transition: "border-color 0.15s",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-purple-light)", marginBottom: "6px" }}>
                        Day {contest.week_number}
                      </p>
                      <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text)", letterSpacing: "-0.02em", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {contestTitle}
                      </h2>
                      {contest.theme_description && (
                        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {contest.theme_description}
                        </p>
                      )}
                    </div>
                    <div style={{ flexShrink: 0, textAlign: "right" }}>
                      <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "8px" }}>
                        {daysLeft > 0 ? `${daysLeft}d left` : "Closing soon"}
                      </p>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "7px 16px",
                          background: "var(--color-purple-dim)",
                          border: "1px solid rgba(139,92,246,0.3)",
                          borderRadius: "100px",
                          color: "var(--color-purple-light)",
                          fontFamily: "var(--font-dm-mono)",
                          fontSize: "11px",
                          fontWeight: 600,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Submit here &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
