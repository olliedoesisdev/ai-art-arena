"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

interface Props {
  navLinks: { href: string; label: string }[];
  contestHref: string;
}

export function MobileMenu({ navLinks, contestHref }: Props) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "admin";
  const userName = session?.user?.name ?? session?.user?.email ?? null;
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button — mobile only */}
      <button
        className="nav-mobile-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
        style={{
          width: "36px", height: "36px", background: "rgba(139,92,246,0.08)",
          border: "1px solid rgba(139,92,246,0.2)", borderRadius: "8px",
          cursor: "pointer", flexShrink: 0,
        }}
      >
        {open ? (
          <svg width="16" height="16" fill="none" stroke="#eeeeff" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width="16" height="16" fill="none" stroke="#eeeeff" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Drawer */}
      {open && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 49,
        }}>
          {/* Backdrop */}
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(8,8,14,0.7)", backdropFilter: "blur(4px)" }}
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div style={{
            position: "absolute", top: "60px", left: 0, right: 0,
            background: "#111119", borderBottom: "1px solid rgba(139,92,246,0.15)",
            padding: "16px",
          }}>
            <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  style={{
                    fontSize: "1rem", fontWeight: 500, color: "#7878a0",
                    textDecoration: "none", padding: "12px 16px", borderRadius: "8px",
                    display: "block",
                  }}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div style={{ height: "1px", background: "rgba(139,92,246,0.12)", margin: "12px 0" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link
                href={contestHref}
                onClick={() => setOpen(false)}
                style={{
                  display: "block", textAlign: "center", padding: "12px",
                  background: "#fbbf24", borderRadius: "8px",
                  fontSize: "0.9375rem", fontWeight: 700, color: "#08080e",
                  textDecoration: "none",
                }}
              >
                Vote now →
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  style={{
                    display: "block", textAlign: "center", padding: "11px",
                    border: "1px solid rgba(139,92,246,0.3)", borderRadius: "8px",
                    fontSize: "0.875rem", fontWeight: 600, color: "#a78bfa",
                    textDecoration: "none",
                  }}
                >
                  Dashboard
                </Link>
              )}

              {isLoggedIn ? (
                <button
                  onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                  style={{
                    width: "100%", padding: "11px", background: "transparent",
                    border: "1px solid rgba(248,113,113,0.2)", borderRadius: "8px",
                    fontSize: "0.875rem", fontWeight: 500, color: "#f87171", cursor: "pointer",
                  }}
                >
                  Sign out
                </button>
              ) : (
                <Link
                  href="/signin"
                  onClick={() => setOpen(false)}
                  style={{
                    display: "block", textAlign: "center", padding: "11px",
                    border: "1px solid rgba(139,92,246,0.25)", borderRadius: "8px",
                    fontSize: "0.875rem", fontWeight: 500, color: "#7878a0",
                    textDecoration: "none",
                  }}
                >
                  Sign in
                </Link>
              )}
            </div>

            {userName && (
              <p style={{ fontSize: "0.75rem", color: "#3a3a58", textAlign: "center", marginTop: "12px" }}>
                Signed in as {userName}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
