import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Share2, Trophy, Calendar, User, Wand2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui";
import { ArtworkVoteClient } from "./ArtworkVoteClient";
import type { Artwork } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Fetch artwork and contest data
async function getArtworkData(artworkId: string) {
  try {
    const supabase = await createClient();

    // Fetch artwork
    const { data: artwork, error: artworkError } = await supabase
      .from("artworks")
      .select("*")
      .eq("id", artworkId)
      .single();

    if (artworkError || !artwork) {
      return null;
    }

    // Fetch contest details
    const { data: contest, error: contestError } = await supabase
      .from("contests")
      .select("*")
      .eq("id", artwork.contest_id)
      .single();

    if (contestError) {
      console.error("Error fetching contest:", contestError);
    }

    // Check if contest is active
    const isActive = contest?.status === "active";

    // Check if this artwork is a winner
    const isWinner = artwork.position === 1 && contest?.status === "ended";

    return {
      artwork: artwork as Artwork,
      contest,
      isActive,
      isWinner,
    };
  } catch (error) {
    console.error("Error fetching artwork data:", error);
    return null;
  }
}

// Format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Share functionality
async function handleShare(artwork: Artwork) {
  if (typeof window !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title: artwork.title,
        text: `Check out "${artwork.title}" by ${artwork.artist_name} in the AI Art Arena!`,
        url: window.location.href,
      });
    } catch (err) {
      console.log("Share cancelled or failed:", err);
    }
  } else {
    // Fallback: copy to clipboard
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
    }
  }
}

// Loading skeleton
function ArtworkSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1929] via-slate-900 to-[#0A1929]">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 animate-pulse">
          <div className="h-10 bg-slate-800 rounded-lg w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-square bg-slate-800 rounded-xl animate-pulse" />
          <div className="space-y-6">
            <div className="h-12 bg-slate-800 rounded-lg w-3/4 animate-pulse" />
            <div className="h-6 bg-slate-800 rounded-lg w-1/2 animate-pulse" />
            <div className="h-32 bg-slate-800 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Main artwork detail component
async function ArtworkDetail({ params }: PageProps) {
  const { id } = await params;
  const data = await getArtworkData(id);

  if (!data) {
    notFound();
  }

  const { artwork, contest, isActive, isWinner } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1929] via-slate-900 to-[#0A1929]">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <Link
          href="/contest"
          className="inline-flex items-center gap-2 text-[#4B9CD3] hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">Back to Contest</span>
        </Link>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Section */}
          <div className="relative">
            {/* Winner Badge */}
            {isWinner && (
              <div className="absolute left-4 top-4 z-10">
                <Badge variant="warning" className="flex items-center gap-1.5 text-base px-4 py-2">
                  <Trophy className="h-5 w-5" />
                  Contest Winner
                </Badge>
              </div>
            )}

            {/* Artwork Image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-800 shadow-2xl">
              <Image
                src={artwork.image_url}
                alt={artwork.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                quality={95}
                priority
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                {artwork.title}
              </h1>

              {/* Artist */}
              <div className="flex items-center gap-3 text-[#4B9CD3]">
                <User className="h-5 w-5" />
                <p className="text-xl font-medium">
                  {artwork.artist_name}
                </p>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap gap-4 text-slate-400">
                {/* Date */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{formatDate(artwork.created_at)}</span>
                </div>

                {/* Vote Count */}
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm">
                    {artwork.vote_count} {artwork.vote_count === 1 ? "vote" : "votes"}
                  </span>
                </div>
              </div>

              {/* Description */}
              {artwork.description && (
                <div className="prose prose-invert max-w-none">
                  <p className="text-lg text-slate-300 leading-relaxed">
                    {artwork.description}
                  </p>
                </div>
              )}

              {/* Prompt */}
              {artwork.prompt && (
                <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6 space-y-3">
                  <div className="flex items-center gap-2 text-[#4B9CD3]">
                    <Wand2 className="h-5 w-5" />
                    <h2 className="text-lg font-semibold">AI Prompt</h2>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {artwork.prompt}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Vote Button - Client Component */}
              <div className="flex-1">
                <ArtworkVoteClient
                  artwork={artwork}
                  contestId={artwork.contest_id}
                  isActive={isActive}
                />
              </div>

              {/* Share Button */}
              <button
                onClick={() => handleShare(artwork)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
                aria-label="Share artwork"
              >
                <Share2 className="h-5 w-5" />
                <span className="font-medium">Share</span>
              </button>
            </div>

            {/* Contest Info */}
            {contest && (
              <div className="rounded-xl bg-slate-800/30 border border-slate-700/30 p-4">
                <p className="text-sm text-slate-400">
                  Part of{" "}
                  <Link
                    href="/contest"
                    className="text-[#4B9CD3] hover:text-white transition-colors font-medium"
                  >
                    {contest.title || `Week ${contest.week_number} Contest`}
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Page component
export default function ArtworkPage({ params }: PageProps) {
  return (
    <Suspense fallback={<ArtworkSkeleton />}>
      <ArtworkDetail params={params} />
    </Suspense>
  );
}

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getArtworkData(id);

  if (!data) {
    return {
      title: "Artwork Not Found",
    };
  }

  const { artwork } = data;

  return {
    title: `${artwork.title} by ${artwork.artist_name} - AI Art Arena`,
    description: artwork.description || artwork.prompt || `AI-generated artwork by ${artwork.artist_name}`,
    openGraph: {
      title: artwork.title,
      description: artwork.description || undefined,
      images: [artwork.image_url],
    },
  };
}
