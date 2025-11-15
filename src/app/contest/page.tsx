import ActiveContestClient from "@/components/contest/ActiveContestClient";
import { Suspense } from "react";
import Link from "next/link";

interface Contest {
  id: string;
  title: string;
  week_number: number;
  year: number;
  start_date: string;
  end_date: string;
  status: string;
  winner_id: string | null;
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
  artist_name: string;
  position: number;
}

async function getActiveContest() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/contests/active`,
    {
      next: { revalidate: 60 },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch active contest");
  }

  return res.json();
}

function ContestSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-pulse">
          <div className="h-12 bg-slate-800 rounded-lg w-64 mx-auto mb-4" />
          <div className="h-6 bg-slate-800 rounded-lg w-48 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5].map((i) => (
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

export default function ContestPage() {
  return (
    <Suspense fallback={<ContestSkeleton />}>
      <ActiveContest />
    </Suspense>
  );
}

export const metadata = {
  title: "AI Art Contest - Vote Now",
  description:
    "Vote for your favorite AI-generated artwork in this week's competition",
};
