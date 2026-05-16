import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-ELG6RW124G",
  },
  serverExternalPackages: ["pino", "pino-pretty"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // GitHub avatars — for auth user profile images
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },
};

export default withSentryConfig(nextConfig, {
  org: "olliedoesisdev",
  project: "ai-art-arena",

  // Only upload source maps in CI/production — skip locally
  silent: !process.env.CI,

  // Disable source map upload unless SENTRY_AUTH_TOKEN is set
  // This prevents build failures when the token isn't present
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },

  // Tree-shake Sentry debug code from client bundle
  disableLogger: true,

  // Auto-instrument Next.js server actions and API routes
  autoInstrumentServerFunctions: true,
  autoInstrumentMiddleware: false,

  // Tunnel browser errors through /monitoring to bypass ad blockers
  tunnelRoute: "/monitoring",
});
