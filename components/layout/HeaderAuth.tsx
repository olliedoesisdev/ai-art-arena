"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

interface Props {
  contestHref: string;
  navLinks: { href: string; label: string }[];
}

export function HeaderAuth({ contestHref, navLinks }: Props) {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <>
      {session.user.image && (
        <div style={{
          position: "relative", width: "28px", height: "28px",
          borderRadius: "50%", overflow: "hidden",
          border: "2px solid rgba(139,92,246,0.4)", flexShrink: 0,
        }}>
          <Image src={session.user.image} alt={session.user.name || "User"} fill sizes="28px" className="object-cover" />
        </div>
      )}
      {session.user.role === "admin" && (
        <Link href="/admin" style={{
          fontSize: "0.75rem", fontWeight: 600, color: "#a78bfa", textDecoration: "none",
          padding: "4px 10px", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "100px",
        }}>
          Dashboard
        </Link>
      )}
      <form action={() => signOut({ callbackUrl: "/" })}>
        <button type="submit" style={{
          fontSize: "0.75rem", fontWeight: 500, color: "#7878a0",
          background: "transparent", border: "none", cursor: "pointer", padding: "4px 0",
        }}>
          Sign out
        </button>
      </form>
    </>
  );
}
