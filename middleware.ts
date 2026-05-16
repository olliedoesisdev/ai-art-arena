import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";

export default auth((req: NextAuthRequest) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const session = req.auth;
    if (!session) {
      const signInUrl = req.nextUrl.clone();
      signInUrl.pathname = "/signin";
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
    if ((session.user as { role?: string })?.role !== "admin") {
      const homeUrl = req.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.searchParams.delete("callbackUrl");
      return NextResponse.redirect(homeUrl);
    }
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const res = NextResponse.next({
    request: { headers: new Headers(req.headers) },
  });
  res.headers.set("x-nonce", nonce);
  return applySecurityHeaders(res, nonce);
});

function applySecurityHeaders(response: NextResponse, nonce: string): NextResponse {
  const h = response.headers;

  h.set("X-Frame-Options", "DENY");
  h.set("X-Content-Type-Options", "nosniff");
  h.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  h.set("Referrer-Policy", "strict-origin-when-cross-origin");
  h.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");

  const scriptSrc = process.env.NODE_ENV === "development"
    ? `'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com`
    : `'nonce-${nonce}' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com`;

  h.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      `script-src 'self' ${scriptSrc}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co https://avatars.githubusercontent.com https://www.googletagmanager.com https://www.google-analytics.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co https://*.upstash.io https://o4511291575762944.ingest.us.sentry.io https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );

  return response;
}

export const config = {
  matcher: [
    // All routes except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)",
  ],
};
