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
          fontWeight: 700,
          fontSize: "1.375rem",
          color: "#eeeeff",
          lineHeight: 1,
          letterSpacing: "-0.02em",
          background: "rgba(255,255,255,0.06)",
          padding: "8px 12px",
          borderRadius: "8px",
          minWidth: "48px",
        }}
      >
        {String(value).padStart(2, "0")}
      </div>
      <div
        style={{
          fontSize: "9px",
          fontFamily: "var(--font-dm-mono)",
          color: "rgba(255,255,255,0.3)",
          marginTop: "4px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function ContestTimer({ endDate }: { endDate: string }) {
  // Start null so SSR and the initial client render agree (no time value),
  // then populate after mount to avoid the hydration mismatch.
  const [t, setT] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setT(getTimeLeft(endDate));
    const id = setInterval(() => setT(getTimeLeft(endDate)), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  if (!t) return null;

  if (t.ended) {
    return (
      <span
        aria-live="polite"
        style={{
          fontFamily: "var(--font-dm-mono)",
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
    <span
      style={{
        fontFamily: "var(--font-dm-mono)",
        fontSize: "1.125rem",
        color: "rgba(255,255,255,0.2)",
        marginBottom: "14px",
        display: "block",
      }}
    >
      :
    </span>
  );

  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
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
