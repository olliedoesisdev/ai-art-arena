import Link from "next/link";
import { auth } from "@/auth";
import { createPublicClient } from "@/lib/supabase/server";
import { MobileMenu } from "./MobileMenu";
import { HeaderAuth } from "./HeaderAuth";
import { NavLinks } from "./NavLinks";

async function getActiveContestId(): Promise<string | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("contests")
    .select("id")
    .eq("status", "active")
    .order("week_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

export async function Header() {
  const [activeContestId, session] = await Promise.all([
    getActiveContestId(),
    auth(),
  ]);

  const contestHref = activeContestId ? `/contest/${activeContestId}` : "/archive";
  const isAdmin = session?.user?.role === "admin";

  const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: contestHref, label: "Contest" },
    { href: "/archive", label: "Archive" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/about", label: "About" },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: "60px",
        background: "rgba(8,8,14,0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--color-border-subtle)",
      }}
    >
      <div
        className="shell"
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Wordmark */}
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "1.125rem",
            color: "var(--color-text)",
            letterSpacing: "-0.03em",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          AI Art Arena
        </Link>

        {/* Desktop nav — hidden below md via .nav-links in globals.css */}
        <nav className="nav-links">
          <NavLinks links={NAV_LINKS} contestHref={contestHref} />
        </nav>

        {/* Right side: auth actions (desktop) + Vote CTA + mobile hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="nav-links" style={{ gap: "12px" }}>
            <HeaderAuth />
          </div>

          <Link
            href={contestHref}
            style={{
              fontSize: "0.8125rem",
              fontWeight: 700,
              color: "var(--color-bg-base)",
              background: "var(--color-status-warning)",
              padding: "7px 16px",
              borderRadius: "100px",
              textDecoration: "none",
              letterSpacing: "0.01em",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            Vote now →
          </Link>

          {/* Mobile menu — visible below md, hidden on md+ via .nav-mobile-btn */}
          <MobileMenu
            navLinks={NAV_LINKS}
            contestHref={contestHref}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </header>
  );
}
