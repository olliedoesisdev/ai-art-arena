import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = {
  title: "Sign In — AI Art Arena",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; tab?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  if (session?.user) {
    if (params.callbackUrl) {
      redirect(params.callbackUrl);
    } else if (session.user.role === "admin") {
      redirect("/admin");
    } else {
      redirect("/");
    }
  }

  const callbackUrl = params.callbackUrl || "/";
  const defaultTab = params.tab === "signup" ? "signup" : "signin";

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
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <p
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 800,
              fontSize: "1.5rem",
              color: "#eeeeff",
              letterSpacing: "-0.03em",
              marginBottom: "8px",
            }}
          >
            AI Art Arena
          </p>
          <p style={{ fontSize: "0.875rem", color: "#7878a0" }}>
            Sign in to vote on AI-generated artwork
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "#111119",
            border: "1px solid rgba(139,92,246,0.12)",
            borderRadius: "14px",
            padding: "32px",
          }}
        >
          <AuthForm callbackUrl={callbackUrl} defaultTab={defaultTab} />
        </div>
      </div>
    </div>
  );
}
