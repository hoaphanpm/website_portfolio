"use client";

import { useEffect, useState } from "react";

import { SECTION_IDS } from "@/lib/cases/constants";
import { cn } from "@/lib/utils";

import { MOMO_SECTION_LABELS } from "./momo-config";

/**
 * Sticky section navigation for the MoMo v2 page: a vertical rail at `lg`+
 * and a compact horizontal bar below. Lists all nine fixed sections from
 * SECTION_IDS, using the plain admin labels (Overview … Reflection) the
 * design reference shows. One IntersectionObserver backs both layouts, the
 * same scroll-spy band as components/case-study/section-nav.tsx. This is
 * navigation only — it never sends analytics events.
 */
export function MomoNav() {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
        );
        setActiveId(topmost.target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: [0, 1] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const items = SECTION_IDS.map((id, i) => ({
    id,
    number: String(i + 1).padStart(2, "0"),
    label: MOMO_SECTION_LABELS[id],
    active: id === activeId,
  }));

  return (
    <>
      {/* Below lg: sticky horizontal scroller, scoped overflow on the <ul>. */}
      <nav
        aria-label="Case sections"
        className="sticky top-0 z-10 border-b border-white/10 bg-[#0a0610]/95 backdrop-blur lg:hidden"
      >
        <ul className="flex gap-2 overflow-x-auto px-4 py-3 sm:px-6">
          {items.map((item) => (
            <li key={item.id} className="shrink-0">
              <a
                href={`#${item.id}`}
                aria-current={item.active ? "true" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e6007e]",
                  item.active
                    ? "border-[#e6007e] bg-[#e6007e]/15 font-semibold text-[#ebe7ef]"
                    : "border-white/15 text-white/62 hover:text-white",
                )}
              >
                <span className="text-white/50">{item.number}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* lg+: sticky vertical rail. Active state = weight + border + color. */}
      <nav
        aria-label="Case sections"
        className="sticky top-6 hidden self-start py-6 lg:block"
      >
        <ol className="space-y-0.5 border-l border-white/10">
          {items.map((item) => (
            <li key={item.id} className="-ml-px">
              <a
                href={`#${item.id}`}
                aria-current={item.active ? "true" : undefined}
                className={cn(
                  "flex items-center gap-3 border-l-2 py-1.5 pl-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e6007e]",
                  item.active
                    ? "border-[#e6007e] font-semibold text-[#ebe7ef]"
                    : "border-transparent text-white/55 hover:text-white",
                )}
              >
                <span className={item.active ? "text-[#ff4fa8]" : "text-white/40"}>
                  {item.number}
                </span>
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
