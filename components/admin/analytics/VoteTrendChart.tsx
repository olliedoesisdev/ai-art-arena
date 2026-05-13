"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DailyVoteStat } from "@/lib/types";

interface Props {
  data: DailyVoteStat[];
  days?: 7 | 30 | 90;
}

function formatDay(day: string, totalDays: number): string {
  const date = new Date(day + "T00:00:00");
  if (totalDays <= 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function VoteTrendChart({ data, days = 30 }: Props) {
  const sliced = days === 90 ? data : data.slice(-(days));
  const hasVotes = sliced.some((d) => d.vote_count > 0);

  const chartData = sliced.map((d) => ({
    day: formatDay(d.day, days),
    Votes: d.vote_count,
    rawDay: d.day,
  }));

  if (!hasVotes) {
    return (
      <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-dim)" }}>No votes in this period.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="voteGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-purple)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--color-purple)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.08)" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 10, fill: "var(--color-text-dim)", fontFamily: "var(--font-dm-mono)" }}
          axisLine={false}
          tickLine={false}
          interval={days === 7 ? 0 : Math.floor(sliced.length / 6)}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--color-text-dim)", fontFamily: "var(--font-dm-mono)" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-bg-surface2)",
            border: "1px solid rgba(139,92,246,0.25)",
            borderRadius: "8px",
            fontSize: "0.8125rem",
            color: "var(--color-text)",
          }}
          labelStyle={{ color: "var(--color-text-muted)", marginBottom: "4px" }}
          cursor={{ stroke: "rgba(139,92,246,0.3)", strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="Votes"
          stroke="var(--color-purple)"
          strokeWidth={2}
          fill="url(#voteGradient)"
          dot={false}
          activeDot={{ r: 4, fill: "var(--color-purple)", stroke: "var(--color-bg-surface2)", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
