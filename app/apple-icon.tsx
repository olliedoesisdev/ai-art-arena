import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#08080e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            fontFamily: "sans-serif",
            fontWeight: 800,
            fontSize: 100,
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
