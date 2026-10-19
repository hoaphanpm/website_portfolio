import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Visual primitives for the MoMo v2 page. Colors are literal here on
 * purpose: the page's dark/pink look is scoped to this tree only (approved
 * decision #5) and must not leak into the global theme tokens.
 */

export const MOMO_PINK = "#e6007e";

export function Card({
  className,
  highlighted,
  children,
}: {
  className?: string;
  highlighted?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "min-w-0 break-words rounded-xl border p-5",
        highlighted
          ? "border-[#e6007e]/70 bg-[#e6007e]/10"
          : "border-white/10 bg-white/[0.04]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function IconBadge({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e6007e]/20 text-[#ff4fa8]"
    >
      {children}
    </span>
  );
}

export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <span className="text-2xl font-bold text-[#ebe7ef] sm:text-3xl">{value}</span>
      <span className="text-sm text-white/62">{label}</span>
    </div>
  );
}

export function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2 text-sm text-white/72">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span
            aria-hidden="true"
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e6007e]"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Horizontally scrollable wrapper so wide tables never cause page-level
 * horizontal overflow on phones. Focusable so keyboard users can scroll it.
 */
export function ScrollTable({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="overflow-x-auto rounded-xl border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e6007e]"
    >
      {children}
    </div>
  );
}

/** Strength is conveyed by fill AND an sr-only word — never color alone. */
const STRENGTH = ["Weak", "Medium", "Strong"] as const;

export function ScoreDot({ score }: { score: number }) {
  const level = Math.min(Math.max(score, 0), 2);
  return (
    <span className="inline-flex items-center justify-center">
      <span
        aria-hidden="true"
        className={cn(
          "inline-block h-3.5 w-3.5 rounded-full",
          level === 2 && "bg-[#e6007e]",
          level === 1 && "bg-white/50",
          level === 0 && "border border-white/30 bg-transparent",
        )}
      />
      <span className="sr-only">{STRENGTH[level]}</span>
    </span>
  );
}
