import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CreateContestForm } from "@/components/admin/CreateContestForm";

export const metadata = { title: "New Contest — Admin" };

export default async function NewContestPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/signin");

  const supabase = createAdminClient();
  const { data: latest } = await supabase
    .from("contests")
    .select("contest_number")
    .order("contest_number", { ascending: false })
    .limit(1)
    .single();

  const suggestedContestNumber = latest ? latest.contest_number + 1 : 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <div>
        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-purple)", marginBottom: "8px" }}>Contests</p>
        <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.75rem", color: "var(--color-text)", letterSpacing: "-0.03em" }}>New Contest</h1>
      </div>

      <div style={{ background: "var(--color-bg-surface)", border: "1px solid rgba(139,92,246,0.12)", borderRadius: "14px", padding: "32px", maxWidth: "560px" }}>
        <CreateContestForm suggestedContestNumber={suggestedContestNumber} />
      </div>

      <div style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.12)", borderRadius: "12px", padding: "20px 24px", maxWidth: "560px" }}>
        <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-purple-light)", marginBottom: "10px" }}>Setup checklist</p>
        <ul style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", lineHeight: 1.8, paddingLeft: "16px", margin: 0 }}>
          <li>Set status to Active to make it live immediately</li>
          <li>Upload artworks after creating the contest (the count you set above)</li>
          <li>End date is typically 7 days after start</li>
        </ul>
      </div>
    </div>
  );
}
