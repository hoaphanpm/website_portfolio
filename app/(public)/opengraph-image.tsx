import {
  ogImageAlt,
  ogImageContentType,
  ogImageSize,
  renderOgImage,
} from "@/lib/og-image";

// Scoped to app/(public)/ — applies to "/" and "/work/[case_id]", not
// /admin. Metadata-only: Next.js requests this route itself to build the
// og:image tag: it is never rendered inside the visible page and never
// fetched during an ordinary homepage visit.
export const alt = ogImageAlt;
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function OpengraphImage() {
  return renderOgImage();
}
