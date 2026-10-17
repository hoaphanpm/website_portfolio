"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { NAV_ITEMS } from "./vpbank-content";

/**
 * Sticky section navigation: a vertical rail at `lg`+ and a horizontal bar
 * below. Lists all nine sections; those not yet built render as inert,
 * clearly muted labels (no link, no placeholder content). One
 * IntersectionObserver backs both layouts. Navigation only — never sends
 * analytics events.
 */
export function VpbankNav() {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const elements = NAV_ITEMS.filter((i) => i.available)
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
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

  const items = NAV_ITEMS.map((item, i) => ({
    ...item,
    number: String(i + 1).padStart(2, "0"),
    active: item.id === activeId,
  }));

  return (
    <>
      {/* Below lg: sticky horizontal scroller, scoped overflow on the <ul>. */}
      <nav
        aria-label="Case sections"
        className="sticky top-0 z-10 border-b border-white/10 bg-[#07090f]/95 backdrop-blur lg:hidden"
      >
        <ul className="flex gap-2 overflow-x-auto px-4 py-3 sm:px-6">
          {items.map((item) => (
            <li key={item.id} className="shrink-0">
              {item.available ? (
                <a
                  href={`#${item.id}`}
                  aria-current={item.active ? "true" : undefined}
                  className={cn(
                    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22c55e]",
                    item.active
                      ? "border-[#22c55e] bg-[#22c55e]/15 font-semibold text-[#f3f5f8]"
                      : "border-white/15 text-white/62 hover:text-white",
                  )}
                >
                  <span className="text-white/50">{item.number}</span>
                  {item.label}
                </a>
              ) : (
                <span
                  aria-disabled="true"
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/[0.07] px-3 py-1.5 text-xs text-white/30"
                >
                  <span>{item.number}</span>
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* lg+: sticky vertical rail. Active state = weight + border + color. */}
      <nav aria-label="Case sections" className="sticky top-6 hidden self-start py-6 lg:block">
        <ol className="space-y-0.5 border-l border-white/10">
          {items.map((item) => (
            <li key={item.id} className="-ml-px">
              {item.available ? (
                <a
                  href={`#${item.id}`}
                  aria-current={item.active ? "true" : undefined}
                  className={cn(
                    "flex items-center gap-3 border-l-2 py-1.5 pl-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22c55e]",
                    item.active
                      ? "border-[#22c55e] font-semibold text-[#f3f5f8]"
                      : "border-transparent text-white/55 hover:text-white",
                  )}
                >
                  <span className={item.active ? "text-[#4ade80]" : "text-white/40"}>{item.number}</span>
                  {item.label}
                </a>
              ) : (
                <span
                  aria-disabled="true"
                  className="flex items-center gap-3 border-l-2 border-transparent py-1.5 pl-4 text-sm text-white/28"
                >
                  <span className="text-white/25">{item.number}</span>
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
