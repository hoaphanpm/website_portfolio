import Link from "next/link";

import { CaseStudyOpenedTracker } from "@/components/analytics/case-study-opened-tracker";
import { SECTION_IDS, type SectionId } from "@/lib/cases/constants";

import {
  MOMO_V2_CASE_ID,
  MOMO_V2_CASE_NAME,
  MOMO_V2_COMPLETION_SECTION,
  MOMO_V2_DISPLAY_POSITION,
  MOMO_V2_EVENTS_ENABLED,
  MOMO_SECTION_LABELS,
} from "./momo-config";
import { momoContent } from "./momo-content";
import { MomoHero } from "./momo-hero";
import { MiroReference } from "./miro-reference";
import { MomoNav } from "./momo-nav";
import { MomoSection } from "./momo-section";
import {
  DecisionModule,
  EvidenceModule,
  ExperienceModule,
  InsightModule,
  MeasureModule,
  OverviewModule,
  ProblemModule,
  ReflectionModule,
  SolutionModule,
} from "./sections";

const MODULES: Record<SectionId, () => React.JSX.Element> = {
  overview: OverviewModule,
  problem: ProblemModule,
  evidence: EvidenceModule,
  insight: InsightModule,
  decision: DecisionModule,
  solution: SolutionModule,
  experience: ExperienceModule,
  measure: MeasureModule,
  reflection: ReflectionModule,
};

/**
 * Custom-coded MoMo case study (v2). Static, code-defined content — no
 * Supabase content query, no CaseRenderer/CaseSection. The dark/pink theme
 * is scoped to this wrapper only; nothing here touches global tokens.
 * Reuses the fixed nine section ids, so any later analytics wiring matches
 * the existing funnel exactly.
 */
export function MomoCaseStudy({ trackingAllowed }: { trackingAllowed: boolean }) {
  const eventsEnabled = trackingAllowed && MOMO_V2_EVENTS_ENABLED;

  return (
    <div className="bg-[#0a0610] text-[#ebe7ef]">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:grid lg:grid-cols-[11rem_1fr] lg:gap-8">
        <MomoNav />

        <div className="min-w-0">
          <MomoHero />
          <CaseStudyOpenedTracker
            caseId={MOMO_V2_CASE_ID}
            caseName={MOMO_V2_CASE_NAME}
            displayPosition={MOMO_V2_DISPLAY_POSITION}
            trackingAllowed={trackingAllowed}
            eventsEnabled={eventsEnabled}
          />

          {SECTION_IDS.map((id, i) => {
            const Module = MODULES[id];
            return (
              <MomoSection
                key={id}
                sectionId={id}
                sectionIndex={i + 1}
                title={MOMO_SECTION_LABELS[id]}
                blurb={momoContent.sections[id].blurb}
                caseId={MOMO_V2_CASE_ID}
                completionSectionId={MOMO_V2_COMPLETION_SECTION}
                trackingAllowed={trackingAllowed}
                eventsEnabled={eventsEnabled}
                wide={id === "solution" || id === "experience" || id === "measure"}
              >
                <Module />
              </MomoSection>
            );
          })}

          <MiroReference />

          <div className="border-t border-white/10 py-10">
            <Link
              href="/#case-studies"
              className="text-sm text-white/62 underline-offset-2 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e6007e]"
            >
              ← Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
