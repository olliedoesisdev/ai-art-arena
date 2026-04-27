import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { ArchiveButton } from "@/components/admin/ArchiveButton";

export const metadata = {
  title: "Manage Contests - Admin",
};

export default async function ManageContestsPage() {
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

  // Get all contests with artwork count
  const { data: contests } = await supabase
    .from("contests")
    .select(
      `
      id,
      week_number,
      start_date,
      end_date,
      status,
      artworks (count)
    `
    )
    .order("week_number", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Manage Contests
          </h2>
          <p className="text-gray-600">
            View and manage all contests, create new ones, or archive existing
            contests.
          </p>
        </div>
        <Link
          href="/admin/contests/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          ➕ Create New Contest
        </Link>
      </div>

      {/* Contests List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Week
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artworks
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contests && contests.length > 0 ? (
                contests.map((contest) => {
                  const artworkCount = Array.isArray(contest.artworks)
                    ? contest.artworks.length
                    : (contest.artworks as any)?.count || 0;

                  return (
                    <tr key={contest.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Week {contest.week_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(contest.start_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(contest.end_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            contest.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {contest.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {artworkCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <Link
                          href={`/contest/${contest.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          target="_blank"
                        >
                          View
                        </Link>
                        {contest.status === "active" && (
                          <ArchiveButton contestId={contest.id} />
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="space-y-2">
                      <p className="text-lg font-medium">No contests yet</p>
                      <p className="text-sm">
                        Create your first contest to get started
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      {contests && contests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">
              Total Contests
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {contests.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">
              Active Contests
            </div>
            <div className="text-3xl font-bold text-green-600">
              {contests.filter((c) => c.status === "active").length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">
              Archived Contests
            </div>
            <div className="text-3xl font-bold text-gray-600">
              {contests.filter((c) => c.status === "archived").length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
