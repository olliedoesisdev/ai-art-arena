"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import type { BlogPost } from "@/lib/blog";

const TAG_TEXT: Record<string, string> = {
  "PostgreSQL": "#34d399", "Supabase": "#34d399", "Next.js": "#a78bfa",
  "App Router": "#a78bfa", "Architecture": "#a78bfa", "Performance": "#06b6d4",
  "Security": "#f87171", "CSP": "#f87171", "Redis": "#fbbf24", "Upstash": "#fbbf24",
  "Rate Limiting": "#fbbf24", "TypeScript": "#60a5fa", "Zod": "#60a5fa",
  "NextAuth": "#f472b6", "Authentication": "#f472b6", "Inngest": "#84cc16",
  "Serverless": "#84cc16", "Vercel": "#eeeeff", "Observability": "#a78bfa",
  "Pino": "#a78bfa", "Concurrency": "#f87171", "RLS": "#34d399",
  "API Design": "#06b6d4", "Validation": "#60a5fa", "Logging": "#a78bfa",
  "Background Jobs": "#84cc16", "Core Web Vitals": "#06b6d4",
};

interface Props {
  posts: Pick<BlogPost, "slug" | "title" | "excerpt" | "tags" | "publishedAt" | "readingTime">[];
}

export function BlogCarousel({ posts }: Props) {
  const [active, setActive] = useState(0);

  // Touch / drag state
  const dragStart = useRef<number | null>(null);
  const dragging = useRef(false);

  const prev = useCallback(() => setActive((a) => (a - 1 + posts.length) % posts.length), [posts.length]);
  const next = useCallback(() => setActive((a) => (a + 1) % posts.length), [posts.length]);

  function onPointerDown(e: React.PointerEvent) {
    dragStart.current = e.clientX;
    dragging.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (dragStart.current === null) return;
    if (Math.abs(e.clientX - dragStart.current) > 4) dragging.current = true;
  }
  function onPointerUp(e: React.PointerEvent) {
    if (dragStart.current === null) return;
    const delta = e.clientX - dragStart.current;
    if (Math.abs(delta) > 40) {
      if (delta < 0) next(); else prev();
    }
    dragStart.current = null;
  }

  const post = posts[active];

  return (
    <div style={{ position: "relative" }}>
      {/* Carousel track */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ cursor: "grab", userSelect: "none", touchAction: "pan-y" }}
      >
        <Link
          href={`/blog/${post.slug}`}
          onClick={(e) => { if (dragging.current) e.preventDefault(); }}
          style={{ textDecoration: "none", display: "block" }}
        >
          <div
            style={{
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "14px",
              padding: "28px 32px",
              minHeight: "200px",
              transition: "border-color 0.2s",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Subtle gradient accent in top-right */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "200px",
                height: "200px",
                background: `radial-gradient(circle at top right, ${TAG_TEXT[post.tags[0]] ?? "#8b5cf6"}12, transparent 70%)`,
                pointerEvents: "none",
              }}
            />

            {/* Post number + read time */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "var(--color-text-dim)", letterSpacing: "0.1em" }}>
                {String(active + 1).padStart(2, "0")} / {String(posts.length).padStart(2, "0")}
              </span>
              <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "var(--color-text-dim)" }}>
                {post.readingTime} min read
              </span>
            </div>

            {/* Tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: TAG_TEXT[tag] ?? "#a78bfa",
                    background: `${TAG_TEXT[tag] ?? "#8b5cf6"}15`,
                    padding: "3px 8px",
                    borderRadius: "100px",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h3
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "1.0625rem",
                fontWeight: 700,
                color: "var(--color-text)",
                margin: "0 0 10px",
                lineHeight: 1.3,
                letterSpacing: "-0.01em",
              }}
            >
              {post.title}
            </h3>

            {/* Excerpt */}
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.65,
                margin: "0 0 20px",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {post.excerpt}
            </p>

            {/* Read link */}
            <span
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "12px",
                fontWeight: 600,
                color: TAG_TEXT[post.tags[0]] ?? "#a78bfa",
                letterSpacing: "0.06em",
              }}
            >
              Read post →
            </span>
          </div>
        </Link>
      </div>

      {/* Controls row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px" }}>

        {/* Dot indicators */}
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {posts.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Go to post ${i + 1}`}
              style={{
                width: i === active ? "20px" : "6px",
                height: "6px",
                borderRadius: "100px",
                background: i === active ? "var(--color-purple)" : "var(--color-border-mid)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "width 0.25s, background 0.25s",
              }}
            />
          ))}
        </div>

        {/* Arrow buttons */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={prev}
            aria-label="Previous post"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border-subtle)",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-mid)";
              (e.currentTarget as HTMLElement).style.color = "var(--color-text)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-subtle)";
              (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)";
            }}
          >
            ←
          </button>
          <button
            onClick={next}
            aria-label="Next post"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border-subtle)",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-mid)";
              (e.currentTarget as HTMLElement).style.color = "var(--color-text)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-subtle)";
              (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)";
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
