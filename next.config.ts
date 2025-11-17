import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add Turbopack config to silence the warning about multiple lockfiles
  // Set root to project root so Turbopack knows where to resolve from
  turbopack: {
    root: "./",
  },

  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Enable experimental features
  experimental: {
    optimizePackageImports: ["lucide-react"],
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Production optimizations
  poweredByHeader: false,
  compress: true,

  // Disable source maps in development to fix parsing errors
  productionBrowserSourceMaps: false,
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = false;
    }
    return config;
  },

  // Environment variables that should be available in the browser
  env: {
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://olliedoesis.dev"
        : "http://localhost:3000"),
  },
};

export default nextConfig;
