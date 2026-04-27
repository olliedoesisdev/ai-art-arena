import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Dashboard - AI Art Arena",
};

export default async function AdminPage() {
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
    redirect("/signin");
  }

  // Get comprehensive stats
  const [
    contestsResult,
    artworksResult,
    votesResult,
    recentContestsResult,
    recentVotesResult,
  ] = await Promise.all([
    supabase.from("contests").select("id, status", { count: "exact" }),
    supabase.from("artworks").select("id", { count: "exact" }),
    supabase.from("votes").select("id, created_at", { count: "exact" }),
    supabase
      .from("contests")
      .select(
        `
        id,
        week_number,
        status,
        start_date,
        end_date,
        artworks (count)
      `
      )
      .order("week_number", { ascending: false })
      .limit(5),
    supabase
      .from("votes")
      .select(
        `
        id,
        created_at,
        artworks (
          title,
          contests (
            week_number
          )
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const activeContests =
    contestsResult.data?.filter((c) => c.status === "active").length || 0;
  const totalContests = contestsResult.count || 0;
  const totalArtworks = artworksResult.count || 0;
  const totalVotes = votesResult.count || 0;

  // Calculate votes today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const votesToday =
    votesResult.data?.filter(
      (v) => new Date(v.created_at) >= today
    ).length || 0;

  // Calculate votes this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const votesThisWeek =
    votesResult.data?.filter(
      (v) => new Date(v.created_at) >= weekAgo
    ).length || 0;

  const recentContests = recentContestsResult.data || [];
  const recentVotes = recentVotesResult.data || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Overview
        </h2>
        <p className="text-gray-600 mb-6">
          Welcome back! Here's what's happening with your AI Art Arena.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-5xl font-bold">{activeContests}</div>
              <div className="bg-white/20 p-3 rounded-lg">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-blue-100">Active Contests</div>
            <div className="mt-2 text-sm text-blue-200">
              {totalContests - activeContests} archived
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-5xl font-bold">{totalArtworks}</div>
              <div className="bg-white/20 p-3 rounded-lg">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-purple-100">Total Artworks</div>
            <div className="mt-2 text-sm text-purple-200">
              {totalContests > 0
                ? `${Math.round(totalArtworks / totalContests)} per contest`
                : "No contests yet"}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-5xl font-bold">{totalVotes}</div>
              <div className="bg-white/20 p-3 rounded-lg">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
              </div>
            </div>
            <div className="text-green-100">Total Votes</div>
            <div className="mt-2 text-sm text-green-200">
              {votesToday} today, {votesThisWeek} this week
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-5xl font-bold">{totalContests}</div>
              <div className="bg-white/20 p-3 rounded-lg">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            </div>
            <div className="text-orange-100">Total Contests</div>
            <div className="mt-2 text-sm text-orange-200">
              {activeContests > 0 ? "Currently active" : "None active"}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/contests/new"
              className="flex items-center gap-3 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 text-blue-700 px-6 py-4 rounded-lg font-semibold transition-all hover:scale-105"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Create Contest</span>
            </Link>
            <Link
              href="/admin/artworks/upload"
              className="flex items-center gap-3 bg-green-50 hover:bg-green-100 border-2 border-green-200 text-green-700 px-6 py-4 rounded-lg font-semibold transition-all hover:scale-105"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span>Upload Artworks</span>
            </Link>
            <Link
              href="/admin/analytics"
              className="flex items-center gap-3 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 text-purple-700 px-6 py-4 rounded-lg font-semibold transition-all hover:scale-105"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span>View Analytics</span>
            </Link>
            <Link
              href="/admin/contests"
              className="flex items-center gap-3 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 text-orange-700 px-6 py-4 rounded-lg font-semibold transition-all hover:scale-105"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              <span>Manage Contests</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Contests */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Recent Contests
              </h3>
              <Link
                href="/admin/contests"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {recentContests.length > 0 ? (
                recentContests.map((contest) => {
                  const artworkCount = Array.isArray(contest.artworks)
                    ? contest.artworks.length
                    : (contest.artworks as any)?.count || 0;

                  return (
                    <div
                      key={contest.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-gray-900">
                          Week {contest.week_number}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(contest.start_date).toLocaleDateString()} -{" "}
                          {new Date(contest.end_date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {artworkCount} artwork{artworkCount !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            contest.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {contest.status}
                        </span>
                        <Link
                          href={`/contest/${contest.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">No contests yet</p>
                  <Link
                    href="/admin/contests/new"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Create your first contest →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Recent Votes
              </h3>
              <Link
                href="/admin/analytics"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Analytics →
              </Link>
            </div>
            <div className="space-y-3">
              {recentVotes.length > 0 ? (
                recentVotes.slice(0, 8).map((vote: any, index) => {
                  const artwork = vote.artworks;
                  const contest = artwork?.contests;

                  return (
                    <div
                      key={vote.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {artwork?.title || "Unknown Artwork"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Week {contest?.week_number || "?"}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(vote.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No votes yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
