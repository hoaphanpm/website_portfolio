import { PUBLIC_SECTION_LABELS } from "@/lib/cases/public-labels";
import type { PublicCaseSection } from "@/lib/cases/public-queries";

/**
 * One entry per section the case actually has, in section_index order —
 * never the full fixed 9. Plain anchor links only this milestone — no
 * scroll-spy / client-side section tracking (approved decision #2).
 */
export function SectionNav({ sections }: { sections: PublicCaseSection[] }) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Case sections" className="border-y border-border">
      <div className="mx-auto flex max-w-5xl flex-wrap gap-2 px-4 py-3 sm:px-6">
        {sections.map((section) => (
          <a
            key={section.section_id}
            href={`#${section.section_id}`}
            aria-label={`Jump to ${PUBLIC_SECTION_LABELS[section.section_id]}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-xs font-medium text-muted-foreground hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {String(section.section_index).padStart(2, "0")}
          </a>
        ))}
      </div>
    </nav>
  );
}
