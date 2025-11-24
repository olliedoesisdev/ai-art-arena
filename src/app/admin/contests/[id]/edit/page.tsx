import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ContestForm from '@/components/admin/ContestForm';
import ProtectedLayout from '@/components/admin/ProtectedLayout';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getContest(id: string) {
  const supabase = await createClient();

  const { data: contest, error } = await supabase
    .from('contests')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !contest) {
    console.error('Error fetching contest:', error);
    return null;
  }

  return contest;
}

export default async function EditContestPage({ params }: PageProps) {
  const { id } = await params;
  const contest = await getContest(id);

  if (!contest) {
    notFound();
  }

  return (
    <ProtectedLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Contest</h1>
          <p className="text-slate-400 mt-2">
            Update the details for {contest.title}
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <ContestForm mode="edit" contest={contest} />
        </div>
      </div>
    </ProtectedLayout>
  );
}
