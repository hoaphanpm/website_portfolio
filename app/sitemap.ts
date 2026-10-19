import type { MetadataRoute } from "next";

import { PUBLIC_PATHS, SITE_URL } from "@/lib/seo";

// Static public routes only. CMS cases are deliberately not listed (no
// database access here, so draft/unpublished content can never leak).
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
  }));
}
