import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ArtworkForm from '@/components/admin/ArtworkForm';
import ProtectedLayout from '@/components/admin/ProtectedLayout';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getArtwork(id: string) {
  const supabase = await createClient();

  const { data: artwork, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !artwork) {
    console.error('Error fetching artwork:', error);
    return null;
  }

  return artwork;
}

export default async function EditArtworkPage({ params }: PageProps) {
  const { id } = await params;
  const artwork = await getArtwork(id);

  if (!artwork) {
    notFound();
  }

  return (
    <ProtectedLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Artwork</h1>
          <p className="text-slate-400 mt-2">
            Update the details for "{artwork.title}"
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <ArtworkForm mode="edit" artwork={artwork} />
        </div>
      </div>
    </ProtectedLayout>
  );
}
