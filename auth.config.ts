import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    // Runs in Edge middleware — must map token.role onto session so the
    // authorized() callback below can read it.
    jwt({ token, user }) {
      if (user) {
        token.role = ((user as { role?: string }).role ?? "user") as "user" | "admin";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as "user" | "admin") ?? "user";
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");

      if (isOnAdmin) {
        const isAdmin = auth?.user?.role === "admin";
        if (isAdmin) return true;
        const isLoggedIn = !!auth?.user;
        return isLoggedIn
          ? Response.redirect(new URL("/", nextUrl))
          : false;
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
