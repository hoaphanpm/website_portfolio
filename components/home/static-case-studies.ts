import {
  MOMO_V2_CASE_ID,
  MOMO_V2_CASE_NAME,
} from "@/components/case-study/momo/momo-config";
import {
  VPBANK_CASE_ID,
  VPBANK_CASE_NAME,
} from "@/components/case-study/vpbank/vpbank-config";

/**
 * The two hardcoded case studies featured on the homepage. Identifiers and
 * names are reused from each page's own config, so the homepage entry and the
 * page's tracking can never disagree. No database access.
 */
export type StaticCaseStudy = {
  /** Same id the page tracks with (case events + footer attribution). */
  case_id: string;
  href: string;
  case_name: string;
};

export const STATIC_CASE_STUDIES: StaticCaseStudy[] = [
  {
    case_id: MOMO_V2_CASE_ID,
    href: "/case-studies/momo-salary-v2",
    case_name: MOMO_V2_CASE_NAME,
  },
  {
    case_id: VPBANK_CASE_ID,
    href: "/case-studies/vpbank-ai-debt-management-v2",
    case_name: VPBANK_CASE_NAME,
  },
];
