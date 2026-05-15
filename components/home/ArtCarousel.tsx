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

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % artworks.length);
  }, [artworks.length]);

  useEffect(() => {
    if (artworks.length <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, artworks.length]);

  if (artworks.length === 0) return null;

  // Build a window of slides starting at index, cycling
  const getSlide = (offset: number) =>
    artworks[(index + offset) % artworks.length];

  return (
    <div style={{ position: "relative", width: "100%", marginBottom: "80px", overflow: "hidden" }}>
      {/* Desktop: 3 wide */}
      <div className="carousel-track" style={{ display: "grid", gap: "3px" }}>
        {[0, 1, 2].map((offset) => {
          const artwork = getSlide(offset);
          return (
            <div
              key={`${artwork.id}-${offset}`}
              className="group"
              style={{ position: "relative", overflow: "hidden", aspectRatio: "1 / 1" }}
            >
              <Image
                src={artwork.image_url}
                alt={artwork.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={offset === 0}
                className="object-cover transition-all duration-700 group-hover:scale-105"
                style={{ transition: "opacity 0.6s ease, transform 0.5s ease" }}
              />
            </div>
          );
        })}
      </div>

      {/* Fade-out bottom gradient */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, transparent 45%, var(--color-bg-base) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Dot indicators */}
      <div
        style={{
          position: "absolute",
          bottom: "32px",
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
              background: i === index ? "var(--color-purple)" : "rgba(139,92,246,0.25)",
              transition: "width 0.3s ease, background 0.3s ease",
            }}
          />
        ))}
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
