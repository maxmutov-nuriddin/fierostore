import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site-config";

// Default social-share card (1200x630) — branded, used when a page has no image.
export const alt = siteConfig.fullName;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#5c0a0a",
          color: "#e7b6ba",
          fontFamily: "Georgia, 'Times New Roman', serif"
        }}
      >
        <div style={{ fontSize: 200, fontWeight: 700, letterSpacing: "0.06em" }}>FIERO</div>
        <div
          style={{
            marginTop: 8,
            fontSize: 40,
            letterSpacing: "0.5em",
            textTransform: "uppercase",
            color: "#e7b6ba",
            paddingLeft: "0.5em"
          }}
        >
          Women&apos;s Wear
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 28,
            letterSpacing: "0.04em",
            color: "rgba(231, 182, 186, 0.75)",
            fontFamily: "Helvetica, Arial, sans-serif"
          }}
        >
          Premium modern fashion boutique
        </div>
      </div>
    ),
    { ...size }
  );
}
