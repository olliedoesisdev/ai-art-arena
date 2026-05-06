import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");

      if (isOnAdmin) {
        const isAdmin = auth?.user?.role === "admin";
        if (isAdmin) return true;
        // Not logged in → redirect to signin; logged in but not admin → 403-ish redirect to home
        const isLoggedIn = !!auth?.user;
        return isLoggedIn
          ? Response.redirect(new URL("/", nextUrl))
          : false;
      }

      return true;
    },
  },
  providers: [], // Add providers in auth.ts
} satisfies NextAuthConfig;
