"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import type { PublicSectionImage } from "@/lib/cases/public-queries";

/**
 * In-page image viewer for case-study media. Rendered (portaled to <body>)
 * only while an image is open; the page underneath is never navigated and
 * no new tab is opened. Same /media/[id] delivery as the inline image.
 *
 * - Escape, the close button and a click on the dark backdrop all close it.
 * - Background scroll is locked while open (scrollbar width is compensated
 *   so the layout doesn't shift), and the exact scroll position is restored
 *   on close, along with focus to the element that opened it.
 */
export function ImageLightbox({
  image,
  onClose,
}: {
  image: PublicSectionImage;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
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
        // The close button is the only focusable control: keep focus in the dialog.
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
      window.scrollTo(scrollX, scrollY);
      opener?.focus({ preventScroll: true });
    };
  }, [onClose]);

  const label = image.caption || image.alt_text || "Image";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-2 sm:p-4"
      onClick={onClose}
    >
      {/* Standalone bold X: no circle, no border, no fill. The 64px grid
          cell is the (invisible) hit area; the drop-shadow keeps the white
          mark visible over light image content too. */}
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close image"
        className="absolute right-1 top-1 z-10 grid h-16 w-16 place-items-center rounded-md p-0 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-3 sm:top-3"
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
        src={`/media/${image.id}`}
        alt={image.is_decorative ? "" : (image.alt_text ?? "")}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-[95vw] rounded-md object-contain shadow-2xl"
      />
    </div>,
    document.body,
  );
}
