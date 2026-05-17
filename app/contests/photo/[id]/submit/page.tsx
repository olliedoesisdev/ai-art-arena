// app/contests/photo/[id]/submit/page.tsx [SERVER]
import { createClient } from "@/lib/supabase/server";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { SubmissionForm } from "@/components/contest/SubmissionForm";
import { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import Link from "next/link";

export const revalidate = 0;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: contest } = await supabase
    .from("contests")
    .select("theme, contest_number")
    .eq("id", id)
    .single();

  const title = contest?.theme
    ? `Submit to ${contest.theme} — AI Art Arena`
    : `Submit to Photo Contest — AI Art Arena`;

  return {
    title,
    alternates: { canonical: `${SITE_URL}/contests/photo/${id}/submit` },
  };
}

export default async function PhotoSubmitPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/api/auth/signin?callbackUrl=/contests/photo/${id}/submit`);
  }

  const supabase = await createClient();

  const { data: contest, error } = await supabase
    .from("contests")
    .select("id, contest_number, status, contest_type, theme, theme_description, max_submissions")
    .eq("id", id)
    .single();

  if (error || !contest) notFound();

  if (contest.contest_type !== "photo") {
    return (
      <div style={{ paddingTop: "80px", paddingBottom: "80px", textAlign: "center" }}>
        <div className="shell">
          <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "2rem", color: "var(--color-text)", marginBottom: "12px" }}>
            Not a photo contest
          </h1>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "24px" }}>This contest does not accept photo submissions.</p>
          <Link href="/contests" style={{ color: "var(--color-purple-light)", textDecoration: "none" }}>Back to contests</Link>
        </div>
      </div>
    );
  }

  // Submissions only accepted during the upcoming phase
  if (contest.status === "archived") {
    return (
      <div style={{ paddingTop: "80px", paddingBottom: "80px", textAlign: "center" }}>
        <div className="shell">
          <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "2rem", color: "var(--color-text)", marginBottom: "12px" }}>
            Contest closed
          </h1>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "24px" }}>This contest has ended — submissions are no longer accepted.</p>
          <Link href="/contests" style={{ color: "var(--color-purple-light)", textDecoration: "none" }}>Browse contests</Link>
        </div>
      </div>
    );
  }

  if (contest.status === "active") {
    return (
      <div style={{ paddingTop: "80px", paddingBottom: "80px", textAlign: "center" }}>
        <div className="shell">
          <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "2rem", color: "var(--color-text)", marginBottom: "12px" }}>
            Voting is live
          </h1>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "24px" }}>This contest is now open for voting — submissions are closed.</p>
          <Link href={`/contests/photo/${id}`} style={{ color: "var(--color-purple-light)", textDecoration: "none" }}>Go vote &rarr;</Link>
        </div>
      </div>
    );
  }

  // Check for existing submission
  const { data: existing } = await supabase
    .from("submissions")
    .select("id, status")
    .eq("contest_id", id)
    .eq("user_id", session.user.id)
    .single();

  if (existing) {
    const statusLabel: Record<string, string> = {
      pending: "pending review",
      approved: "approved and live",
      rejected: "not accepted",
    };
    return (
      <div className="animate-page" style={{ paddingTop: "48px", paddingBottom: "80px" }}>
        <div className="shell" style={{ maxWidth: "640px" }}>
          <Link
            href={`/contests/photo/${id}`}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.8125rem", color: "var(--color-text-muted)", textDecoration: "none", marginBottom: "32px" }}
          >
            ← Back to contest
          </Link>
          <div
            style={{
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "14px",
              padding: "40px 32px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-purple-light)", marginBottom: "12px" }}>
              Already submitted
            </p>
            <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.5rem", color: "var(--color-text)", marginBottom: "10px" }}>
              You have a submission
            </h1>
            <p style={{ fontSize: "0.9375rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              Your entry is currently{" "}
              <strong style={{ color: "var(--color-text)" }}>
                {statusLabel[existing.status] ?? existing.status}
              </strong>
              . Only one submission is allowed per contest.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const contestTitle = contest.theme ?? `Photo Contest #${contest.contest_number}`;

  return (
    <div className="animate-page" style={{ paddingTop: "48px", paddingBottom: "80px" }}>
      <div className="shell" style={{ maxWidth: "640px" }}>
        <Link
          href={`/contests/photo/${id}`}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.8125rem", color: "var(--color-text-muted)", textDecoration: "none", marginBottom: "32px" }}
        >
          ← Back to contest
        </Link>

        <SubmissionForm
          contestId={contest.id}
          contestTitle={contestTitle}
          theme={contest.theme}
          themeDescription={contest.theme_description}
        />
      </div>
    </div>
  );
}
