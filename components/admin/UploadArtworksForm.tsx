"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Contest {
  id: string;
  week_number: number;
  status: string;
  start_date: string;
  end_date: string;
}

interface ArtworkData {
  id: string;
  title: string;
  artist_prompt: string;
  image_url: string;
  file?: File;
}

interface UploadArtworksFormProps {
  contests: Contest[];
  defaultContestId?: string;
}

export function UploadArtworksForm({
  contests,
  defaultContestId,
}: UploadArtworksFormProps) {
  const router = useRouter();
  const [selectedContestId, setSelectedContestId] = useState(
    defaultContestId || contests[0]?.id || ""
  );
  const [artworks, setArtworks] = useState<ArtworkData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Add new artwork slot
  function addArtwork() {
    const newArtwork: ArtworkData = {
      id: crypto.randomUUID(),
      title: "",
      artist_prompt: "",
      image_url: "",
    };
    setArtworks([...artworks, newArtwork]);
  }

  // Remove artwork
  function removeArtwork(id: string) {
    setArtworks(artworks.filter((a) => a.id !== id));
  }

  // Update artwork field
  function updateArtwork(id: string, field: keyof ArtworkData, value: string) {
    setArtworks(
      artworks.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  }

  // Handle file selection
  function handleFileSelect(id: string, file: File | null) {
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Please upload JPG, PNG, WebP, or GIF.");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10MB.");
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    setArtworks(
      artworks.map((a) =>
        a.id === id ? { ...a, image_url: previewUrl, file } : a
      )
    );
    setError(null);
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setUploadProgress(0);

    // Validate
    if (!selectedContestId) {
      setError("Please select a contest");
      setIsSubmitting(false);
      return;
    }

    if (artworks.length === 0) {
      setError("Please add at least one artwork");
      setIsSubmitting(false);
      return;
    }

    // Validate all artworks have required fields
    for (const artwork of artworks) {
      if (!artwork.title.trim()) {
        setError("All artworks must have a title");
        setIsSubmitting(false);
        return;
      }
      if (!artwork.image_url && !artwork.file) {
        setError("All artworks must have an image");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Prepare artworks data
      const artworksToUpload = artworks.map((artwork) => ({
        contest_id: selectedContestId,
        title: artwork.title.trim(),
        artist_prompt: artwork.artist_prompt.trim() || null,
        image_url: artwork.image_url, // For now, we'll use URLs directly
      }));

      // Send to API
      const response = await fetch("/api/admin/artworks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artworks: artworksToUpload,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload artworks");
      }

      // Success! Redirect to contests page
      router.push("/admin/contests");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  }

  // Initialize with one empty artwork
  if (artworks.length === 0 && !isSubmitting) {
    addArtwork();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contest Selection */}
      <div>
        <label
          htmlFor="contest"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select Contest *
        </label>
        <select
          id="contest"
          required
          value={selectedContestId}
          onChange={(e) => setSelectedContestId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">-- Select a contest --</option>
          {contests.map((contest) => (
            <option key={contest.id} value={contest.id}>
              Week {contest.week_number} ({contest.status}) -{" "}
              {new Date(contest.start_date).toLocaleDateString()}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Choose which contest these artworks belong to
        </p>
      </div>

      {/* Artworks List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Artworks ({artworks.length})
          </h3>
          <button
            type="button"
            onClick={addArtwork}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
          >
            ➕ Add Artwork
          </button>
        </div>

        {artworks.map((artwork, index) => (
          <div
            key={artwork.id}
            className="border border-gray-300 rounded-lg p-6 space-y-4 bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">
                Artwork #{index + 1}
              </h4>
              {artworks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArtwork(artwork.id)}
                  className="text-red-600 hover:text-red-800 font-medium text-sm"
                >
                  ✕ Remove
                </button>
              )}
            </div>

            {/* Image Upload/URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image *
              </label>

              {/* Image Preview */}
              {artwork.image_url && (
                <div className="mb-4 relative w-full aspect-square max-w-xs bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={artwork.image_url}
                    alt={artwork.title || "Preview"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* URL Input */}
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={artwork.image_url}
                onChange={(e) =>
                  updateArtwork(artwork.id, "image_url", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Paste an image URL (e.g., from Unsplash, Imgur, or your own
                hosting)
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Cyberpunk City at Night"
                value={artwork.title}
                onChange={(e) =>
                  updateArtwork(artwork.id, "title", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Artist Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Prompt (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g., A futuristic cyberpunk cityscape at night with neon lights and flying cars"
                value={artwork.artist_prompt}
                onChange={(e) =>
                  updateArtwork(artwork.id, "artist_prompt", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                The prompt used to generate this artwork
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="font-medium">Error uploading artworks:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Upload Progress */}
      {isSubmitting && uploadProgress > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">
              Uploading artworks...
            </span>
            <span className="text-sm font-medium text-blue-900">
              {uploadProgress}%
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || artworks.length === 0}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting
            ? "Uploading Artworks..."
            : `Upload ${artworks.length} Artwork${
                artworks.length !== 1 ? "s" : ""
              }`}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
