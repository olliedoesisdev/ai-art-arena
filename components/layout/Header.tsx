import Link from "next/link";
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
  const activeContestId = await getActiveContestId();
  const contestHref = activeContestId ? `/contest/${activeContestId}` : "/archive";

  const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: contestHref, label: "Contest" },
    { href: "/archive", label: "Archive" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/about", label: "About" },
  ];

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50, height: "60px",
      background: "rgba(8,8,14,0.88)",
      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(139,92,246,0.12)",
    }}>
      <div className="shell" style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{
          fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.125rem",
          color: "#eeeeff", letterSpacing: "-0.03em", textDecoration: "none", flexShrink: 0,
        }}>
          AI Art Arena
        </Link>

        <nav className="nav-links">
          <NavLinks links={NAV_LINKS} contestHref={contestHref} />
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Auth state rendered client-side — does not block ISR caching */}
          <div className="nav-links" style={{ gap: "12px" }}>
            <HeaderAuth contestHref={contestHref} navLinks={NAV_LINKS} />
          </div>

          <Link href={contestHref} style={{
            fontSize: "0.8125rem", fontWeight: 700, color: "#08080e",
            background: "#fbbf24", padding: "7px 16px", borderRadius: "100px",
            textDecoration: "none", letterSpacing: "0.01em", flexShrink: 0, whiteSpace: "nowrap",
          }}>
            Vote now →
          </Link>

          <MobileMenu navLinks={NAV_LINKS} contestHref={contestHref} />
        </div>
      </div>
    </header>
  );
}
