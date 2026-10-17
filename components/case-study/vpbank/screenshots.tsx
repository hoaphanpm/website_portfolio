"use client";

import { ArrowRight, ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { TONE, type Tone } from "./primitives";
import { SHOT_THUMB_ASPECT } from "./vpbank-content";

export type Shot = { src: string; width: number; height: number; title: string; alt: string };

/**
 * Reusable dark lightbox for per-phone screenshots. Dialog semantics, Esc,
 * backdrop click, arrow keys, body scroll lock, focus trap and focus restore.
 */
function Lightbox({
  shots,
  index,
  onIndex,
  onClose,
  tone,
}: {
  shots: readonly Shot[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  tone: Tone;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const multi = shots.length > 1;
  const shot = shots[index];

  const go = useCallback(
    (d: number) => onIndex((index + d + shots.length) % shots.length),
    [index, onIndex, shots.length],
  );

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (multi && e.key === "ArrowLeft") go(-1);
      else if (multi && e.key === "ArrowRight") go(1);
      else if (e.key === "Tab") {
        const f = dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])");
        if (!f || f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go, multi, onClose]);

  const btn =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${shot.title} screenshot`}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#05070c]/90 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <button ref={closeRef} type="button" aria-label="Close" onClick={onClose} className={cn(btn, "absolute right-4 top-4")}>
        <X aria-hidden="true" className="h-5 w-5" />
      </button>

      <div className="flex max-h-full flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <p className="flex items-center gap-2 text-sm font-semibold text-white" aria-live="polite">
          {multi ? (
            <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold", TONE[tone].chip)}>
              {index + 1}
            </span>
          ) : null}
          {shot.title}
          {multi ? <span className="text-xs font-normal text-white/50">
            {index + 1} / {shots.length}
          </span> : null}
        </p>
        <div className="flex items-center gap-3 sm:gap-6">
          {multi ? (
            <button type="button" aria-label="Previous screenshot" onClick={() => go(-1)} className={btn}>
              <ChevronLeft aria-hidden="true" className="h-5 w-5" />
            </button>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shot.src}
            alt={shot.alt}
            width={shot.width}
            height={shot.height}
            className="h-auto rounded-2xl shadow-2xl"
            style={{ width: `min(calc(min(80vh, 780px) * ${shot.width / shot.height}), calc(100vw - 7.5rem))` }}
          />
          {multi ? (
            <button type="button" aria-label="Next screenshot" onClick={() => go(1)} className={btn}>
              <ChevronRight aria-hidden="true" className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Thumb({
  shot,
  tone,
  onOpen,
  triggerRef,
  className,
}: {
  shot: Shot;
  tone: Tone;
  onOpen: () => void;
  triggerRef?: (el: HTMLButtonElement | null) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      ref={triggerRef}
      onClick={onOpen}
      aria-label={`Enlarge: ${shot.title}`}
      aria-haspopup="dialog"
      className={cn(
        "group relative block w-full cursor-zoom-in rounded-[1.1rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
        className,
      )}
    >
      {/* Equal-height frame; the screenshot keeps its own aspect ratio inside it. */}
      <span className="block w-full" style={{ aspectRatio: SHOT_THUMB_ASPECT }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={shot.src}
          alt={shot.alt}
          width={shot.width}
          height={shot.height}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain"
        />
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute bottom-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-80 transition group-hover:opacity-100",
          TONE[tone].text,
        )}
      >
        <Maximize2 className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}

/** Solution: a row of numbered phones; clicking one opens that phase's lightbox. */
export function PhoneStrip({
  tone,
  steps,
  shots,
}: {
  tone: Tone;
  steps: readonly string[];
  shots: readonly Shot[];
}) {
  const [open, setOpen] = useState<number | null>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const openedFrom = useRef(0);

  const close = useCallback(() => {
    setOpen(null);
    requestAnimationFrame(() => triggers.current[openedFrom.current]?.focus());
  }, []);

  return (
    <>
      <div className="overflow-x-auto pb-2 [scrollbar-width:thin]" tabIndex={0} aria-label="Product steps (scrolls horizontally on small screens)">
        <ol className="flex snap-x gap-2">
          {steps.map((label, i) => (
            <Fragment key={label}>
              <li className="flex min-w-[8.75rem] max-w-[12rem] flex-1 snap-start flex-col items-center gap-2">
                <div className="flex items-center gap-2 self-start whitespace-nowrap">
                  <span className={cn("inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold", TONE[tone].chip)}>
                    {i + 1}
                  </span>
                  <span className="text-[13px] font-semibold leading-tight text-white">{label}</span>
                </div>
                <Thumb
                  shot={shots[i]}
                  tone={tone}
                  triggerRef={(el) => {
                    triggers.current[i] = el;
                  }}
                  onOpen={() => {
                    openedFrom.current = i;
                    setOpen(i);
                  }}
                />
              </li>
              {i < steps.length - 1 ? (
                <li aria-hidden="true" className="self-center">
                  <ArrowRight className={cn("h-4 w-4", TONE[tone].solid)} />
                </li>
              ) : null}
            </Fragment>
          ))}
        </ol>
      </div>
      {open !== null ? <Lightbox shots={shots} index={open} onIndex={setOpen} onClose={close} tone={tone} /> : null}
    </>
  );
}

/** Experiment: a single enlargeable preview (does not trigger the prototype link). */
export function PreviewShot({
  tone,
  shot,
  className,
}: {
  tone: Tone;
  shot: Shot;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement | null>(null);
  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => ref.current?.focus());
  }, []);
  return (
    <>
      <Thumb
        shot={shot}
        tone={tone}
        triggerRef={(el) => {
          ref.current = el;
        }}
        onOpen={() => setOpen(true)}
        className={className}
      />
      {open ? <Lightbox shots={[shot]} index={0} onIndex={() => {}} onClose={close} tone={tone} /> : null}
    </>
  );
}
