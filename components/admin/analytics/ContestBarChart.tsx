"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ContestVoteStat } from "@/lib/types";

interface Props {
  data: ContestVoteStat[];
}

export function ContestBarChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-dim)" }}>No contest data yet.</p>
      </div>
    );
  }

  const chartData = data.map((c) => ({
    week: `Wk ${c.week_number}`,
    Votes: c.total_votes,
    active: c.status === "active",
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.08)" vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 10, fill: "var(--color-text-dim)", fontFamily: "var(--font-dm-mono)" }}
          axisLine={false}
          tickLine={false}
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
          cursor={{ fill: "rgba(139,92,246,0.06)" }}
        />
        <Bar dataKey="Votes" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.active ? "var(--color-status-success)" : "rgba(139,92,246,0.5)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
