import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/lib/site-config";

/**
 * Milestone 11 Phase B: "Recent Writing" — exactly the 2 manually curated
 * articles from lib/site-config.ts, in order. No runtime Substack fetch,
 * no CMS, no local /writing route. The "Read ↗" link is a plain <a> (not
 * HighIntentLink) — it's not on the approved high-intent action/location
 * lists, so it fires no analytics event. The illustration is never its
 * own link — only "Read ↗" navigates, avoiding a second, confusing link
 * target inside the same card.
 *
 * Phase B follow-up: "View all writing ↗" lives in the section header
 * (upper-right on desktop, wrapping under the heading on narrow screens).
 *
 * Phase B follow-up #3 (corrected): each card's thumbnail is now a
 * fixed-size, non-growing wrapper (144px desktop / 128px small-tablet,
 * both at the source images' own ~1200:630 aspect ratio) with
 * width:100%/height:100%/object-fit:contain inside it — never `fill`, no
 * absolute positioning. Because both production illustrations already
 * share that same aspect ratio, `contain` shows the complete image with
 * no visible letterboxing. Identical wrapper/image classes are reused for
 * both cards via one shared constant string.
 */

const THUMBNAIL_WRAPPER_CLASS =
  "aspect-[1200/630] w-36 shrink-0 self-end overflow-hidden rounded-md sm:w-32 sm:self-start lg:w-36";
const THUMBNAIL_IMAGE_CLASS = "h-full w-full object-contain";
const THUMBNAIL_SIZES = "(min-width: 1024px) 144px, (min-width: 640px) 128px, 144px";

export function Writing() {
  const { eyebrow, heading, articles, ctaLabel } = siteConfig.writing;
  const { substackUrl } = siteConfig.social;

  return (
    <section id="writing" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-2xl font-semibold">{heading}</h2>
        </div>
        <a
          href={substackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {ctaLabel}
        </a>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {articles.map((article) => (
          <Card key={article.href}>
            <CardContent className="flex flex-col-reverse gap-4 p-6 sm:flex-row sm:items-start sm:gap-5">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium tracking-wide text-muted-foreground">
                  {article.category}
                </p>
                <h3 className="mt-2 line-clamp-3 font-semibold">
                  {article.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {article.excerpt}
                </p>
                <a
                  href={article.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Read ↗
                </a>
              </div>

              <div className={THUMBNAIL_WRAPPER_CLASS}>
                <Image
                  src={article.image.src}
                  alt={article.image.alt}
                  sizes={THUMBNAIL_SIZES}
                  loading="lazy"
                  className={THUMBNAIL_IMAGE_CLASS}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
