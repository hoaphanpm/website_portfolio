import { MIRO_CASE_STUDY_URL } from "./momo-config";

function isValidHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Subtle end-of-page pointer to the full analysis on Miro. Rendered once,
 * after Section 09 — never inside individual sections. Renders nothing at
 * all until MIRO_CASE_STUDY_URL is configured with a valid https URL. No
 * analytics event is attached (none of the five approved events covers it).
 */
export function MiroReference() {
  if (!MIRO_CASE_STUDY_URL || !isValidHttpsUrl(MIRO_CASE_STUDY_URL)) {
    return null;
  }

  return (
    <aside
      aria-labelledby="miro-reference-title"
      className="my-8 flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <h2 id="miro-reference-title" className="font-semibold text-[#ebe7ef]">
          Explore the full product analysis
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-white/62">
          Explore the supporting research, segment evaluation, product
          decisions, and pilot experiment design on Miro.
        </p>
      </div>
      <a
        href={MIRO_CASE_STUDY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 items-center justify-center rounded-md border border-[#e6007e]/60 px-4 py-2 text-sm font-semibold text-[#ebe7ef] transition-colors hover:bg-[#e6007e]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e6007e]"
      >
        View full analysis on Miro ↗
      </a>
    </aside>
  );
}
