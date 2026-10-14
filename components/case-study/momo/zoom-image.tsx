"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

/**
 * Display-only crop rectangle in SOURCE pixels. Applied with CSS, so the
 * file on disk is never modified; the enlarged view always shows the
 * complete original. Used here only to trim the dark margin and baked-in
 * annotation band around a device screen — never product UI.
 */
export type ImageCrop = {
  x: number;
  y: number;
  w: number;
  h: number;
  /** CSS border-radius (percent form) matching the device's own corners. */
  radius?: string;
};

type ZoomImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Used for the enlarge button's accessible name. */
  label: string;
  crop?: ImageCrop;
  /** Above-the-fold images: load immediately instead of lazily. */
  eager?: boolean;
  /** Extra classes for the visible image frame (shadow, ring…). */
  frameClassName?: string;
  /**
   * Display-only CSS filter (e.g. a dark-theme treatment). Applied to the
   * inline and enlarged views alike; the source file and its content are
   * never changed.
   */
  filter?: string;
};

/**
 * A static, approved image with click-to-enlarge. The source file is used
 * as-is (plain <img>, original aspect ratio via width/height, never
 * cropped or re-encoded). A dedicated viewer rather than the CMS
 * ImageLightbox, which is hard-wired to /media/[id] and PublicSectionImage.
 * Escape, the close button and a backdrop click close it; page scroll is
 * locked while open and focus returns to the opener.
 */
export function ZoomImage({
  src,
  alt,
  width,
  height,
  label,
  crop,
  eager,
  frameClassName,
  filter,
}: ZoomImageProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`Enlarge image: ${label}`}
        className="block w-full cursor-zoom-in rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e6007e]"
      >
        {crop ? (
          <span
            className={cn("relative block overflow-hidden", frameClassName)}
            style={{
              aspectRatio: `${crop.w} / ${crop.h}`,
              borderRadius: crop.radius,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              loading={eager ? "eager" : "lazy"}
              decoding="async"
              className="absolute max-w-none"
              style={{
                width: `${(width / crop.w) * 100}%`,
                height: `${(height / crop.h) * 100}%`,
                left: `${(-crop.x / crop.w) * 100}%`,
                top: `${(-crop.y / crop.h) * 100}%`,
                filter,
              }}
            />
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            style={{ filter }}
            className={cn(
              "h-auto w-full rounded-lg border border-white/10",
              frameClassName,
            )}
          />
        )}
      </button>
      {open ? (
        <Viewer
          src={src}
          alt={alt}
          label={label}
          filter={filter}
          onClose={close}
        />
      ) : null}
    </>
  );
}

function Viewer({
  src,
  alt,
  label,
  filter,
  onClose,
}: {
  src: string;
  alt: string;
  label: string;
  filter?: string;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
    };
    const scrollbar = window.innerWidth - html.clientWidth;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    closeRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Tab") {
        // The close button is the only focusable control.
        e.preventDefault();
        closeRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.paddingRight = prev.bodyPaddingRight;
      opener?.focus({ preventScroll: true });
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-2 sm:p-4"
      onClick={onClose}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close image"
        className="absolute right-1 top-1 z-10 grid h-16 w-16 place-items-center rounded-md text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-3 sm:top-3"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="40"
          height="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        >
          <path d="M5 5l14 14M19 5L5 19" />
        </svg>
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        style={{ filter }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-[95vw] rounded-md object-contain shadow-2xl"
      />
    </div>,
    document.body,
  );
}
