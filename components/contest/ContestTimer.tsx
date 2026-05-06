"use client";

import { useState, useEffect } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  ended: boolean;
}

function getTimeLeft(endDate: string): TimeLeft {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    ended: false,
  };
}

function Cell({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontFamily: "var(--font-dm-mono)",
          fontWeight: 500,
          fontSize: "1.5rem",
          color: "#eeeeff",
          lineHeight: 1,
          minWidth: "2.5ch",
        }}
      >
        {String(value).padStart(2, "0")}
      </div>
      <div
        style={{
          fontSize: "9px",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#3a3a58",
          marginTop: "4px",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function ContestTimer({ endDate }: { endDate: string }) {
  const [t, setT] = useState<TimeLeft>(() => getTimeLeft(endDate));

  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft(endDate)), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  if (t.ended) {
    return (
      <span
        style={{
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: "#7878a0",
          letterSpacing: "0.05em",
        }}
      >
        Contest ended
      </span>
    );
  }

  const sep = (
    <span style={{ fontFamily: "var(--font-dm-mono)", color: "#3a3a58", fontSize: "1.25rem" }}>
      :
    </span>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <Cell value={t.days} label="days" />
      {sep}
      <Cell value={t.hours} label="hrs" />
      {sep}
      <Cell value={t.minutes} label="min" />
      {sep}
      <Cell value={t.seconds} label="sec" />
    </div>
  );
}
