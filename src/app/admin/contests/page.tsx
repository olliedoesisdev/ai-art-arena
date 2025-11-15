import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import ContestList from '@/components/admin/ContestList';
import ProtectedLayout from '@/components/admin/ProtectedLayout';

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
  updated_at: string;
}

async function getContests(): Promise<Contest[]> {
  const supabase = await createClient();

  const { data: contests, error } = await supabase
    .from('contests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contests:', error);
    return [];
  }

  return (contests || []) as unknown as Contest[];
}

export default async function ContestsPage() {
  const contests = await getContests();

  return (
    <ProtectedLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Contests</h1>
          <p className="text-slate-400 mt-2">Manage all contests</p>
        </div>
        <Link
          href="/admin/contests/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus size={20} />
          New Contest
        </Link>
      </div>

      {/* Contest List */}
      <ContestList contests={contests} />
      </div>
    </ProtectedLayout>
  );
}