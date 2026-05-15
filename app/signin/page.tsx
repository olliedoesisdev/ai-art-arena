import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/layout/JsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — AI Art Arena",
  description: "Sign in or create a free account to vote on AI-generated artwork at AI Art Arena, built by Oliver White.",
  alternates: { canonical: `${SITE_URL}/signin` },
  openGraph: {
    title: "Sign In — AI Art Arena",
    description: "Sign in or create a free account to vote on AI-generated artwork.",
    url: `${SITE_URL}/signin`,
    siteName: "AI Art Arena",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "AI Art Arena — sign in" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In — AI Art Arena",
    description: "Sign in or create a free account to vote on AI-generated artwork.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

export const revalidate = 0;

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; tab?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  if (session?.user) {
    if (params.callbackUrl) {
      redirect(params.callbackUrl);
    } else if (session.user.role === "admin") {
      redirect("/admin");
    } else {
      redirect("/");
    }
  }

  const callbackUrl = params.callbackUrl || "/";
  const defaultTab = params.tab === "signup" ? "signup" : "signin";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Sign In — AI Art Arena",
    description: "Sign in or create a free account to vote on AI-generated artwork at AI Art Arena.",
    url: `${SITE_URL}/signin`,
    isPartOf: { "@type": "WebSite", name: "AI Art Arena", url: SITE_URL },
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      <JsonLd data={jsonLd} />
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 800,
              fontSize: "1.5rem",
              color: "var(--color-text)",
              letterSpacing: "-0.03em",
              marginBottom: "8px",
            }}
          >
            AI Art Arena
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>
            Vote on AI-generated artwork
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            Built by{" "}
            <a href="/about" style={{ color: "var(--color-purple-light)", textDecoration: "none" }}>
              Oliver White
            </a>
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--color-bg-surface)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: "14px",
            padding: "32px",
          }}
        >
          <AuthForm callbackUrl={callbackUrl} defaultTab={defaultTab} />
        </div>
      </div>
    </div>
  );
}
