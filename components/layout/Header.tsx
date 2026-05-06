import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "@/auth";
import { createClient } from "@/lib/supabase/server";
import { MobileMenu } from "./MobileMenu";

async function getActiveContestId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contests")
    .select("id")
    .eq("status", "active")
    .order("week_number", { ascending: false })
    .limit(1)
    .single();
  return data?.id ?? null;
}

export async function Header() {
  const [session, activeContestId] = await Promise.all([auth(), getActiveContestId()]);
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
        {/* Logo */}
        <Link href="/" style={{
          fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.125rem",
          color: "#eeeeff", letterSpacing: "-0.03em", textDecoration: "none", flexShrink: 0,
        }}>
          AI Art Arena
        </Link>

        {/* Desktop nav */}
        <nav className="nav-links">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={label} href={href} style={{
              fontSize: "0.875rem", fontWeight: 500, color: "#7878a0", textDecoration: "none",
            }}>
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Desktop auth */}
          <div className="nav-links" style={{ gap: "12px" }}>
            {session?.user ? (
              <>
                {session.user.image && (
                  <div style={{ position: "relative", width: "28px", height: "28px", borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(139,92,246,0.4)", flexShrink: 0 }}>
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
                <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
                  <button type="submit" style={{
                    fontSize: "0.75rem", fontWeight: 500, color: "#7878a0",
                    background: "transparent", border: "none", cursor: "pointer", padding: "4px 0",
                  }}>
                    Sign out
                  </button>
                </form>
              </>
            ) : null}
          </div>

          {/* Vote now — always visible */}
          <Link href={contestHref} style={{
            fontSize: "0.8125rem", fontWeight: 700, color: "#08080e",
            background: "#fbbf24", padding: "7px 16px", borderRadius: "100px",
            textDecoration: "none", letterSpacing: "0.01em", flexShrink: 0, whiteSpace: "nowrap",
          }}>
            Vote now →
          </Link>

          {/* Mobile hamburger */}
          <MobileMenu
            navLinks={NAV_LINKS}
            isLoggedIn={!!session?.user}
            isAdmin={session?.user?.role === "admin"}
            userImage={session?.user?.image ?? null}
            userName={session?.user?.name ?? session?.user?.email ?? null}
            contestHref={contestHref}
          />
        </div>
      </div>
    </header>
  );
}
