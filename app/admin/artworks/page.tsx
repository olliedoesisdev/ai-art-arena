import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Manage Artworks - Admin",
};

export default async function ManageArtworksPage() {
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

  // Get all artworks with contest info
  const { data: artworks } = await supabase
    .from("artworks")
    .select(
      `
      id,
      title,
      artist_prompt,
      image_url,
      created_at,
      contests (
        id,
        week_number,
        status
      )
    `
    )
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Manage Artworks
          </h2>
          <p className="text-gray-600">
            View all uploaded artworks and upload new ones to contests.
          </p>
        </div>
        <Link
          href="/admin/artworks/upload"
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          🖼️ Upload Artworks
        </Link>
      </div>

      {/* Artworks Grid */}
      <div className="bg-white rounded-lg shadow p-6">
        {artworks && artworks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.map((artwork) => {
              const contest = artwork.contests as any;

              return (
                <div
                  key={artwork.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-100">
                    <Image
                      src={artwork.image_url}
                      alt={artwork.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {artwork.title}
                    </h3>

                    {artwork.artist_prompt && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {artwork.artist_prompt}
                      </p>
                    )}

                    {contest && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          Week {contest.week_number}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            contest.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {contest.status}
                        </span>
                      </div>
                    )}

                    <div className="text-xs text-gray-400">
                      Uploaded{" "}
                      {new Date(artwork.created_at).toLocaleDateString()}
                    </div>

                    {contest && (
                      <Link
                        href={`/contest/${contest.id}`}
                        className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                        target="_blank"
                      >
                        View Contest →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-500">
                No artworks yet
              </p>
              <p className="text-sm text-gray-400">
                Upload your first artworks to get started
              </p>
              <Link
                href="/admin/artworks/upload"
                className="inline-block mt-4 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                🖼️ Upload Artworks
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {artworks && artworks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">
              Total Artworks
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {artworks.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">
              Recent Uploads
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {
                artworks.filter(
                  (a) =>
                    new Date(a.created_at) >
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length
              }
            </div>
            <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
          </div>
        </div>
      )}
    </div>
  );
}
