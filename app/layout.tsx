import type { Metadata } from "next";
import { Syne, DM_Mono } from "next/font/google";
import { headers } from "next/headers";
import { SITE_URL } from "@/lib/site";
import { Toaster } from "sonner";
import Script from "next/script";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NoiseOrbs } from "@/components/layout/NoiseOrbs";
import { Providers } from "@/components/layout/Providers";
import { ChatWidget } from "@/components/chat/ChatWidget";
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
  metadataBase: new URL(SITE_URL),
  authors: [{ name: "Oliver White" }],
  openGraph: {
    siteName: "AI Art Arena",
    locale: "en_US",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en" className={`${syne.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <head>
        {nonce && <meta name="next-nonce" content={nonce} />}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        )}
      </head>
      <body>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
              nonce={nonce}
            />
            <Script id="google-analytics" strategy="afterInteractive" nonce={nonce}>
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        <Providers>
          <NoiseOrbs />
          <Header />
          <main style={{ position: "relative", zIndex: 1 }}>{children}</main>
          <Footer />
          <ChatWidget />
          <Toaster
            position="top-right"
            richColors
            toastOptions={{
              style: {
                background: "var(--color-bg-surface)",
                border: "1px solid var(--color-border-mid)",
                color: "var(--color-text)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
