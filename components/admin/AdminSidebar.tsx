"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/contests", label: "Contests" },
  { href: "/admin/artworks", label: "Artworks" },
  { href: "/admin/comments", label: "Comments" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/applications", label: "Applications" },
];

interface AdminSidebarProps {
  email: string;
}

export function AdminSidebar({ email }: AdminSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          height: "52px",
          background: "rgba(17,17,25,0.97)",
          borderBottom: "1px solid rgba(139,92,246,0.15)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
        className="md-hide"
      >
        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-purple)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Admin
        </span>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            background: "transparent",
            border: "1px solid rgba(139,92,246,0.2)",
            borderRadius: "8px",
            cursor: "pointer",
            color: "var(--color-text-muted)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 50,
          }}
          className="md-hide"
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100%",
          width: "220px",
          background: "rgba(17,17,25,0.98)",
          borderRight: "1px solid rgba(139,92,246,0.15)",
          display: "flex",
          flexDirection: "column",
          zIndex: 60,
          transition: "transform 0.25s ease",
          transform: open ? "translateX(0)" : "translateX(-100%)",
        }}
        className="admin-sidebar"
      >
        {/* Sidebar header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          height: "52px",
          borderBottom: "1px solid rgba(139,92,246,0.1)",
          flexShrink: 0,
        }}>
          <div>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-purple)", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>Admin</p>
            <p style={{ fontSize: "0.6875rem", color: "var(--color-text-dim)", margin: 0, marginTop: "1px", fontFamily: "var(--font-dm-mono)" }}>{email}</p>
          </div>
          {/* Close button — visible on mobile only */}
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="md-hide"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              borderRadius: "6px",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto" }}>
          {NAV_ITEMS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: active ? 600 : 500,
                  color: active ? "var(--color-purple-pale)" : "var(--color-text-muted)",
                  textDecoration: "none",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  background: active ? "rgba(139,92,246,0.12)" : "transparent",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {label}
              </Link>
            );
          })}
          <div style={{ height: "1px", background: "rgba(139,92,246,0.1)", margin: "8px 2px" }} />
          <Link
            href="/admin/contests/new"
            onClick={() => setOpen(false)}
            style={{
              display: "block",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--color-purple)",
              textDecoration: "none",
              padding: "8px 12px",
              borderRadius: "8px",
              background: "rgba(139,92,246,0.08)",
            }}
          >
            + New Contest
          </Link>
          <Link
            href="/admin/artworks/upload"
            onClick={() => setOpen(false)}
            style={{
              display: "block",
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "var(--color-text-muted)",
              textDecoration: "none",
              padding: "8px 12px",
              borderRadius: "8px",
            }}
          >
            Upload Artworks
          </Link>
        </nav>
      </aside>
    </>
  );
}
