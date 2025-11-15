import ContestForm from '@/components/admin/ContestForm';

export default function NewContestPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Create New Contest</h1>
        <p className="text-slate-400 mt-2">
          Fill in the details below to create a new contest
        </p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <ContestForm mode="create" />
      </div>
    </div>
  );
}