import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/signin");
  }

  const NAV = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/contests", label: "Contests" },
    { href: "/admin/artworks", label: "Artworks" },
    { href: "/admin/analytics", label: "Analytics" },
  ];

  return (
    <div style={{ minHeight: "100dvh", background: "#08080e" }}>
      {/* Admin top bar */}
      <div style={{
        background: "rgba(17,17,25,0.95)",
        borderBottom: "1px solid rgba(139,92,246,0.15)",
        padding: "0 28px",
        height: "52px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: "60px",
        zIndex: 40,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#8b5cf6", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Admin
          </span>
          <span style={{ color: "rgba(139,92,246,0.3)" }}>·</span>
          <span style={{ fontSize: "0.8125rem", color: "#7878a0" }}>{session.user.email}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/" style={{ fontSize: "0.8125rem", color: "#7878a0", textDecoration: "none" }}>
            ← Back to site
          </Link>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <button type="submit" style={{
              fontSize: "0.75rem", fontWeight: 600, color: "#f87171",
              background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
              borderRadius: "6px", padding: "4px 12px", cursor: "pointer",
            }}>
              Sign out
            </button>
          </form>
        </div>
      </div>

      <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "32px 28px", display: "grid", gridTemplateColumns: "200px 1fr", gap: "32px" }}>
        {/* Sidebar */}
        <aside>
          <nav style={{ display: "flex", flexDirection: "column", gap: "4px", position: "sticky", top: "120px" }}>
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href} style={{
                fontSize: "0.875rem", fontWeight: 500, color: "#7878a0",
                textDecoration: "none", padding: "8px 12px", borderRadius: "8px",
              }}>
                {label}
              </Link>
            ))}
            <div style={{ height: "1px", background: "rgba(139,92,246,0.12)", margin: "8px 0" }} />
            <Link href="/admin/contests/new" style={{
              fontSize: "0.8125rem", fontWeight: 600, color: "#8b5cf6",
              textDecoration: "none", padding: "8px 12px", borderRadius: "8px",
              background: "rgba(139,92,246,0.08)",
            }}>
              + New Contest
            </Link>
            <Link href="/admin/artworks/upload" style={{
              fontSize: "0.8125rem", fontWeight: 500, color: "#7878a0",
              textDecoration: "none", padding: "8px 12px", borderRadius: "8px",
            }}>
              Upload Artworks
            </Link>
          </nav>
        </aside>

        {/* Main content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
