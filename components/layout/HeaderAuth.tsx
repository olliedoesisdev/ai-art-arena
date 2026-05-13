"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function HeaderAuth() {
  const { data: session, status } = useSession();

  // Not yet resolved — render nothing to avoid layout shift
  if (status === "loading") return null;

  // Logged out — single "Sign in" link
  if (!session?.user) {
    return (
      <Link
        href="/signin"
        style={{
          fontSize: "0.8125rem",
          fontWeight: 500,
          color: "var(--color-text-muted)",
          textDecoration: "none",
          padding: "5px 12px",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: "100px",
          transition: "color 0.15s, border-color 0.15s",
          whiteSpace: "nowrap",
        }}
      >
        Sign in
      </Link>
    );
  }

  const isAdmin = session.user.role === "admin";
  const avatarSrc = session.user.image ?? null;
  const displayName = session.user.name ?? session.user.email ?? "User";
  const initial = displayName.charAt(0).toUpperCase();

  const Avatar = (
    <div
      style={{
        position: "relative",
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        overflow: "hidden",
        border: "2px solid rgba(139,92,246,0.3)",
        flexShrink: 0,
        background: "var(--color-bg-surface2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {avatarSrc ? (
        <Image src={avatarSrc} alt={displayName} fill sizes="28px" className="object-cover" />
      ) : (
        <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", fontWeight: 700, color: "var(--color-purple-light)" }}>
          {initial}
        </span>
      )}
    </div>
  );

  // Admin — avatar (links to profile) + Dashboard pill + sign out
  if (isAdmin) {
    return (
      <>
        <Link href="/profile/me" title="My Profile" style={{ display: "flex", textDecoration: "none" }}>
          {Avatar}
        </Link>
        <Link
          href="/admin"
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--color-purple-light)",
            textDecoration: "none",
            padding: "4px 10px",
            border: "1px solid rgba(139,92,246,0.3)",
            borderRadius: "100px",
            whiteSpace: "nowrap",
          }}
        >
          Dashboard
        </Link>
        <form action={() => signOut({ callbackUrl: "/" })}>
          <button
            type="submit"
            style={{
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "var(--color-text-muted)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
            }}
          >
            Sign out
          </button>
        </form>
      </>
    );
  }

  // Regular user — avatar (links to profile) + sign out
  return (
    <>
      <Link href="/profile/me" title="My Profile" style={{ display: "flex", textDecoration: "none" }}>
        {Avatar}
      </Link>
      <form action={() => signOut({ callbackUrl: "/" })}>
        <button
          type="submit"
          style={{
            fontSize: "0.75rem",
            fontWeight: 500,
            color: "var(--color-text-muted)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "4px 0",
          }}
        >
          Sign out
        </button>
      </form>
    </>
  );
}
