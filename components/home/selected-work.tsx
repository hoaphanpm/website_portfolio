import { MomoHero } from "@/components/case-study/momo/momo-hero";
import { VpbankHero } from "@/components/case-study/vpbank/vpbank-hero";

import { CaseHeroLink } from "./case-hero-link";
import { STATIC_CASE_STUDIES } from "./static-case-studies";

// Homepage shows only the two finalized hardcoded case studies, each as its
// own page's Hero (the same components, unchanged). CMS cases
// (/work/[case_id]) remain available but are not listed here.
const [momo, vpbank] = STATIC_CASE_STUDIES;

const MOMO_HOME_CLASS = [
  "text-[#ebe7ef] [&>header]:my-0!",
  // Phone composition (the tilted phone's wrapper): lower and a little more central.
  "md:[&_div[class*=-rotate-]]:top-[1%] md:[&_div[class*=-rotate-]]:left-[13%]",
  // Phones only (<640px): compact tags so they pair up on a row, tighter gaps
  // between the text blocks, and a shorter visual stage, so the phone appears
  // sooner. Title and summary sizes are untouched.
  "max-sm:[&_ul]:mt-5 max-sm:[&_ul]:gap-1.5",
  "max-sm:[&_li]:gap-1 max-sm:[&_li]:px-2 max-sm:[&_li]:py-1.5 max-sm:[&_li]:text-xs max-sm:[&_li_svg]:h-3.5 max-sm:[&_li_svg]:w-3.5",
  "max-sm:[&_p:last-of-type]:mt-4",
  "max-sm:[&_header>div>div:first-child]:pb-5",
  "max-sm:[&_header>div>div:last-child]:h-[24rem]",
].join(" ");

// Typography matched to MoMo's equivalent text roles (same sizes, weights,
// leading and tracking). The eyebrow is shown uppercase via CSS only; its
// source text is unchanged.
const VPBANK_HOME_CLASS = [
  "rounded-3xl border border-white/10 bg-[#07090f] px-6 py-8 text-[#f3f5f8] sm:px-10 sm:py-10 [&>header]:my-0!",
  // Larger title wraps to more lines: centre the (unchanged) diagram beside it.
  "md:[&>header]:items-center",
  "lg:[&_h3]:text-5xl",
  // Desktop: a wider text column so "Missed Payments" stays together; the diagram column gives up the width.
  "lg:[&>header]:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]",
  "[&_h3+p]:text-base sm:[&_h3+p]:text-lg [&_h3+p]:max-w-xl",
  "[&_p:first-of-type]:text-[11px] sm:[&_p:first-of-type]:text-xs [&_p:first-of-type]:font-semibold [&_p:first-of-type]:tracking-[0.2em] [&_p:first-of-type]:uppercase max-sm:[&_p:first-of-type]:leading-normal",
  "[&_li]:px-3.5 [&_li]:py-2 [&_li]:text-sm",
].join(" ");

export function SelectedWork() {
  return (
    <section id="case-studies" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h2 className="text-2xl font-semibold">Case Studies</h2>

      <div className="mt-6 flex flex-col gap-10">
        <CaseHeroLink
          href={momo.href}
          caseId={momo.case_id}
          label={momo.case_name}
        >
          {/* MoMo's Hero is a self-contained band (own background, border, text colors).
              Homepage only: from md up the phone sits lower, so its top is
              less cropped by the band edge (the Hero component is untouched). */}
          <div className={MOMO_HOME_CLASS}>
            <MomoHero headingLevel="h3" />
          </div>
        </CaseHeroLink>

        <CaseHeroLink
          href={vpbank.href}
          caseId={vpbank.case_id}
          label={vpbank.case_name}
        >
          {/* VPBank's Hero sits on its page's dark background, so give it the same one here.
              Homepage only: its text roles use MoMo's typography (title, summary,
              eyebrow, tags); the Hero component itself is untouched. */}
          <div className={VPBANK_HOME_CLASS}>
            <VpbankHero headingLevel="h3" />
          </div>
        </CaseHeroLink>
      </div>
    </section>
  );
}
