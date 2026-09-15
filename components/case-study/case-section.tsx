import { PUBLIC_SECTION_LABELS } from "@/lib/cases/public-labels";
import type { PublicCaseSection } from "@/lib/cases/public-queries";
import { cn } from "@/lib/utils";

/**
 * Renders exactly what Milestone 3 captures per section — a public title,
 * the admin's own content.heading, and content.body. No richer per-type
 * layout (stat grids, option cards, step flows) is fabricated; that data
 * was never collected. Decision and Insight get subtle CSS-only accents
 * (approved decision #3); every other section is visually uniform.
 */
export function CaseSection({ section }: { section: PublicCaseSection }) {
  const heading =
    typeof section.content.heading === "string" ? section.content.heading : "";
  const body =
    typeof section.content.body === "string" ? section.content.body : "";

  const isDecision = section.section_id === "decision";
  const isInsight = section.section_id === "insight";

  return (
    <section
      id={section.section_id}
      className="mx-auto max-w-5xl scroll-mt-20 px-4 py-6 sm:px-6"
    >
      <div
        className={cn(
          "rounded-lg border p-6",
          isDecision
            ? "border-primary/40 bg-secondary/40"
            : isInsight
              ? "border-border bg-secondary/20"
              : "border-border",
        )}
      >
        <p className="text-sm font-medium text-muted-foreground">
          {String(section.section_index).padStart(2, "0")}
        </p>
        <h2 className="mt-1 text-xl font-semibold">
          {PUBLIC_SECTION_LABELS[section.section_id]}
        </h2>
        {heading ? <h3 className="mt-3 font-medium">{heading}</h3> : null}
        {body ? (
          isInsight ? (
            <blockquote className="mt-3 whitespace-pre-line italic text-muted-foreground">
              &ldquo;{body}&rdquo;
            </blockquote>
          ) : (
            <p className="mt-3 whitespace-pre-line text-muted-foreground">
              {body}
            </p>
          )
        ) : null}
      </div>
    </section>
  );
}
