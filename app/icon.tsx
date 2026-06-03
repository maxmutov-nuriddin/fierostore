import { ImageResponse } from "next/og";

// Generated brand favicon — burgundy field with a pink "F" mark (matches logo).
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#5c0a0a",
          color: "#e7b6ba",
          fontSize: 360,
          fontWeight: 700,
          fontFamily: "Georgia, 'Times New Roman', serif",
          letterSpacing: "-0.04em"
        }}
      >
        F
      </div>
    ),
    { ...size }
  );
}
