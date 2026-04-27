import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@/lib/supabase/server";
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

        const supabase = await createClient();

        // Find user by email
        const { data: user } = await supabase
          .from("users")
          .select("id, email, name, avatar_url, password_hash, role")
          .eq("email", credentials.email as string)
          .single();

        if (!user || !user.password_hash) {
          return null;
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar_url,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        const supabase = await createClient();

        // Check if user exists
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", user.email!)
          .single();

        // If user doesn't exist, create them
        if (!existingUser) {
          await supabase.from("users").insert({
            id: user.id,
            email: user.email!,
            name: user.name || null,
            avatar_url: user.image || null,
            role: "user",
          });
        }
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;

        // Get user role from database
        const supabase = await createClient();
        const { data: user } = await supabase
          .from("users")
          .select("role")
          .eq("id", token.sub)
          .single();

        if (user) {
          session.user.role = user.role;
        }
      }

      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
});
