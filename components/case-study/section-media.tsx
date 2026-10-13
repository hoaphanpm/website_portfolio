"use client";

import { useCallback, useState } from "react";

import type { PublicSectionImage } from "@/lib/cases/public-queries";
import { cn } from "@/lib/utils";

import { ImageLightbox } from "./image-lightbox";
import { CASE_CAPTION_SIZE_CLASS } from "./typography";

/**
 * The one shared image renderer for a section's ordered image collection.
 * Every section that has images goes through this component — no
 * per-section or per-case special-casing.
 *
 * Delivery: always /media/[id] (the same authorized, RLS-checked route
 * case-hero.tsx and the admin already use), plain <img>, never a raw or
 * signed Storage URL. width/height HTML attributes come from the DB
 * (case_images.width/height) for CLS prevention and to give the browser
 * the intrinsic aspect ratio (see case-hero.tsx for why not next/image).
 *
 * Layout is decided PER IMAGE from its intrinsic aspect ratio — never from
 * the upload count:
 *
 * - "phone": portrait (height > width) app/prototype screens. A run of
 *   them renders as a grid: 1 per row on mobile, max 2 on tablet, max 3 on
 *   desktop, wrapping onto further rows. Each is shown at its own aspect
 *   ratio (never cropped or stretched).
 * - "wide": everything else (16:9 diagrams, landscape screenshots, or an
 *   image with no stored dimensions). Always exactly one per row at the
 *   section's full media width, stacked vertically.
 *
 * Images keep their stored display_order. Consecutive images of the same
 * type form one group, and each group follows its own rule, so a section
 * mixing phone screens and landscape visuals is never forced into a single
 * grid and the original order is never rearranged.
 */

type SectionMediaVariant = "default" | "experience";
type ImageKind = "phone" | "wide";

function kindOf(image: PublicSectionImage): ImageKind {
  const { width, height } = image;
  return width && height && height > width ? "phone" : "wide";
}

function ZoomButton({
  image,
  onOpen,
  children,
}: {
  image: PublicSectionImage;
  onOpen: (image: PublicSectionImage) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(image)}
      className="mx-auto block w-fit max-w-full cursor-zoom-in rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-haspopup="dialog"
      aria-label={
        image.caption ? `Enlarge image: ${image.caption}` : "Enlarge image"
      }
    >
      {children}
    </button>
  );
}

function Figure({
  image,
  kind,
  badge,
  onOpen,
}: {
  image: PublicSectionImage;
  kind: ImageKind;
  badge?: number;
  onOpen: (image: PublicSectionImage) => void;
}) {
  const hasDimensions = Boolean(image.width && image.height);
  return (
    <figure className="relative flex w-full flex-col items-center">
      {badge ? (
        <span
          aria-hidden="true"
          className="absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-background/90 text-[10px] font-medium text-foreground ring-1 ring-border"
        >
          {badge}
        </span>
      ) : null}
      <ZoomButton image={image} onOpen={onOpen}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/media/${image.id}`}
          alt={image.is_decorative ? "" : (image.alt_text ?? "")}
          width={hasDimensions ? (image.width as number) : undefined}
          height={hasDimensions ? (image.height as number) : undefined}
          loading="lazy"
          decoding="async"
          className={cn(
            "h-auto rounded-lg border border-border bg-secondary/10 object-contain",
            kind === "wide"
              ? // Full section media width; aspect ratio from width/height.
                "w-full"
              : // Natural size, scaled down only to fit the cell/viewport,
                // so the screen is never stretched.
                "w-auto max-h-[75vh] max-w-full",
          )}
        />
      </ZoomButton>
      {image.caption ? (
        <figcaption
          className={cn(
            "mt-2 max-w-prose text-center text-muted-foreground",
            CASE_CAPTION_SIZE_CLASS,
          )}
        >
          {image.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

type Group = {
  kind: ImageKind;
  items: { image: PublicSectionImage; index: number }[];
};

function groupConsecutive(images: PublicSectionImage[]): Group[] {
  const groups: Group[] = [];
  images.forEach((image, index) => {
    const kind = kindOf(image);
    const last = groups[groups.length - 1];
    if (last && last.kind === kind) last.items.push({ image, index });
    else groups.push({ kind, items: [{ image, index }] });
  });
  return groups;
}

export function SectionMedia({
  images,
  variant = "default",
}: {
  images: PublicSectionImage[];
  variant?: SectionMediaVariant;
}) {
  const [active, setActive] = useState<PublicSectionImage | null>(null);
  const close = useCallback(() => setActive(null), []);

  if (images.length === 0) {
    return null;
  }

  const sorted = [...images].sort((a, b) => a.display_order - b.display_order);
  const groups = groupConsecutive(sorted);

  return (
    <>
      <div className="my-4 space-y-8">
        {groups.map((group) =>
          group.kind === "wide" ? (
            // One per row, full width, stacked vertically.
            <div key={group.items[0].image.id} className="space-y-8">
              {group.items.map(({ image, index }) => (
                <Figure
                  key={image.id}
                  image={image}
                  kind="wide"
                  badge={variant === "experience" ? index + 1 : undefined}
                  onOpen={setActive}
                />
              ))}
            </div>
          ) : (
            // Phone screens: 1 / max 2 / max 3 per row, capped to the
            // actual count so a lone screen is centered, never stretched
            // across empty columns.
            <div
              key={group.items[0].image.id}
              className={cn(
                "mx-auto grid grid-cols-1 justify-items-center gap-6",
                group.items.length === 1
                  ? "max-w-md"
                  : group.items.length === 2
                    ? "sm:grid-cols-2 lg:max-w-4xl"
                    : "sm:grid-cols-2 lg:grid-cols-3",
              )}
            >
              {group.items.map(({ image, index }) => (
                <Figure
                  key={image.id}
                  image={image}
                  kind="phone"
                  badge={variant === "experience" ? index + 1 : undefined}
                  onOpen={setActive}
                />
              ))}
            </div>
          ),
        )}
      </div>
      {active ? <ImageLightbox image={active} onClose={close} /> : null}
    </>
  );
}
