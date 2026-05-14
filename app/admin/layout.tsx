import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/signin");
  }

  return (
    <>
      <style>{`
        /* Desktop: sidebar always visible, main content offset */
        @media (min-width: 768px) {
          .admin-sidebar {
            transform: translateX(0) !important;
          }
          .md-hide {
            display: none !important;
          }
          .admin-main-wrap {
            margin-left: 220px;
          }
        }
        /* Mobile: no margin offset (sidebar overlays) */
        @media (max-width: 767px) {
          .admin-main-wrap {
            margin-left: 0;
          }
          .md-show-flex {
            display: none !important;
          }
        }
      `}</style>

      <AdminSidebar email={session.user.email ?? ""} />

      <div className="admin-main-wrap" style={{ minHeight: "100dvh", background: "var(--color-bg-base)" }}>
        {/* Desktop top bar */}
        <div
          className="md-show-flex"
          style={{
            background: "rgba(17,17,25,0.95)",
            borderBottom: "1px solid rgba(139,92,246,0.15)",
            padding: "0 28px",
            height: "52px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
              <button type="submit" style={{
                fontSize: "0.75rem", fontWeight: 600, color: "var(--color-status-error)",
                background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
                borderRadius: "6px", padding: "4px 12px", cursor: "pointer",
              }}>
                Sign out
              </button>
            </form>
          </div>
        </div>

        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>
          {children}
        </div>
      </div>
    </>
  );
}
