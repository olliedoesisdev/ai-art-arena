'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Trophy } from 'lucide-react';

interface Contest {
  id: string;
  title: string;
  week_number: number;
  year: number;
  start_date: string;
  end_date: string;
  status: string;
  winner_id: string | null;
  created_at: string;
}

interface ContestListProps {
  contests: Contest[];
}

export default function ContestList({ contests }: ContestListProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(id);

    try {
      const response = await fetch(`/api/admin/contests/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete contest');
      }

      router.refresh();
    } catch (error) {
      console.error('Error deleting contest:', error);
      alert('Failed to delete contest');
    } finally {
      setDeleting(null);
    }
  };

  if (contests.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-12 text-center">
        <Trophy className="mx-auto text-slate-600 mb-4" size={48} />
        <h3 className="text-xl font-semibold text-white mb-2">No contests yet</h3>
        <p className="text-slate-400 mb-6">
          Get started by creating your first contest
        </p>
        <a
          href="/admin/contests/new"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Create Contest
        </a>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/50 border-b border-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Title
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Week
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Dates
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Status
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {contests.map((contest) => (
              <tr key={contest.id} className="hover:bg-slate-900/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-white font-medium">{contest.title}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-300">
                    Week {contest.week_number} • {contest.year}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-300 text-sm">
                    {new Date(contest.start_date).toLocaleDateString()} -{' '}
                    {new Date(contest.end_date).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      contest.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : contest.status === 'ended'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-slate-500/20 text-slate-400'
                    }`}
                  >
                    {contest.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => router.push(`/admin/contests/${contest.id}/edit`)}
                      className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(contest.id, contest.title)}
                      disabled={deleting === contest.id}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}