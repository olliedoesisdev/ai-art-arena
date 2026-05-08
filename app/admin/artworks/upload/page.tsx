import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UploadArtworksForm } from "@/components/admin/UploadArtworksForm";

export const metadata = { title: "Upload Artworks — Admin" };

export default async function UploadArtworksPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/signin");

  const supabase = createAdminClient();
  const { data: contests } = await supabase
    .from("contests")
    .select("id, week_number, status, start_date, end_date, artwork_count")
    .order("week_number", { ascending: false });

  const activeContest = contests?.find((c) => c.status === "active");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <div>
        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8b5cf6", marginBottom: "8px" }}>Artworks</p>
        <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.75rem", color: "#eeeeff", letterSpacing: "-0.03em" }}>Upload Artworks</h1>
        <p style={{ fontSize: "0.875rem", color: "#7878a0", marginTop: "6px" }}>Add AI-generated artworks to a contest for users to vote on.</p>
      </div>

      <div style={{ background: "#111119", border: "1px solid rgba(139,92,246,0.12)", borderRadius: "14px", padding: "32px" }}>
        <UploadArtworksForm contests={contests ?? []} defaultContestId={activeContest?.id} defaultArtworkCount={activeContest?.artwork_count ?? 6} />
      </div>
    </div>
  );
}
