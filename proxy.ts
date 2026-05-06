import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth(function middleware(_request: NextRequest) {
  const response = NextResponse.next();
  const isDev = process.env.NODE_ENV === "development";

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

  return response;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
