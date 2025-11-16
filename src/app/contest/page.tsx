import ActiveContestClient from "@/components/contest/ActiveContestClient";
import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";

// Types
interface Contest {
  contest_id: string;
  week_number: number;
  start_date: string;
  end_date: string;
  time_remaining: string;
}

interface Artwork {
  id: string;
  contest_id: string;
  title: string;
  description: string | null;
  image_url: string;
  prompt: string;
  style: string | null;
  vote_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

// Fetch active contest data
async function getActiveContest() {
  // Determine the base URL based on environment
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/contests/active`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch active contest");
  }

  return res.json();
}

// Loading skeleton
function ContestSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-pulse">
          <div className="h-12 bg-slate-800 rounded-lg w-64 mx-auto mb-4" />
          <div className="h-6 bg-slate-800 rounded-lg w-48 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-slate-800/50 rounded-xl h-96 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Main contest component
async function ActiveContest() {
  const data = await getActiveContest();
  const { contest, artworks } = data as {
    contest: Contest | null;
    artworks: Artwork[];
  };

  if (!contest) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              No Active Contest
            </h1>
            <p className="text-xl text-slate-400 mb-8">
              Check back soon for the next AI art competition!
            </p>
            <Link
              href="/archive"
              className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              View Past Contests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ActiveContestClient contest={contest} initialArtworks={artworks} />;
}

// Page component
export default function ContestPage() {
  return (
    <Suspense fallback={<ContestSkeleton />}>
      <ActiveContest />
    </Suspense>
  );
}

// Metadata
export const metadata: Metadata = {
  title: "AI Art Contest - Vote Now",
  description:
    "Vote for your favorite AI-generated artwork in this week's competition",
};
