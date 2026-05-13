import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy â€” AI Art Arena",
  description: "How AI Art Arena handles your data.",
};

export default function PrivacyPage() {
  return (
    <div className="animate-page" style={{ paddingTop: "64px", paddingBottom: "100px" }}>
      <div className="shell" style={{ maxWidth: "720px" }}>
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
          Legal
        </p>
        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "clamp(2rem, 5vw, 3rem)",
            letterSpacing: "-0.03em",
            color: "var(--color-text)",
            marginBottom: "8px",
          }}
        >
          Privacy Policy
        </h1>
        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "48px" }}>
          Last updated: May 2026
        </p>

        {[
          {
            heading: "What we collect",
            body: "When you vote, we store a one-way hash of your IP address to enforce the one-vote-per-contest rule. If you sign in with GitHub, we store your GitHub username, email address, and avatar URL. We never store your raw IP address.",
          },
          {
            heading: "How we use it",
            body: "IP hashes are used solely to prevent duplicate votes and are never linked to any personally identifiable information. GitHub account details are used to personalise your experience and associate votes with your account instead of your IP hash.",
          },
          {
            heading: "Third-party services",
            body: "We use Supabase for database and file storage, Vercel for hosting, and Upstash for rate limiting. Each service has its own privacy policy. We do not sell or share your data with advertisers.",
          },
          {
            heading: "Cookies",
            body: "We use a session cookie issued by NextAuth to keep you signed in. No tracking or advertising cookies are set.",
          },
          {
            heading: "Data retention",
            body: "Vote records (IP hash + contest ID) are retained indefinitely as part of the contest history. If you delete your account, your user record is removed but anonymous vote records may remain.",
          },
          {
            heading: "Contact",
            body: "Questions? Email olliedoesis.dev@gmail.com.",
          },
        ].map(({ heading, body }) => (
          <section key={heading} style={{ marginBottom: "36px" }}>
            <h2
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 700,
                fontSize: "1.125rem",
                color: "var(--color-text)",
                marginBottom: "10px",
              }}
            >
              {heading}
            </h2>
            <p style={{ fontSize: "0.9375rem", color: "var(--color-text-muted)", lineHeight: 1.7 }}>{body}</p>
          </section>
        ))}

        <Link
          href="/"
          style={{ fontSize: "0.875rem", color: "var(--color-purple)", textDecoration: "none" }}
        >
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}
