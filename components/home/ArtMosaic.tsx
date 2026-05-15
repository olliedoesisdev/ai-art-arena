import Image from "next/image";

interface MosaicArtwork {
  id: string;
  title: string;
  image_url: string;
}

export function ArtMosaic({ artworks }: { artworks: MosaicArtwork[] }) {
  if (artworks.length === 0) return null;

  // Fill to 6 slots by repeating if needed
  const slots = Array.from({ length: 6 }, (_, i) => artworks[i % artworks.length]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        marginBottom: "80px",
      }}
    >
      {/* Capped at 1140px and centred so it doesn't bleed edge-to-edge on wide screens */}
      <div
        style={{
          maxWidth: "1140px",
          margin: "0 auto",
          borderRadius: "12px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "3px",
            height: "280px",
          }}
        >
          {slots.map((artwork, i) => (
            <div
              key={`${artwork.id}-${i}`}
              className="group"
              style={{ position: "relative", overflow: "hidden" }}
            >
              <Image
                src={artwork.image_url}
                alt={artwork.title}
                fill
                sizes="(max-width: 768px) 50vw, 17vw"
                priority={i < 2}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ))}
        </div>

        {/* Fade-to-page-bg gradient mask on bottom */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, transparent 40%, var(--color-bg-base) 100%)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}
