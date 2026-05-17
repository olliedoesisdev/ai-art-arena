import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import Image from "next/image";
import { DeleteArtworkButton } from "@/components/admin/DeleteArtworkButton";
import { EditArtworkModal } from "@/components/admin/EditArtworkModal";
import { ArtworkLightbox } from "@/components/admin/ArtworkLightbox";

export const metadata = { title: "Artworks — Admin" };

export default async function ManageArtworksPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/signin");

  const supabase = createAdminClient();
  const { data: artworks } = await supabase
    .from("artworks")
    .select("id, title, prompt, image_url, vote_count, created_at, contests(id, contest_number, status)")
    .order("created_at", { ascending: false });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-purple)", marginBottom: "8px" }}>Manage</p>
          <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.75rem", color: "var(--color-text)", letterSpacing: "-0.03em" }}>
            Artworks
          </h1>
        </div>
        <Link href="/admin/artworks/upload" style={{
          fontSize: "0.875rem", fontWeight: 700, color: "var(--color-bg-base)",
          background: "var(--color-purple)", padding: "10px 20px", borderRadius: "8px",
          textDecoration: "none",
        }}>
          + Upload Artworks
        </Link>
      </div>

      {!artworks || artworks.length === 0 ? (
        <div style={{ background: "var(--color-bg-surface)", border: "1px solid rgba(139,92,246,0.12)", borderRadius: "14px", padding: "64px", textAlign: "center" }}>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "12px" }}>No artworks yet</p>
          <Link href="/admin/artworks/upload" style={{ color: "var(--color-purple)", fontSize: "0.875rem", textDecoration: "none" }}>
            Upload your first artworks →
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {artworks.map((artwork) => {
            const contestRaw = Array.isArray(artwork.contests) ? artwork.contests[0] : artwork.contests;
            const contest = contestRaw as { id: string; contest_number: number; status: string } | null;
            return (
              <div key={artwork.id} style={{ background: "var(--color-bg-surface)", border: "1px solid rgba(139,92,246,0.12)", borderRadius: "14px", overflow: "hidden" }}>
                {/* Clickable image → lightbox */}
                <div style={{ position: "relative", aspectRatio: "1", background: "var(--color-bg-surface2)" }}>
                  <Image src={artwork.image_url} alt={artwork.title} fill style={{ objectFit: "cover" }} sizes="33vw" />
                  <ArtworkLightbox src={artwork.image_url} alt={artwork.title} cover />
                </div>
                <div style={{ padding: "16px" }}>
                  <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {artwork.title}
                  </div>
                  {artwork.prompt && (
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "10px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {artwork.prompt}
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {contest && (
                        <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--color-text-muted)" }}>#{contest.contest_number}</span>
                      )}
                      {contest && (
                        <span style={{
                          fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                          padding: "2px 6px", borderRadius: "100px",
                          background: contest.status === "active" ? "rgba(52,211,153,0.12)" : "rgba(139,92,246,0.08)",
                          color: contest.status === "active" ? "var(--color-status-success)" : "var(--color-text-muted)",
                        }}>
                          {contest.status}
                        </span>
                      )}
                    </div>
                    <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.75rem", color: "var(--color-purple-light)" }}>
                      {artwork.vote_count ?? 0} votes
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <EditArtworkModal
                      artworkId={artwork.id}
                      initialTitle={artwork.title}
                      initialPrompt={artwork.prompt ?? null}
                    />
                    <DeleteArtworkButton artworkId={artwork.id} artworkTitle={artwork.title} />
                    {contest && (
                      <Link href={`/contest/${contest.id}`} target="_blank" style={{ fontSize: "0.75rem", color: "var(--color-purple)", textDecoration: "none", marginLeft: "auto" }}>
                        View →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
