import { useId, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Visual primitives for the VPBank page. Colors are literal and scoped to
 * this tree (no global theme tokens are touched).
 *
 *   Phase 1 = green, Phase 2 = blue, risk/warning = red / orange.
 */

export type Tone = "green" | "blue" | "red" | "orange" | "neutral";

export const TONE = {
  green: {
    text: "text-[#4ade80]",
    solid: "text-[#22c55e]",
    border: "border-[#22c55e]/40",
    bg: "bg-[#22c55e]/10",
    chip: "bg-[#22c55e]/15 text-[#4ade80]",
  },
  blue: {
    text: "text-[#60a5fa]",
    solid: "text-[#3b82f6]",
    border: "border-[#3b82f6]/40",
    bg: "bg-[#3b82f6]/10",
    chip: "bg-[#3b82f6]/15 text-[#60a5fa]",
  },
  red: {
    text: "text-[#f87171]",
    solid: "text-[#ef4444]",
    border: "border-[#ef4444]/45",
    bg: "bg-[#ef4444]/10",
    chip: "bg-[#ef4444]/15 text-[#f87171]",
  },
  orange: {
    text: "text-[#fbbf24]",
    solid: "text-[#f59e0b]",
    border: "border-[#f59e0b]/40",
    bg: "bg-[#f59e0b]/10",
    chip: "bg-[#f59e0b]/15 text-[#fbbf24]",
  },
  neutral: {
    text: "text-[#c4cbd8]",
    solid: "text-[#a7b0c0]",
    border: "border-white/10",
    bg: "bg-white/[0.03]",
    chip: "bg-white/[0.07] text-[#c4cbd8]",
  },
} as const;

export function Card({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "min-w-0 break-words rounded-xl border p-4 sm:p-5",
        tone === "neutral"
          ? "border-white/[0.09] bg-[#0e121b]"
          : [TONE[tone].border, TONE[tone].bg],
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Pill({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
        TONE[tone].chip,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function IconCircle({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
        TONE[tone].bg,
        TONE[tone].solid,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Eyebrow({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <p className={cn("text-[11px] font-bold uppercase tracking-[0.14em]", TONE[tone].text)}>
      {children}
    </p>
  );
}

export type CropBox = { x: number; y: number; w: number; h: number };

/** Rounded closed path through `pts` (source px), normalised to `box`. */
function roundedClipPath(pts: readonly (readonly [number, number])[], box: CropBox, r: number) {
  const n = pts.length;
  const nx = (x: number) => ((x - box.x) / box.w).toFixed(5);
  const ny = (y: number) => ((y - box.y) / box.h).toFixed(5);
  let d = "";
  for (let i = 0; i < n; i++) {
    const [px, py] = pts[(i + n - 1) % n];
    const [cx, cy] = pts[i];
    const [qx, qy] = pts[(i + 1) % n];
    const dPrev = Math.hypot(px - cx, py - cy);
    const dNext = Math.hypot(qx - cx, qy - cy);
    const tPrev = Math.min(r / dPrev, 0.5);
    const tNext = Math.min(r / dNext, 0.5);
    const ax = cx + (px - cx) * tPrev;
    const ay = cy + (py - cy) * tPrev;
    const bx = cx + (qx - cx) * tNext;
    const by = cy + (qy - cy) * tNext;
    d += `${i === 0 ? "M" : "L"}${nx(ax)} ${ny(ay)} Q${nx(cx)} ${ny(cy)} ${nx(bx)} ${ny(by)} `;
  }
  return `${d}Z`;
}

/**
 * Display-only crop of an original exported image, in SOURCE pixels (CSS
 * only — the file is never modified or re-encoded). Optional `outline` is the
 * device's own outline (source px, clockwise) used to clip away the light
 * background that a rectangular crop of a tilted phone would otherwise carry;
 * it only hides pixels, never alters product UI.
 */
export function CropImage({
  src,
  width,
  height,
  crop,
  outline,
  cornerRadius = 40,
  alt = "",
  className,
  eager,
}: {
  src: string;
  width: number;
  height: number;
  crop: CropBox;
  outline?: readonly (readonly [number, number])[];
  cornerRadius?: number;
  alt?: string;
  className?: string;
  eager?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const clipId = `vp-clip-${id}`;
  return (
    <span
      className={cn("relative block overflow-hidden", className)}
      style={{
        aspectRatio: `${crop.w} / ${crop.h}`,
        clipPath: outline ? `url(#${clipId})` : undefined,
      }}
    >
      {outline ? (
        <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
          <defs>
            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
              <path d={roundedClipPath(outline, crop, cornerRadius)} />
            </clipPath>
          </defs>
        </svg>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        aria-hidden={alt ? undefined : true}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className="absolute max-w-none select-none"
        style={{
          width: `${(width / crop.w) * 100}%`,
          height: `${(height / crop.h) * 100}%`,
          left: `${(-crop.x / crop.w) * 100}%`,
          top: `${(-crop.y / crop.h) * 100}%`,
        }}
      />
    </span>
  );
}
