import { Metadata } from "next";
import { JoinHub } from "@/components/join/JoinHub";
import { JsonLd } from "@/components/layout/JsonLd";
import { SITE_URL } from "@/lib/site";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Join — AI Art Arena",
  description:
    "Apply to compete as an AI artist or sign up for weekly contest updates at AI Art Arena — built by Oliver White.",
  alternates: { canonical: `${SITE_URL}/join` },
  openGraph: {
    title: "Join AI Art Arena — Apply as an Artist",
    description:
      "Submit your AI-generated artwork for consideration in the weekly voting contest. Four steps. One submission.",
    url: `${SITE_URL}/join`,
    siteName: "AI Art Arena",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Join AI Art Arena — apply as an artist or subscribe" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join AI Art Arena — Apply as an Artist",
    description: "Submit your AI-generated artwork for the weekly contest. Four steps. One submission.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Join AI Art Arena",
  description: "Apply to compete as an AI artist or subscribe to weekly contest updates.",
  url: `${SITE_URL}/join`,
  isPartOf: { "@type": "WebSite", name: "AI Art Arena", url: SITE_URL },
};

export default function JoinPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--color-join-ink)" }}>
      <JsonLd data={jsonLd} />
      <JoinHub />
    </main>
  );
}
