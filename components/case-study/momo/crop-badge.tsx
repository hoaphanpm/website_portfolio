/**
 * Callers must pass a positioning class (`absolute`/`relative`) in
 * `className`, since the cropped <img> inside is absolutely positioned.
 *
 * Decorative, non-interactive crop of a region of an approved source image
 * (CSS only — the file is never modified). Used in the Hero for the MoMo
 * icon and the piggy-bank mascot, both taken from approved Screen 1, since
 * no standalone logo/mascot files exist. Small display sizes only: the
 * source regions are ~75px and ~160px.
 */
export function CropBadge({
  src,
  width,
  height,
  crop,
  className,
}: {
  src: string;
  width: number;
  height: number;
  crop: { x: number; y: number; w: number; h: number };
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`block overflow-hidden ${className ?? ""}`}
      style={{ aspectRatio: `${crop.w} / ${crop.h}` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading="eager"
        decoding="async"
        className="absolute max-w-none"
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
