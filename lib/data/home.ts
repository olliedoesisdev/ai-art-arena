import { createPublicClient } from "@/lib/supabase/server";

export interface HomeStats {
  total_votes: number;
  total_artworks: number;
  total_contests: number;
  active_id: string | null;
  active_number: number | null;
}

export interface MosaicArtwork {
  id: string;
  title: string;
  image_url: string;
}

export interface LastWinnerArtwork {
  id: string;
  title: string;
  image_url: string;
  vote_count: number;
  contest_id: string;
}

export interface HomeData {
  stats: HomeStats | null;
  mosaicArtworks: MosaicArtwork[];
  lastWinner: LastWinnerArtwork | null;
  lastWinnerContestNumber: number | null;
}

export async function getHomeData(): Promise<HomeData> {
  const supabase = createPublicClient();

  const [statsResult, mosaicResult, lastWinnerResult] = await Promise.all([
    supabase.rpc("get_homepage_stats"),

    supabase
      .from("artworks")
      .select("id, title, image_url, contest_id, contests!inner(status)")
      .eq("contests.status", "active")
      .limit(12),

    // limit(1) + maybeSingle() avoids an error when no archived contests exist yet
    supabase
      .from("contests")
      .select("id, contest_number, artworks(id, title, image_url, vote_count, contest_id)")
      .eq("status", "archived")
      .order("contest_number", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const stats =
    statsResult.data && statsResult.data.length > 0
      ? (statsResult.data[0] as HomeStats)
      : null;

  const mosaicArtworks = (mosaicResult.data ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    image_url: a.image_url,
  }));

  const lastWinnerContest = lastWinnerResult.data;
  let lastWinner: LastWinnerArtwork | null = null;
  let lastWinnerContestNumber: number | null = null;

  if (lastWinnerContest) {
    const artworks = lastWinnerContest.artworks as LastWinnerArtwork[];
    const winner = artworks?.sort((a, b) => b.vote_count - a.vote_count)[0] ?? null;
    if (winner) {
      lastWinner = winner;
      lastWinnerContestNumber = lastWinnerContest.contest_number;
    }
  }

  return { stats, mosaicArtworks, lastWinner, lastWinnerContestNumber };
}
