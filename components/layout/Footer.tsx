import Link from "next/link";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/archive", label: "Archive" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(139,92,246,0.12)",
        padding: "40px 0",
      }}
    >
      <div
        className="shell"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <p style={{ fontSize: "0.8125rem", color: "#7878a0" }}>
          &copy; {new Date().getFullYear()} AI Art Arena
        </p>

        <nav style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontSize: "0.8125rem",
                color: "#7878a0",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
