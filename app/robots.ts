import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Admin, auth and preview URLs are never indexed.
        disallow: ["/admin", "/*?preview="],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
