import Link from "next/link";

import { CaseStudyOpenedTracker } from "@/components/analytics/case-study-opened-tracker";

import {
  VPBANK_CASE_ID,
  VPBANK_CASE_NAME,
  VPBANK_COMPLETION_SECTION,
  VPBANK_DISPLAY_POSITION,
  VPBANK_EVENTS_ENABLED,
} from "./vpbank-config";
import { NAV_ITEMS, vpbankContent } from "./vpbank-content";
import { VpbankHero } from "./vpbank-hero";
import { VpbankNav } from "./vpbank-nav";
import { VpbankSection } from "./vpbank-section";
import {
  DecisionModule,
  EvidenceModule,
  InsightModule,
  OverviewModule,
  ProblemModule,
} from "./sections";
import { ExperimentModule, MeasureModule, ReflectionModule, SolutionModule } from "./sections-late";

type Built =
  | "overview"
  | "problem"
  | "evidence"
  | "insight"
  | "decision"
  | "solution"
  | "experiment"
  | "measure"
  | "reflection";

const MODULES: Record<Built, () => React.JSX.Element> = {
  overview: OverviewModule,
  problem: ProblemModule,
  evidence: EvidenceModule,
  insight: InsightModule,
  decision: DecisionModule,
  solution: SolutionModule,
  experiment: ExperimentModule,
  measure: MeasureModule,
  reflection: ReflectionModule,
};

const BUILT: readonly Built[] = [
  "overview",
  "problem",
  "evidence",
  "insight",
  "decision",
  "solution",
  "experiment",
  "measure",
  "reflection",
];

/**
 * Independent static VPBank case study. Code-defined content only — no
 * Supabase content query, no CaseRenderer. Dark theme is scoped to this
 * wrapper.
 */
export function VpbankCaseStudy({ trackingAllowed }: { trackingAllowed: boolean }) {
  const eventsEnabled = trackingAllowed && VPBANK_EVENTS_ENABLED;

  return (
    <div className="bg-[#07090f] text-[#f3f5f8]">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:grid lg:grid-cols-[11rem_1fr] lg:gap-8">
        <VpbankNav />

        <div className="min-w-0">
          <VpbankHero />
          <CaseStudyOpenedTracker
            caseId={VPBANK_CASE_ID}
            caseName={VPBANK_CASE_NAME}
            displayPosition={VPBANK_DISPLAY_POSITION}
            trackingAllowed={trackingAllowed}
            eventsEnabled={eventsEnabled}
          />

          {BUILT.map((id) => {
            const Module = MODULES[id];
            const index = NAV_ITEMS.findIndex((n) => n.id === id);
            const { intro } = vpbankContent[id];
            return (
              <VpbankSection
                key={id}
                sectionId={id}
                sectionIndex={index + 1}
                label={NAV_ITEMS[index].label}
                intro={intro}
                caseId={VPBANK_CASE_ID}
                completionSectionId={VPBANK_COMPLETION_SECTION}
                trackingAllowed={trackingAllowed}
                eventsEnabled={eventsEnabled}
              >
                <Module />
              </VpbankSection>
            );
          })}

          <div className="border-t border-white/10 py-10">
            <Link
              href="/#case-studies"
              className="text-sm text-white/62 underline-offset-2 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22c55e]"
            >
              ← Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
