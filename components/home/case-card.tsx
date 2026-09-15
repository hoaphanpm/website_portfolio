import { Card, CardContent } from "@/components/ui/card";
import type { PublicCaseSummary } from "@/lib/cases/public-queries";

/**
 * Milestone 6: intentionally no clickable CTA — /work/[case_id] does not
 * exist yet, and an active link to a route that 404s is not acceptable.
 * "Explore case" is inert display text only (no href, not a button/link
 * element, no hover/focus/pointer affordance).
 *
 * Milestone 7 will change only the return statement: wrap the label below
 * in a <Link href={`/work/${caseItem.case_id}`}>. The props and layout
 * here don't need to change for that.
 */
export function CaseCard({ caseItem }: { caseItem: PublicCaseSummary }) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold">{caseItem.case_name}</h3>
        {caseItem.summary ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {caseItem.summary}
          </p>
        ) : null}
        {caseItem.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {caseItem.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        <span className="mt-4 inline-block text-sm font-medium text-muted-foreground">
          Explore case →
        </span>
      </CardContent>
    </Card>
  );
}
