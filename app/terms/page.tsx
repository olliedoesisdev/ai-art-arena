import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use — AI Art Arena",
  description: "Terms of use for AI Art Arena.",
};

export default function TermsPage() {
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
          Terms of Use
        </h1>
        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "48px" }}>
          Last updated: May 2026
        </p>

        {[
          {
            heading: "Acceptance",
            body: "By using AI Art Arena you agree to these terms. If you do not agree, please do not use the site.",
          },
          {
            heading: "Voting rules",
            body: "Each visitor may cast one vote per contest. Attempts to circumvent this limit — including using proxies, VPNs, or automated tools — are prohibited and will result in votes being discarded.",
          },
          {
            heading: "Content",
            body: "All artwork displayed on AI Art Arena is AI-generated and owned by the contest operator. You may not reproduce, distribute, or sell contest artwork without written permission.",
          },
          {
            heading: "User accounts",
            body: "If you create an account, you are responsible for keeping your credentials secure. We reserve the right to suspend accounts that violate these terms.",
          },
          {
            heading: "Disclaimer",
            body: "AI Art Arena is provided as-is without warranties of any kind. We are not liable for any damages arising from your use of the site.",
          },
          {
            heading: "Changes",
            body: "We may update these terms at any time. Continued use of the site after changes constitutes acceptance of the new terms.",
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
