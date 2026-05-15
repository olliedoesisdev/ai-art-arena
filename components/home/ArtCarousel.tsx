"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";

interface CarouselArtwork {
  id: string;
  title: string;
  image_url: string;
}

interface ArtCarouselProps {
  artworks: CarouselArtwork[];
}

export function ArtCarousel({ artworks }: ArtCarouselProps) {
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + artworks.length) % artworks.length);
  }, [artworks.length]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % artworks.length);
  }, [artworks.length]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (artworks.length <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, artworks.length]);

  if (artworks.length === 0) return null;

  const getSlide = (offset: number) =>
    artworks[(index + offset) % artworks.length];

  const slides = mounted
    ? [0, 1, 2].map((offset) => getSlide(offset))
    : artworks.slice(0, 3);

  return (
    <div style={{ width: "100%", marginBottom: "80px" }}>
      {/* Heading */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "32px",
          padding: "0 28px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-purple-light)",
            marginBottom: "12px",
          }}
        >
          Weekly competition
        </p>
        <h2
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "var(--color-text)",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          This Week&apos;s Contest Art
        </h2>
      </div>

      {/* Carousel wrapper — full bleed */}
      <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
        {/* Image grid */}
        <div className="carousel-track" style={{ display: "grid", gap: "3px" }}>
          {slides.map((artwork, offset) => (
            <div
              key={mounted ? `${artwork.id}-${offset}` : artwork.id}
              className="group"
              style={{ position: "relative", overflow: "hidden", aspectRatio: "3 / 4" }}
            >
              <Image
                src={artwork.image_url}
                alt={artwork.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={offset === 0 || offset === 1}
                className="object-cover transition-all duration-700 group-hover:scale-105"
                style={{ transition: "opacity 0.6s ease, transform 0.5s ease" }}
              />
            </div>
          ))}
        </div>

        {/* Fade-out bottom gradient */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, transparent 55%, var(--color-bg-base) 100%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Left arrow — vertically centered on the image */}
        {mounted && artworks.length > 1 && (
          <button
            onClick={prev}
            aria-label="Previous artwork"
            style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 3,
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "rgba(8,8,14,0.72)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(139,92,246,0.25)",
              color: "var(--color-text)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.25)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.6)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(8,8,14,0.72)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.25)";
            }}
          >
            ←
          </button>
        )}

        {/* Right arrow — vertically centered on the image */}
        {mounted && artworks.length > 1 && (
          <button
            onClick={next}
            aria-label="Next artwork"
            style={{
              position: "absolute",
              right: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 3,
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "rgba(8,8,14,0.72)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(139,92,246,0.25)",
              color: "var(--color-text)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.25)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.6)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(8,8,14,0.72)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.25)";
            }}
          >
            →
          </button>
        )}

        {/* Dot indicators — above the bottom fade */}
        {mounted && (
          <div
            role="group"
            aria-label="Carousel navigation"
            style={{
              position: "absolute",
              bottom: "28px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "6px",
              zIndex: 2,
            }}
          >
            {artworks.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === index ? "20px" : "6px",
                  height: "6px",
                  borderRadius: "100px",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  background: i === index ? "var(--color-purple)" : "rgba(139,92,246,0.35)",
                  transition: "width 0.3s ease, background 0.3s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .carousel-track {
          grid-template-columns: 1fr 1fr 1fr;
        }
        @media (max-width: 1024px) {
          .carousel-track {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 640px) {
          .carousel-track {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
