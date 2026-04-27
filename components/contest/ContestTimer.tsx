"use client";

import { useState, useEffect } from "react";

interface ContestTimerProps {
  endDate: string;
}

export function ContestTimer({ endDate }: ContestTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    function calculateTimeLeft() {
      const difference = new Date(endDate).getTime() - Date.now();

      if (difference <= 0) {
        return "Contest ended";
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m remaining`;
      }
      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s remaining`;
      }
      return `${minutes}m ${seconds}s remaining`;
    }

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
      <span className="text-xl">⏱️</span>
      <span className="font-mono text-sm font-semibold text-gray-700">
        {timeLeft || "Loading..."}
      </span>
    </div>
  );
}
