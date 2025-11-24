import { createClient } from '@/lib/supabase/server';
import { TrendingUp, Users, Heart, Trophy } from 'lucide-react';
import ProtectedLayout from '@/components/admin/ProtectedLayout';
import { ArtworkVoteDetails } from '@/components/admin/ArtworkVoteDetails';

async function getAnalytics() {
  const supabase = await createClient();

  // Total votes
  const { count: totalVotes } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true });

  // Unique voters (approximate - just total votes for now)
  // Note: Actual unique voter tracking requires ip_hash column access
  const uniqueVoterCount = totalVotes || 0;

  // Top artworks by votes
  const { data: topArtworks } = await supabase
    .from('artworks')
    .select('id, title, artist_name, vote_count, image_url')
    .order('vote_count', { ascending: false })
    .limit(10);

  // Recent votes with user information
  const { data: recentVotes } = await supabase
    .from('votes')
    .select(`
      id,
      voted_at,
      vote_date,
      user_id,
      artworks:artwork_id (
        id,
        title,
        artist_name
      ),
      public_users:user_id (
        email,
        name
      )
    `)
    .order('voted_at', { ascending: false })
    .limit(50);

  // Votes by day (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentVotesData } = await supabase
    .from('votes')
    .select('voted_at')
    .gte('voted_at', sevenDaysAgo.toISOString());

  return {
    totalVotes: totalVotes || 0,
    uniqueVoters: uniqueVoterCount,
    topArtworks: topArtworks || [],
    recentVotes: recentVotes || [],
    votesLast7Days: recentVotesData?.length || 0,
  };
}

export default async function AnalyticsPage() {
  const analytics = await getAnalytics();

  const stats = [
    {
      name: 'Total Votes',
      value: analytics.totalVotes,
      icon: Heart,
      color: 'bg-red-500',
    },
    {
      name: 'Unique Voters',
      value: analytics.uniqueVoters,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Votes (7 days)',
      value: analytics.votesLast7Days,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      name: 'Top Artworks',
      value: analytics.topArtworks.length,
      icon: Trophy,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <ProtectedLayout>
      <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 mt-2">
          View voting statistics and trends
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
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

      {/* Top Artworks */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Top Artworks by Votes</h2>
        {analytics.topArtworks.length === 0 ? (
          <p className="text-slate-400">No artworks yet</p>
        ) : (
          <div className="space-y-3">
            {analytics.topArtworks.map((artwork, index) => (
              <div
                key={artwork.id}
                className="p-4 bg-slate-900/50 rounded-lg border border-slate-700"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 rounded-full text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{artwork.title}</h3>
                    <p className="text-sm text-slate-400">by {artwork.artist_name}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <ArtworkVoteDetails
                      artworkId={artwork.id}
                      artworkTitle={artwork.title}
                      voteCount={artwork.vote_count}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Votes */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Votes</h2>
        {analytics.recentVotes.length === 0 ? (
          <p className="text-slate-400">No votes yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                    Artwork
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                    Voter
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {analytics.recentVotes.map((vote: any) => (
                  <tr key={vote.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-4 py-3 text-white">
                      {vote.artworks?.title || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {vote.public_users?.name || vote.public_users?.email?.split('@')[0] || 'Anonymous'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm font-mono">
                      {vote.public_users?.email || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm">
                      {vote.vote_date ? new Date(vote.vote_date).toLocaleDateString() : new Date(vote.voted_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm">
                      {new Date(vote.voted_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </ProtectedLayout>
  );
}