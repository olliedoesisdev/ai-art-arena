import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

function applySecurityHeaders(response: NextResponse, isDev: boolean) {
  const csp = isDev
    ? [
        "default-src 'self'",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co ws://localhost:* http://localhost:*",
        "img-src 'self' https://*.supabase.co https://picsum.photos https://fastly.picsum.photos https://images.unsplash.com data: blob:",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "font-src 'self' https://fonts.gstatic.com",
      ].join("; ")
    : [
        "default-src 'self'",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
        "img-src 'self' https://*.supabase.co data: blob:",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "font-src 'self' https://fonts.gstatic.com",
      ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (!isDev) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }
}

export default async function middleware(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";
  const { pathname } = request.nextUrl;

  // Admin routes: run auth check — this will set cookies and disable CDN caching,
  // which is acceptable since admin pages must never be cached anyway.
  if (pathname.startsWith("/admin")) {
    const authMiddleware = auth((_req) => {
      const response = NextResponse.next();
      applySecurityHeaders(response, isDev);
      return response;
    });
    return authMiddleware(request, {} as never);
  }

  // All other routes: security headers only, no auth check.
  const response = NextResponse.next();
  applySecurityHeaders(response, isDev);

  // Vercel strips ISR cache headers from middleware responses by default.
  // Restore them explicitly so the CDN edge caches public pages correctly.
  // These values mirror the revalidate exports on each page.
  if (!isDev) {
    if (pathname === "/" || pathname.startsWith("/contest/")) {
      response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=600");
    } else if (pathname.startsWith("/archive") || pathname === "/about" || pathname === "/privacy" || pathname === "/terms") {
      response.headers.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    } else if (pathname === "/leaderboard") {
      response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
