import { ImageResponse } from "next/og";

/**
 * Shared generator behind app/(public)/opengraph-image.tsx and
 * app/(public)/twitter-image.tsx (Milestone 11 Phase B). Typographic only —
 * no portrait, no external font, image, or API fetch. Reused by both files
 * rather than duplicated, so the two stay in sync.
 */

export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = "image/png";
export const ogImageAlt = "Hoa Phan — Product Manager portfolio";

const LIGHT = {
  background: "#ffffff",
  name: "#0a0a0a",
  title: "#171717",
  tagline: "#737373",
  border: "#e5e5e5",
};

export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundColor: LIGHT.background,
          padding: "96px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 64,
            height: 4,
            backgroundColor: LIGHT.title,
            marginBottom: 40,
          }}
        />
        <div
          style={{
            fontSize: 68,
            fontWeight: 700,
            color: LIGHT.name,
            letterSpacing: "-0.02em",
          }}
        >
          Hoa Phan
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 36,
            fontWeight: 600,
            color: LIGHT.title,
          }}
        >
          Product Manager
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 28,
            color: LIGHT.tagline,
            maxWidth: 840,
          }}
        >
          Turning complex problems into clear product decisions.
        </div>
      </div>
    ),
    { ...ogImageSize },
  );
}
