import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/Header";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI Art Arena - Weekly AI Art Voting Contest",
  description:
    "Vote on stunning AI-generated artwork every week. Discover amazing AI art and help crown the weekly champion.",
  keywords: ["AI art", "voting contest", "AI generated art", "weekly contest"],
  authors: [{ name: "Oliver" }],
  openGraph: {
    title: "AI Art Arena - Weekly AI Art Voting Contest",
    description: "Vote on stunning AI-generated artwork every week",
    url: "https://olliedoesis.dev",
    siteName: "AI Art Arena",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Art Arena",
    description: "Vote on stunning AI-generated artwork every week",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <Header />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
