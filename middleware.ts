import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;
  const isDev = process.env.NODE_ENV === "development";

  // Security Headers
  const csp = isDev
    ? "default-src 'self'; connect-src 'self' https://*.supabase.co ws://localhost:* http://localhost:*; img-src 'self' https://*.supabase.co https://images.unsplash.com data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
    : "default-src 'self'; connect-src 'self' https://*.supabase.co; img-src 'self' https://*.supabase.co https://images.unsplash.com data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  if (!isDev) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
