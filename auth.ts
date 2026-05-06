import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Service role bypasses RLS — authorize runs outside a user session
        const supabase = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: user } = await supabase
          .from("users")
          .select("id, email, name, avatar_url, password_hash, role")
          .eq("email", credentials.email as string)
          .single();

        if (!user || !user.password_hash) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );

        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar_url,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "github") {
        const supabase = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // ON CONFLICT prevents race condition on concurrent OAuth logins
        await supabase.from("users").upsert(
          {
            id: user.id,
            email: user.email!,
            name: user.name || null,
            avatar_url: user.image || null,
            role: "user",
          },
          { onConflict: "email", ignoreDuplicates: true }
        );
      }

      return true;
    },

    async jwt({ token, user }) {
      // On first sign-in `user` is populated — fetch DB row by email to get
      // the correct Supabase UUID and role for both GitHub and Credentials
      if (user?.email) {
        const supabase = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const { data } = await supabase
          .from("users")
          .select("id, role")
          .eq("email", user.email)
          .single();
        // Store in custom fields — never overwrite token.sub (NextAuth owns that)
        token.dbId = data?.id ?? user.id;
        token.role = data?.role ?? "user";
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.dbId as string) ?? token.sub ?? "";
        session.user.role = (token.role as "user" | "admin") ?? "user";
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
});
