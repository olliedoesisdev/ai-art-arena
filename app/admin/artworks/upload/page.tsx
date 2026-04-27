import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UploadArtworksForm } from "@/components/admin/UploadArtworksForm";

export const metadata = {
  title: "Upload Artworks - Admin",
};

export default async function UploadArtworksPage() {
  const session = await auth();
  const supabase = await createClient();

  // Check if user is admin
  if (!session?.user) {
    redirect("/signin");
  }

  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (user?.role !== "admin") {
    redirect("/");
  }

  // Get all contests (active and archived)
  const { data: contests } = await supabase
    .from("contests")
    .select("id, week_number, status, start_date, end_date")
    .order("week_number", { ascending: false });

  // Get active contest if exists
  const activeContest = contests?.find((c) => c.status === "active");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Upload Artworks
        </h2>
        <p className="text-gray-600">
          Add AI-generated artworks to a contest for users to vote on.
        </p>
      </div>

      {/* Contest Selection & Upload Form */}
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl">
        <UploadArtworksForm
          contests={contests || []}
          defaultContestId={activeContest?.id}
        />
      </div>

      {/* Upload Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-4xl">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          📸 Artwork Upload Guidelines
        </h3>
        <div className="space-y-3 text-blue-800 text-sm">
          <div>
            <strong>Image Requirements:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Format: JPG, PNG, WebP, or GIF</li>
              <li>• Size: Maximum 10MB per image</li>
              <li>• Dimensions: Recommended 1024x1024 or larger</li>
              <li>• Aspect Ratio: Square images work best</li>
            </ul>
          </div>
          <div>
            <strong>Best Practices:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Upload 6 artworks per contest for balanced voting</li>
              <li>
                • Include descriptive titles (e.g., "Cyberpunk City at Night")
              </li>
              <li>• Add the AI prompt used to generate the image</li>
              <li>• Ensure images are high quality and visually appealing</li>
            </ul>
          </div>
          <div>
            <strong>Artwork Sources:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Your own AI-generated images</li>
              <li>• Images from Midjourney, DALL-E, Stable Diffusion, etc.</li>
              <li>• Ensure you have rights to use the images</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-4xl">
        <h3 className="text-lg font-bold text-green-900 mb-3">💡 Pro Tips</h3>
        <ul className="space-y-2 text-green-800 text-sm">
          <li>• Upload multiple artworks at once to save time</li>
          <li>• Review artworks before making the contest active</li>
          <li>• Keep prompts concise but descriptive</li>
          <li>• Diverse art styles increase engagement</li>
        </ul>
      </div>

      {/* Current Contest Status */}
      {contests && contests.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 max-w-4xl">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            📊 Contest Status
          </h3>
          <div className="space-y-3">
            {contests.slice(0, 5).map((contest) => (
              <div
                key={contest.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <div className="font-semibold text-gray-900">
                    Week {contest.week_number}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(contest.start_date).toLocaleDateString()} -{" "}
                    {new Date(contest.end_date).toLocaleDateString()}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    contest.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {contest.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
