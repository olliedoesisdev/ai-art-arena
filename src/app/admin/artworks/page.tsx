import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import ArtworkList from '@/components/admin/ArtworkList';
import ProtectedLayout from '@/components/admin/ProtectedLayout';

async function getArtworks() {
  const supabase = await createClient();

  const { data: artworks, error } = await supabase
    .from('artworks')
    .select(`
      *,
      contests:contest_id (
        title,
        week_number,
        year
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching artworks:', error);
    return [];
  }

  return artworks || [];
}

export default async function ArtworksPage() {
  const artworks = await getArtworks();

  return (
    <ProtectedLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Artworks</h1>
          <p className="text-slate-400 mt-2">Manage all artworks</p>
        </div>
        <Link
          href="/admin/artworks/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus size={20} />
          New Artwork
        </Link>
      </div>

      {/* Artwork List */}
      <ArtworkList artworks={artworks} />
      </div>
    </ProtectedLayout>
  );
}