"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

interface NavLink {
  href: string;
  label: string;
}

interface Props {
  navLinks: NavLink[];
  contestHref: string;
  isAdmin: boolean;
}

const ADMIN_LINKS: NavLink[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/contests", label: "Manage Contests" },
  { href: "/admin/upload", label: "Upload Artwork" },
];

const PROFILE_LINKS: NavLink[] = [
  { href: "/profile/me", label: "My Profile" },
];

export function MobileMenu({ navLinks, contestHref, isAdmin }: Props) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const userName = session?.user?.name ?? session?.user?.email ?? null;

  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  // Keying open state to the pathname means changing routes automatically
  // resets open to false without any setState-in-effect call.
  const [openForPath, setOpenForPath] = useState<{ path: string; open: boolean }>({
    path: pathname,
    open: false,
  });

  const open = openForPath.path === pathname && openForPath.open;

  function setOpen(value: boolean) {
    setOpenForPath({ path: pathname, open: value });
  }

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenForPath((prev) => ({ ...prev, open: false }));
    }
    function handlePointerDown(e: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpenForPath((prev) => ({ ...prev, open: false }));
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href === contestHref && pathname.startsWith("/contest/")) return true;
    return pathname.startsWith(href);
  }

  const linkStyle = (href: string): React.CSSProperties => ({
    fontSize: "1rem",
    fontWeight: isActive(href) ? 600 : 500,
    color: isActive(href) ? "#eeeeff" : "#7878a0",
    textDecoration: "none",
    padding: "12px 16px",
    borderRadius: "8px",
    display: "block",
    background: isActive(href) ? "rgba(139,92,246,0.08)" : "transparent",
    borderLeft: isActive(href) ? "2px solid #8b5cf6" : "2px solid transparent",
    transition: "color 0.15s, background 0.15s",
  });

  return (
    <>
      {/* Hamburger — hidden on md+ via .nav-mobile-btn in globals.css */}
      <button
        className="nav-mobile-btn"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        style={{
          width: "36px",
          height: "36px",
          background: open ? "rgba(139,92,246,0.14)" : "rgba(139,92,246,0.08)",
          border: "1px solid rgba(139,92,246,0.25)",
          borderRadius: "8px",
          cursor: "pointer",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.15s",
        }}
      >
        {/* Hamburger → X with CSS transitions on the three bars */}
        <span
          aria-hidden="true"
          style={{
            position: "relative",
            display: "block",
            width: "16px",
            height: "12px",
          }}
        >
          {([
            { defaultTop: "0px",  openTransform: "rotate(45deg)",  openTop: "5px",  openOpacity: 1 },
            { defaultTop: "5px",  openTransform: "none",           openTop: "5px",  openOpacity: 0 },
            { defaultTop: "10px", openTransform: "rotate(-45deg)", openTop: "5px",  openOpacity: 1 },
          ] as const).map(({ defaultTop, openTransform, openTop, openOpacity }, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                left: 0,
                width: "16px",
                height: "1.5px",
                background: "#eeeeff",
                borderRadius: "2px",
                top: open ? openTop : defaultTop,
                transformOrigin: "center",
                transform: open ? openTransform : "none",
                opacity: open ? openOpacity : 1,
                transition: "transform 0.22s ease, opacity 0.22s ease, top 0.22s ease",
              }}
            />
          ))}
        </span>
      </button>

      {/* Backdrop + slide-down panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 49,
            // Subtle backdrop — panel itself has the main visual weight
            background: "rgba(8,8,14,0.6)",
            backdropFilter: "blur(3px)",
            WebkitBackdropFilter: "blur(3px)",
          }}
        >
          {/* Panel — ref used for outside-click detection */}
          <div
            ref={panelRef}
            style={{
              position: "absolute",
              top: "60px", // matches header height
              left: 0,
              right: 0,
              background: "#111119",
              borderBottom: "1px solid rgba(139,92,246,0.15)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              padding: "12px 16px 20px",
              animation: "mobileMenuSlideDown 0.22s ease forwards",
            }}
          >
            {/* Public nav links */}
            <nav aria-label="Mobile navigation">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  style={linkStyle(href)}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Profile link — shown when signed in */}
            {isLoggedIn && (
              <>
                <div style={{ height: "1px", background: "rgba(139,92,246,0.12)", margin: "8px 16px" }} />
                <nav aria-label="Profile navigation">
                  {PROFILE_LINKS.map(({ href, label }) => (
                    <Link key={href} href={href} onClick={() => setOpen(false)} style={linkStyle(href)}>
                      {label}
                    </Link>
                  ))}
                </nav>
              </>
            )}

            {/* Admin links */}
            {isAdmin && (
              <>
                <div
                  style={{
                    height: "1px",
                    background: "rgba(139,92,246,0.12)",
                    margin: "8px 16px",
                  }}
                />
                <p
                  style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#3a3a58",
                    padding: "4px 16px 8px",
                  }}
                >
                  Admin
                </p>
                <nav aria-label="Admin navigation">
                  {ADMIN_LINKS.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      style={linkStyle(href)}
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
              </>
            )}

            {/* Divider */}
            <div
              style={{
                height: "1px",
                background: "rgba(139,92,246,0.12)",
                margin: "8px 0 16px",
              }}
            />

            {/* CTA + auth actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "0 4px" }}>
              <Link
                href={contestHref}
                onClick={() => setOpen(false)}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "12px",
                  background: "#fbbf24",
                  borderRadius: "8px",
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  color: "#08080e",
                  textDecoration: "none",
                }}
              >
                Vote now →
              </Link>

              {isLoggedIn ? (
                <button
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  style={{
                    width: "100%",
                    padding: "11px",
                    background: "transparent",
                    border: "1px solid rgba(248,113,113,0.2)",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#f87171",
                    cursor: "pointer",
                  }}
                >
                  Sign out
                </button>
              ) : (
                <Link
                  href="/signin"
                  onClick={() => setOpen(false)}
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "11px",
                    border: "1px solid rgba(139,92,246,0.25)",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#7878a0",
                    textDecoration: "none",
                  }}
                >
                  Sign in
                </Link>
              )}
            </div>

            {userName && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#3a3a58",
                  textAlign: "center",
                  marginTop: "14px",
                }}
              >
                {`Signed in as ${userName}`}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Slide-down keyframe — injected inline to avoid a separate CSS file */}
      <style>{`
        @keyframes mobileMenuSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
