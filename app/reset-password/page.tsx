import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password — AI Art Arena",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <p
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 800,
              fontSize: "1.5rem",
              color: "var(--color-text)",
              letterSpacing: "-0.03em",
              marginBottom: "8px",
            }}
          >
            AI Art Arena
          </p>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            {token ? "Choose a new password" : "Reset your password"}
          </p>
        </div>

        <div
          style={{
            background: "var(--color-bg-surface)",
            border: "1px solid rgba(139,92,246,0.12)",
            borderRadius: "14px",
            padding: "32px",
          }}
        >
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
}
