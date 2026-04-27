import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Archive - AI Art Arena",
  description: "Browse past AI art contests and winners",
};

export default async function ArchivePage() {
  const supabase = await createClient();

  // Get all archived contests
  const { data: contests } = await supabase
    .from("contests")
    .select(
      `
      id,
      week_number,
      start_date,
      end_date,
      artworks (
        id,
        image_url,
        title,
        vote_count
      )
    `
    )
    .eq("status", "archived")
    .order("week_number", { ascending: false });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
          Contest Archive
        </h1>

        {!contests || contests.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600">
              No archived contests yet. Check back after the first contest ends!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contests.map((contest: any) => {
              // Find winner (highest vote count)
              const winner = contest.artworks?.reduce(
                (prev: any, current: any) =>
                  current.vote_count > prev.vote_count ? current : prev
              );

              return (
                <Link
                  key={contest.id}
                  href={`/contest/${contest.id}`}
                  className="group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  {winner && (
                    <div className="relative aspect-square">
                      <Image
                        src={winner.image_url}
                        alt={winner.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full font-bold text-sm">
                        🏆 Winner
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      Week {contest.week_number}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {new Date(contest.end_date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    {winner && (
                      <p className="text-sm font-medium text-gray-700">
                        {winner.title} - {winner.vote_count} votes
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
