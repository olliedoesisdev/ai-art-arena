import { createAdminClient } from "@/lib/supabase/server";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";

export const metadata = {
  title: "Analytics - Admin",
};

export default async function AnalyticsPage() {
  const supabase = createAdminClient();

  // Get overall stats
  const [contestsResult, artworksResult, votesResult] =
    await Promise.all([
      supabase.from("contests").select("*", { count: "exact" }),
      supabase.from("artworks").select("*", { count: "exact" }),
      supabase.from("votes").select("*", { count: "exact" }),
    ]);

  const totalContests = contestsResult.count || 0;
  const totalArtworks = artworksResult.count || 0;
  const totalVotes = votesResult.count || 0;

  // Get votes per contest
  const { data: votesPerContest } = await supabase
    .from("contests")
    .select(
      `
      id,
      week_number,
      votes (count)
    `
    )
    .order("week_number", { ascending: true });

  // Get top artworks (all time)
  const { data: topArtworks } = await supabase
    .from("artworks")
    .select(
      `
      id,
      title,
      vote_count,
      contests (
        week_number
      )
    `
    )
    .order("vote_count", { ascending: false })
    .limit(10);

  // Get votes over time (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: votesOverTime } = await supabase
    .from("votes")
    .select("created_at")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  // Calculate average votes per contest
  const avgVotesPerContest =
    totalContests > 0 ? (totalVotes / totalContests).toFixed(1) : "0";

  // Calculate average votes per artwork
  const avgVotesPerArtwork =
    totalArtworks > 0 ? (totalVotes / totalArtworks).toFixed(1) : "0";

  // Calculate participation rate (users who voted / total users)
  const uniqueVoters = new Set(
    votesResult.data?.map((v) => v.user_id || v.ip_hash)
  ).size;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Analytics Dashboard
        </h2>
        <p className="text-gray-600">
          Track voting trends and contest performance
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Total Votes</div>
          <div className="text-3xl font-bold text-blue-600">{totalVotes}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Avg Votes/Contest</div>
          <div className="text-3xl font-bold text-purple-600">
            {avgVotesPerContest}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Avg Votes/Artwork</div>
          <div className="text-3xl font-bold text-green-600">
            {avgVotesPerArtwork}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Unique Voters</div>
          <div className="text-3xl font-bold text-orange-600">
            {uniqueVoters}
          </div>
        </div>
      </div>

      {/* Charts */}
      <AnalyticsCharts
        votesPerContest={votesPerContest || []}
        votesOverTime={votesOverTime || []}
      />

      {/* Top Artworks Leaderboard */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          🏆 Top 10 Artworks (All Time)
        </h3>
        <div className="space-y-3">
          {topArtworks?.map((artwork, index) => (
            <div
              key={artwork.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`
                  text-2xl font-bold w-8 text-center
                  ${index === 0 ? "text-yellow-500" : ""}
                  ${index === 1 ? "text-gray-400" : ""}
                  ${index === 2 ? "text-orange-600" : ""}
                  ${index > 2 ? "text-gray-500" : ""}
                `}
                >
                  {index === 0
                    ? "🥇"
                    : index === 1
                    ? "🥈"
                    : index === 2
                    ? "🥉"
                    : `#${index + 1}`}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {artwork.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    Week {Array.isArray(artwork.contests) ? artwork.contests[0]?.week_number : (artwork.contests as { week_number: number } | null)?.week_number}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {artwork.vote_count}
                </div>
                <div className="text-sm text-gray-600">votes</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contest Performance Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          📊 Contest Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Week
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Votes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Avg Votes/Artwork
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {votesPerContest?.map((contest, index) => {
                const voteCount = contest.votes[0]?.count || 0;
                const avgPerArtwork = (voteCount / 6).toFixed(1);

                // Calculate trend compared to previous contest
                let trend = null;
                if (index > 0) {
                  const prevVotes =
                    votesPerContest[index - 1].votes[0]?.count || 0;
                  const change = voteCount - prevVotes;
                  trend = {
                    value: change,
                    percentage:
                      prevVotes > 0
                        ? ((change / prevVotes) * 100).toFixed(1)
                        : "0",
                    isPositive: change >= 0,
                  };
                }

                return (
                  <tr key={contest.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Week {contest.week_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{voteCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {avgPerArtwork}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {trend ? (
                        <div
                          className={`text-sm font-medium ${
                            trend.isPositive ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}{" "}
                          ({trend.percentage}%)
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">—</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
