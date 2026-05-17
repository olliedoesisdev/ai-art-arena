import { createAdminClient } from "@/lib/supabase/server";
import type {
  AnalyticsSummary,
  DailyVoteStat,
  ContestVoteStat,
  VoteEngagementStat,
  TopArtwork,
} from "@/lib/types";

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const supabase = createAdminClient();

  const [
    { count: totalVotes },
    { count: totalArtworks },
    { count: totalContests },
    { data: dailyVotesRaw },
    { data: contestStatsRaw },
    { data: engagementRaw },
    { data: topArtworksRaw },
  ] = await Promise.all([
    supabase.from("votes").select("id", { count: "exact", head: true }),
    supabase.from("artworks").select("id", { count: "exact", head: true }),
    supabase.from("contests").select("id", { count: "exact", head: true }),
    supabase.from("daily_vote_stats").select("day, vote_count"),
    supabase.from("contest_vote_stats").select("*").order("contest_number", { ascending: true }),
    supabase.from("vote_engagement_stats").select("*").single(),
    supabase
      .from("artworks")
      .select("id, title, image_url, vote_count, contests(contest_number)")
      .order("vote_count", { ascending: false })
      .limit(10),
  ]);

  const tv = totalVotes ?? 0;
  const ta = totalArtworks ?? 0;
  const tc = totalContests ?? 0;

  const topArtworks: TopArtwork[] = (topArtworksRaw ?? []).map((a) => {
    const contests = a.contests as { contest_number: number } | { contest_number: number }[] | null;
    const num = Array.isArray(contests)
      ? (contests[0]?.contest_number ?? null)
      : (contests?.contest_number ?? null);
    return {
      id: a.id,
      title: a.title,
      image_url: a.image_url,
      vote_count: a.vote_count,
      contest_number: num,
    };
  });

  return {
    totalVotes: tv,
    totalArtworks: ta,
    totalContests: tc,
    avgVotesPerContest: tc > 0 ? tv / tc : 0,
    avgVotesPerArtwork: ta > 0 ? tv / ta : 0,
    engagement: (engagementRaw as VoteEngagementStat | null) ?? null,
    dailyVotes: fillMissingDays((dailyVotesRaw ?? []) as DailyVoteStat[], 90),
    contestStats: (contestStatsRaw ?? []) as ContestVoteStat[],
    topArtworks,
  };
}

function fillMissingDays(data: DailyVoteStat[], days: number): DailyVoteStat[] {
  const map = new Map(data.map((d) => [d.day.slice(0, 10), d.vote_count]));
  const result: DailyVoteStat[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const day = date.toISOString().slice(0, 10);
    result.push({ day, vote_count: map.get(day) ?? 0 });
  }
  return result;
}
