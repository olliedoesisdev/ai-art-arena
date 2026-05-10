"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { VoteEngagementStat } from "@/lib/types";

interface Props {
  data: VoteEngagementStat | null;
}

export function EngagementDonut({ data }: Props) {
  if (!data || data.total_votes === 0) {
    return (
      <div style={{ height: "160px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "0.875rem", color: "#3a3a58" }}>No vote data yet.</p>
      </div>
    );
  }

  const chartData = [
    { name: "Authenticated", value: data.authenticated_votes, color: "#8b5cf6" },
    { name: "Anonymous", value: data.anonymous_votes, color: "#3a3a58" },
  ];

  const authPct = ((data.authenticated_votes / data.total_votes) * 100).toFixed(0);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={42}
            outerRadius={58}
            dataKey="value"
            strokeWidth={0}
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#181820",
              border: "1px solid rgba(139,92,246,0.25)",
              borderRadius: "8px",
              fontSize: "0.8125rem",
              color: "#eeeeff",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div>
          <div style={{ fontFamily: "var(--font-dm-mono)", fontSize: "1.5rem", fontWeight: 700, color: "#8b5cf6", letterSpacing: "-0.02em" }}>
            {authPct}%
          </div>
          <div style={{ fontSize: "0.75rem", color: "#7878a0" }}>signed-in voters</div>
        </div>
        {chartData.map(({ name, value, color }) => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, flexShrink: 0 }} />
            <span style={{ fontSize: "0.75rem", color: "#7878a0" }}>{name}</span>
            <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.75rem", color: "#eeeeff", marginLeft: "auto" }}>
              {value.toLocaleString()}
            </span>
          </div>
        ))}
        <div style={{ paddingTop: "4px", borderTop: "1px solid rgba(139,92,246,0.1)" }}>
          <div style={{ fontSize: "0.75rem", color: "#7878a0" }}>Unique IPs</div>
          <div style={{ fontFamily: "var(--font-dm-mono)", fontSize: "0.875rem", color: "#eeeeff", fontWeight: 600 }}>
            {data.unique_ips.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
