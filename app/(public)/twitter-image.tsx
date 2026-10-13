import {
  ogImageAlt,
  ogImageContentType,
  ogImageSize,
  renderOgImage,
} from "@/lib/og-image";

// Same image/content as opengraph-image.tsx, provided explicitly for
// Twitter's card rather than relying on its Open Graph fallback.
export const alt = ogImageAlt;
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function TwitterImage() {
  return renderOgImage();
}
