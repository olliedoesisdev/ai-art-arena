import type { Metadata } from "next";
import { Syne, DM_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NoiseOrbs } from "@/components/layout/NoiseOrbs";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-syne",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: "AI Art Arena — Weekly AI Art Voting Contest",
  description:
    "Vote on stunning AI-generated artwork every week. Discover amazing AI art and help crown the weekly champion.",
  authors: [{ name: "Oliver" }],
  openGraph: {
    title: "AI Art Arena — Weekly AI Art Voting Contest",
    description: "Vote on stunning AI-generated artwork every week",
    url: "https://olliedoesis.dev",
    siteName: "AI Art Arena",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://olliedoesis.dev/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Art Arena — Weekly AI Art Voting Contest",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Art Arena",
    description: "Vote on stunning AI-generated artwork every week",
    images: ["https://olliedoesis.dev/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <body>
        <NoiseOrbs />
        <Header />
        <main style={{ position: "relative", zIndex: 1 }}>{children}</main>
        <Footer />
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              background: "#111119",
              border: "1px solid rgba(139,92,246,0.25)",
              color: "#eeeeff",
            },
          }}
        />
      </body>
    </html>
  );
}
