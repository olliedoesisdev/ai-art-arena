import ArtworkForm from '@/components/admin/ArtworkForm';

export default function NewArtworkPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Add New Artwork</h1>
        <p className="text-slate-400 mt-2">
          Fill in the details below to add a new artwork to a contest
        </p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <ArtworkForm mode="create" />
      </div>
    </div>
  );
}