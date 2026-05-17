"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  src: string;
  alt: string;
  thumbSize?: number;
  cover?: boolean;
}

export function ArtworkLightbox({ src, alt, thumbSize = 36, cover = false }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="View full size"
        style={cover ? {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          border: "none",
          padding: 0,
          cursor: "zoom-in",
          background: "transparent",
        } : {
          position: "relative",
          width: `${thumbSize}px`,
          height: `${thumbSize}px`,
          borderRadius: "6px",
          overflow: "hidden",
          background: "var(--color-bg-surface2)",
          border: "none",
          padding: 0,
          cursor: "zoom-in",
          flexShrink: 0,
        }}
      >
        {!cover && <Image src={src} alt={alt} fill sizes={`${thumbSize}px`} style={{ objectFit: "cover" }} />}
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(8,8,14,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px",
            cursor: "zoom-out",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: "relative", maxWidth: "min(90vw, 900px)", maxHeight: "85vh", width: "100%" }}
          >
            <div style={{ position: "relative", width: "100%", paddingBottom: "100%", borderRadius: "12px", overflow: "hidden" }}>
              <Image
                src={src}
                alt={alt}
                fill
                sizes="min(90vw, 900px)"
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
            <p style={{
              marginTop: "12px",
              textAlign: "center",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "11px",
              color: "var(--color-text-dim)",
              letterSpacing: "0.06em",
            }}>
              Click anywhere to close
            </p>
          </div>
        </div>
      )}
    </>
  );
}
