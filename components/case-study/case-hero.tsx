import { buttonVariants } from "@/components/ui/button";
import type { PublicCaseDetail } from "@/lib/cases/public-queries";
import { cn } from "@/lib/utils";

import {
  CASE_BODY_TEXT_CLASS,
  CASE_CONTAINER_CLASS,
} from "./typography";

/**
 * Page-level content, not a section — never rendered inside sections[],
 * matches product-requirements.md's DESIGN-TO-DATA MAPPING rule exactly.
 *
 * Visual-layout correction milestone: a single centered column at every
 * viewport (no left-text/right-image split). DOM order — eyebrow, h1,
 * hero image, summary, tags, artifact CTA — IS the visual order; nothing
 * here uses CSS `order` to fake a different reading order. Nothing is
 * invented — no company/year/role/domain/result fields exist on `cases`,
 * so none are rendered; `summary` is real stored data.
 */
const DEFAULT_ARTIFACT_LABEL = "View artifact ↗";

export function CaseHero({ caseDetail }: { caseDetail: PublicCaseDetail }) {
  // Typography correction: the eyebrow is just the real case name — no
  // generated "Case Study NN /" prefix. That prefix was UI-only (built
  // here from display_position, never stored), so removing it here is
  // the complete fix for every current and future case, regardless of
  // display_position/case count/id — nothing case-specific, nothing
  // hardcoded. The numbered section nav (section-nav.tsx) and each
  // section's own "01"-style index (case-section.tsx) are unrelated and
  // untouched — this only concerns the hero's case identifier line.
  const eyebrow = caseDetail.case_name;
  const hasArtifact = Boolean(caseDetail.artifact_url);
  const hasHeroDimensions = Boolean(
    caseDetail.heroImageWidth && caseDetail.heroImageHeight,
  );

  return (
    <section className={cn(CASE_CONTAINER_CLASS, "py-8 sm:py-12")}>
      <div className="overflow-hidden rounded-xl border border-border bg-card px-6 py-10 sm:px-10 sm:py-14">
        {/* 1. eyebrow + 2. headline — the only h1 on the page, centered,
            visually the strongest element, with a reading-width cap so a
            long title breaks into balanced lines rather than one long
            line or a left-aligned block. */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-muted-foreground">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {caseDetail.headline}
          </h1>
        </div>

        {/* 3. hero image — centered, large (up to ~80-90% of the card's
            inner width via the max-w-3xl wrapper, full width below that),
            object-contain so a wide diagram is never cropped, with a
            border/radius matching the card it sits in. Approved decision
            (Milestone 4/6, reaffirmed since): plain <img>, never a raw
            Storage URL — /media/[id] re-checks authorization on every
            request, and Next's built-in Image Optimizer's server-side
            fetch() doesn't reliably forward the original request's auth
            cookies, which would risk breaking admin draft-preview
            authorization. Eager-loaded (above the fold). width/height
            from the DB give the browser an intrinsic aspect ratio for CLS
            prevention, standing in for next/image's own mechanism. */}
        {/* Full inner width of the card; sm:-mx-4 cancels the card's extra
            sm+ padding (sm:px-10 vs a section card's 24px) so the image is
            exactly as wide as the "At a Glance" image below. */}
        {caseDetail.hero_image_id ? (
          <div className="mt-8 sm:-mx-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/media/${caseDetail.hero_image_id}`}
              alt={caseDetail.heroImageAlt ?? ""}
              loading="eager"
              width={hasHeroDimensions ? (caseDetail.heroImageWidth as number) : undefined}
              height={hasHeroDimensions ? (caseDetail.heroImageHeight as number) : undefined}
              className="h-auto w-full rounded-lg border border-border bg-secondary/10 object-contain"
            />
          </div>
        ) : null}

        {/* 4. summary — NOT centered: left-aligned to the same readable
            text column and justified, using the shared body typography. */}
        {caseDetail.summary ? (
          <p className={cn("mt-8", CASE_BODY_TEXT_CLASS)}>
            {caseDetail.summary}
          </p>
        ) : null}

        {/* 5. tags — centered, wrap naturally. */}
        {caseDetail.tags.length > 0 ? (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {caseDetail.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-3 py-1 text-[14px] font-medium sm:text-base text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {/* 6. artifact CTA — a solid, high-contrast primary button (the
            same buttonVariants() the rest of the site already uses, so
            this is the site's existing accent color, not a new one), no
            analytics event by design. Renders nothing at all — not even
            an empty wrapper — when there's no artifact_url. */}
        {hasArtifact ? (
          <div className="mt-8 flex justify-center">
            <a
              href={caseDetail.artifact_url as string}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: "default" }),
                "h-11 px-6 text-sm font-semibold",
              )}
            >
              {caseDetail.artifact_label?.trim() || DEFAULT_ARTIFACT_LABEL}
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
