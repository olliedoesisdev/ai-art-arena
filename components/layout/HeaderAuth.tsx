"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function HeaderAuth() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const avatarSrc = session.user.image ?? null;
  const displayName = session.user.name ?? session.user.email ?? "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <Link
        href="/profile/me"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          textDecoration: "none",
          borderRadius: "100px",
          padding: "2px 2px 2px 2px",
          transition: "box-shadow 0.15s",
          outline: "none",
        }}
        title="My Profile"
      >
        <div style={{
          position: "relative",
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          overflow: "hidden",
          border: "2px solid rgba(139,92,246,0.3)",
          flexShrink: 0,
          background: "#181820",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "border-color 0.15s",
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#a78bfa"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(139,92,246,0.3)"; }}
        >
          {avatarSrc ? (
            <Image src={avatarSrc} alt={displayName} fill sizes="28px" className="object-cover" />
          ) : (
            <span style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "11px",
              fontWeight: 700,
              color: "#a78bfa",
            }}>
              {initial}
            </span>
          )}
        </div>
        <span style={{
          fontSize: "0.75rem",
          fontWeight: 500,
          color: "#7878a0",
          fontFamily: "var(--font-dm-mono)",
        }}>
          My Profile
        </span>
      </Link>

      {session.user.role === "admin" && (
        <Link href="/admin" style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "#a78bfa",
          textDecoration: "none",
          padding: "4px 10px",
          border: "1px solid rgba(139,92,246,0.3)",
          borderRadius: "100px",
        }}>
          Dashboard
        </Link>
      )}

      <form action={() => signOut({ callbackUrl: "/" })}>
        <button type="submit" style={{
          fontSize: "0.75rem",
          fontWeight: 500,
          color: "#7878a0",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "4px 0",
        }}>
          Sign out
        </button>
      </form>
    </>
  );
}
