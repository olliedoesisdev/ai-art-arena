import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Hash IP for privacy-preserving vote tracking.
// Pass null when no IP headers are present — callers that require a real IP
// (e.g. the vote endpoint) should check for null before calling hashIP.
export function hashIP(ip: string | null): string {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) throw new Error("IP_HASH_SALT env var is required");
  return crypto
    .createHash("sha256")
    .update((ip ?? "__no_ip__") + salt)
    .digest("hex")
    .slice(0, 32);
}

// Returns null when no IP headers are present (never hashes a literal "unknown").
// In local dev (no reverse proxy) falls back to loopback so votes work without
// needing x-forwarded-for set up — production always has those headers via Vercel.
export function getClientIP(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  if (realIP) return realIP;

  if (process.env.NODE_ENV === "development") {
    return "127.0.0.1";
  }

  return null;
}
