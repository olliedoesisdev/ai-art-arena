import { createClient } from '@/lib/supabase/server';
import ProtectedLayout from '@/components/admin/ProtectedLayout';
import { Users, Mail, Calendar } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  totalUsers: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
}

async function getUsersData() {
  const supabase = await createClient();

  // Fetch all users
  const { data: users, error: usersError } = await supabase
    .from('public_users')
    .select('*')
    .order('created_at', { ascending: false });

  if (usersError) {
    console.error('Error fetching users:', usersError);
    return { users: [], stats: { totalUsers: 0, newUsersLast7Days: 0, newUsersLast30Days: 0 } };
  }

  // Calculate stats
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const newUsersLast7Days = users?.filter(
    (u) => new Date(u.created_at) >= sevenDaysAgo
  ).length || 0;

  const newUsersLast30Days = users?.filter(
    (u) => new Date(u.created_at) >= thirtyDaysAgo
  ).length || 0;

  const stats: UserStats = {
    totalUsers: users?.length || 0,
    newUsersLast7Days,
    newUsersLast30Days,
  };

  return {
    users: (users || []) as User[],
    stats,
  };
}

export default async function UsersPage() {
  const { users, stats } = await getUsersData();

  const statCards = [
    {
      name: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'New (7 days)',
      value: stats.newUsersLast7Days,
      icon: Calendar,
      color: 'bg-green-500',
    },
    {
      name: 'New (30 days)',
      value: stats.newUsersLast30Days,
      icon: Calendar,
      color: 'bg-purple-500',
    },
  ];

  return (
    <ProtectedLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Users</h1>
          <p className="text-slate-400 mt-2">
            Manage registered voters and users
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* Users Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">All Users</h2>
          {users.length === 0 ? (
            <p className="text-slate-400">No users yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                      Registered
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                      Last Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="px-4 py-3 text-white">
                        {user.name || user.email.split('@')[0]}
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-mono text-sm">
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-slate-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-sm">
                        {new Date(user.created_at).toLocaleDateString()} at{' '}
                        {new Date(user.created_at).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-sm">
                        {new Date(user.updated_at).toLocaleDateString()}
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
