import { createClient } from "@/lib/supabase/server";
import { Trophy, Image, Users as UsersIcon, TrendingUp } from "lucide-react";
import ProtectedLayout from "@/components/admin/ProtectedLayout";

interface DashboardStats {
  totalContests: number;
  activeContests: number;
  totalArtworks: number;
  totalVotes: number;
}

async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  // Get contest counts
  const { count: totalContests } = await supabase
    .from("contests")
    .select("*", { count: "exact", head: true });

  const { count: activeContests } = await supabase
    .from("contests")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // Get artwork count
  const { count: totalArtworks } = await supabase
    .from("artworks")
    .select("*", { count: "exact", head: true });

  // Get total votes
  const { count: totalVotes } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true });

  return {
    totalContests: totalContests || 0,
    activeContests: activeContests || 0,
    totalArtworks: totalArtworks || 0,
    totalVotes: totalVotes || 0,
  };
}

async function getRecentContests() {
  const supabase = await createClient();

  const { data: contests } = await supabase
    .from("contests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return contests || [];
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  const recentContests = await getRecentContests();

  const statCards = [
    {
      name: "Total Contests",
      value: stats.totalContests,
      icon: Trophy,
      color: "bg-blue-500",
    },
    {
      name: "Active Contests",
      value: stats.activeContests,
      icon: TrendingUp,
      color: "bg-green-500",
    },
    {
      name: "Total Artworks",
      value: stats.totalArtworks,
      icon: Image,
      color: "bg-purple-500",
    },
    {
      name: "Total Votes",
      value: stats.totalVotes,
      icon: UsersIcon,
      color: "bg-orange-500",
    },
  ];

  return (
    <ProtectedLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-2">
            Welcome to the AI Art Arena admin portal
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">{stat.name}</p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Contests */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Contests</h2>
          {recentContests.length === 0 ? (
            <p className="text-slate-400">No contests yet</p>
          ) : (
            <div className="space-y-3">
              {recentContests.map((contest) => (
                <div
                  key={contest.id}
                  className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                >
                  <div>
                    <h3 className="text-white font-medium">{contest.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Week {contest.week_number} • {contest.year}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      contest.status === "active"
                        ? "bg-green-500/20 text-green-400"
                        : contest.status === "ended"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-slate-500/20 text-slate-400"
                    }`}
                  >
                    {contest.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/contests"
              className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center font-medium"
            >
              Manage Contests
            </a>
            <a
              href="/admin/artworks"
              className="p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-center font-medium"
            >
              Manage Artworks
            </a>
            <a
              href="/admin/analytics"
              className="p-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-center font-medium"
            >
              View Analytics
            </a>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
