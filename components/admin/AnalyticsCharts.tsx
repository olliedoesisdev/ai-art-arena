"use client";

import { useMemo } from "react";

interface ContestVoteRow {
  id: string;
  week_number: number;
  votes: { count: number }[];
}

interface VoteTimeRow {
  created_at: string;
}

interface AnalyticsChartsProps {
  votesPerContest: ContestVoteRow[];
  votesOverTime: VoteTimeRow[];
}

export function AnalyticsCharts({
  votesPerContest,
  votesOverTime,
}: AnalyticsChartsProps) {
  // Process votes per contest data
  const contestData = useMemo(() => {
    return votesPerContest.map((contest) => ({
      week: `Week ${contest.week_number}`,
      votes: contest.votes[0]?.count || 0,
    }));
  }, [votesPerContest]);

  // Process votes over time (group by day)
  const dailyVotes = useMemo(() => {
    const votesByDay = new Map<string, number>();

    votesOverTime.forEach((vote) => {
      const date = new Date(vote.created_at).toLocaleDateString();
      votesByDay.set(date, (votesByDay.get(date) || 0) + 1);
    });

    return Array.from(votesByDay.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [votesOverTime]);

  // Find max votes for scaling
  const maxContestVotes = Math.max(...contestData.map((d) => d.votes), 1);
  const maxDailyVotes = Math.max(...dailyVotes.map((d) => d.count), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Votes Per Contest Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Votes Per Contest
        </h3>
        <div className="space-y-3">
          {contestData.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{item.week}</span>
                <span className="font-bold text-blue-600">{item.votes}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${(item.votes / maxContestVotes) * 100}%` }}
                />
              </div>
            </div>
          ))}
          {contestData.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No contest data yet
            </div>
          )}
        </div>
      </div>

      {/* Daily Votes Chart (Last 30 Days) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Daily Votes (Last 30 Days)
        </h3>
        <div className="space-y-2">
          {dailyVotes.slice(-14).map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">
                  {new Date(item.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="font-bold text-green-600">{item.count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(item.count / maxDailyVotes) * 100}%` }}
                />
              </div>
            </div>
          ))}
          {dailyVotes.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No voting activity in the last 30 days
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
