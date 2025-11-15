'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface Artwork {
  id: string;
  contest_id: string;
  title: string;
  description: string | null;
  image_url: string;
  artist_name: string;
  vote_count: number;
  created_at: string;
  contests?: {
    title: string;
    week_number: number;
    year: number;
  };
}

interface ArtworkListProps {
  artworks: Artwork[];
}

export default function ArtworkList({ artworks }: ArtworkListProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(id);

    try {
      const response = await fetch(`/api/admin/artworks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete artwork');
      }

      router.refresh();
    } catch (error) {
      console.error('Error deleting artwork:', error);
      alert('Failed to delete artwork');
    } finally {
      setDeleting(null);
    }
  };

  if (artworks.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-12 text-center">
        <ImageIcon className="mx-auto text-slate-600 mb-4" size={48} />
        <h3 className="text-xl font-semibold text-white mb-2">No artworks yet</h3>
        <p className="text-slate-400 mb-6">
          Get started by adding your first artwork
        </p>
        <a
          href="/admin/artworks/new"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Add Artwork
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {artworks.map((artwork) => (
        <div
          key={artwork.id}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-colors"
        >
          {/* Image */}
          <div className="relative aspect-square bg-slate-900">
            <Image
              src={artwork.image_url}
              alt={artwork.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="text-white font-semibold mb-1">{artwork.title}</h3>
            <p className="text-slate-400 text-sm mb-2">by {artwork.artist_name}</p>

            {artwork.contests && (
              <p className="text-slate-500 text-xs mb-3">
                Week {artwork.contests.week_number} • {artwork.contests.year}
              </p>
            )}

            <div className="flex items-center justify-between mb-4">
              <span className="text-blue-400 font-medium">
                {artwork.vote_count} votes
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/admin/artworks/${artwork.id}/edit`)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(artwork.id, artwork.title)}
                disabled={deleting === artwork.id}
                className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}