'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Contest {
  id: string;
  title: string;
  week_number: number;
  year: number;
}

interface Artwork {
  id?: string;
  contest_id: string;
  title: string;
  artist_name: string;
  description: string;
  image_url: string;
  prompt: string;
  style: string;
  position: number;
}

interface ArtworkFormProps {
  artwork?: Artwork;
  mode: 'create' | 'edit';
}

export default function ArtworkForm({ artwork, mode }: ArtworkFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contests, setContests] = useState<Contest[]>([]);

  const [formData, setFormData] = useState<Artwork>({
    contest_id: artwork?.contest_id || '',
    title: artwork?.title || '',
    artist_name: artwork?.artist_name || '',
    description: artwork?.description || '',
    image_url: artwork?.image_url || '',
    prompt: artwork?.prompt || '',
    style: artwork?.style || '',
    position: artwork?.position || 0,
  });

  // Fetch contests on mount
  useEffect(() => {
    async function fetchContests() {
      try {
        const response = await fetch('/api/admin/contests');
        const data = await response.json();
        setContests(data.contests || []);
      } catch (error) {
        console.error('Error fetching contests:', error);
      }
    }
    fetchContests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url =
        mode === 'create'
          ? '/api/admin/artworks'
          : `/api/admin/artworks/${artwork?.id}`;

      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save artwork');
      }

      router.push('/admin/artworks');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contest Selection */}
      <div>
        <label htmlFor="contest_id" className="block text-sm font-medium text-slate-300 mb-2">
          Contest *
        </label>
        <select
          id="contest_id"
          value={formData.contest_id}
          onChange={(e) =>
            setFormData({ ...formData, contest_id: e.target.value })
          }
          required
          className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a contest</option>
          {contests.map((contest) => (
            <option key={contest.id} value={contest.id}>
              Week {contest.week_number} • {contest.year} - {contest.title}
            </option>
          ))}
        </select>
      </div>

      {/* Title and Artist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
            Artwork Title *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digital Sunset"
          />
        </div>

        <div>
          <label htmlFor="artist_name" className="block text-sm font-medium text-slate-300 mb-2">
            Artist Name *
          </label>
          <input
            id="artist_name"
            type="text"
            value={formData.artist_name}
            onChange={(e) =>
              setFormData({ ...formData, artist_name: e.target.value })
            }
            required
            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
          />
        </div>
      </div>

      {/* Image URL */}
      <div>
        <label htmlFor="image_url" className="block text-sm font-medium text-slate-300 mb-2">
          Image URL *
        </label>
        <input
          id="image_url"
          type="url"
          value={formData.image_url}
          onChange={(e) =>
            setFormData({ ...formData, image_url: e.target.value })
          }
          required
          className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="A beautiful digital artwork..."
        />
      </div>

      {/* Prompt and Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">
            AI Prompt
          </label>
          <textarea
            id="prompt"
            value={formData.prompt}
            onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="A scenic landscape at sunset..."
          />
        </div>

        <div>
          <label htmlFor="style" className="block text-sm font-medium text-slate-300 mb-2">
            Style
          </label>
          <input
            id="style"
            type="text"
            value={formData.style}
            onChange={(e) => setFormData({ ...formData, style: e.target.value })}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Photorealistic, Abstract, etc."
          />
        </div>
      </div>

      {/* Position */}
      <div>
        <label htmlFor="position" className="block text-sm font-medium text-slate-300 mb-2">
          Display Position
        </label>
        <input
          id="position"
          type="number"
          min="0"
          value={formData.position}
          onChange={(e) =>
            setFormData({ ...formData, position: parseInt(e.target.value) || 0 })
          }
          className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-slate-500 text-sm mt-1">
          Lower numbers appear first (0 = highest priority)
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Artwork' : 'Update Artwork'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}