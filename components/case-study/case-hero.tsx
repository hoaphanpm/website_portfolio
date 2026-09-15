import type { PublicCaseDetail } from "@/lib/cases/public-queries";

/**
 * Page-level content, not a section — never rendered inside sections[],
 * matches product-requirements.md's DESIGN-TO-DATA MAPPING rule exactly.
 */
export function CaseHero({ caseDetail }: { caseDetail: PublicCaseDetail }) {
  const eyebrow = `Case Study ${String(caseDetail.display_position).padStart(2, "0")} / ${caseDetail.case_name}`;

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:items-center">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {caseDetail.headline}
          </h1>
          {caseDetail.tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {caseDetail.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {caseDetail.hero_image_id ? (
          // Approved decision (Milestone 4/6): plain <img>, never a raw
          // Storage URL — /media/[id] re-checks authorization on every
          // request. Eager-loaded: this is above the fold.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/media/${caseDetail.hero_image_id}`}
            alt={caseDetail.heroImageAlt ?? ""}
            loading="eager"
            className="w-full rounded-lg border border-border object-cover"
          />
        ) : null}
      </div>
    </section>
  );
}
