import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#08080e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
        }}
      >
        <div
          style={{
            fontFamily: "sans-serif",
            fontWeight: 800,
            fontSize: 18,
            color: "#8b5cf6",
            letterSpacing: "-0.04em",
          }}
        >
          A
        </div>
      </div>
    ),
    { ...size }
  );
}
