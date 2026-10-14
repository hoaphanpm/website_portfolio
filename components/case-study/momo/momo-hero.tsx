import { CalendarDays, FlaskConical, Target, Users } from "lucide-react";

import { cn } from "@/lib/utils";

import { CropBadge } from "./crop-badge";
import { momoContent } from "./momo-content";
import { ZoomImage } from "./zoom-image";

const CHIP_ICONS = [Target, FlaskConical, Users, CalendarDays];

/** Four-point sparkle, decorative only. */
function Sparkle({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn("absolute", className)}
      fill="currentColor"
    >
      <path d="M12 0c.8 6.6 5.4 11.2 12 12-6.6.8-11.2 5.4-12 12-.8-6.6-5.4-11.2-12-12C6.6 11.2 11.2 6.6 12 0Z" />
    </svg>
  );
}

/**
 * Hero, composed after the approved style reference: one full-width brand
 * band — text left (eyebrow, headline, subtitle, icon chips, status),
 * visual right (a tilted dark phone bleeding off the band's top edge over a
 * curved pink horizon glow, a speech bubble, and the piggy-bank mascot).
 *
 * Content is the approved website copy. The phone is the approved Screen 1
 * file (display-cropped, never redrawn); the pig is cropped from that same
 * approved screen. The bubble reuses the approved Solution headline — no
 * reference copy is carried over. Page-level content: never observed for
 * section_viewed.
 */
export function MomoHero() {
  const { eyebrow, headline, summary, chips } = momoContent.hero;
  const [primary] = momoContent.sections.solution.images;
  const bubble = momoContent.sections.solution.headline;

  return (
    <header className="relative isolate my-6 overflow-hidden rounded-3xl border border-white/10 bg-[#0c0810] lg:my-8">
      {/* Background: magenta bloom from the right + a curved horizon arc. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_90%_at_82%_55%,rgba(230,0,126,0.5),rgba(230,0,126,0.14)_55%,transparent_80%)]"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-[22rem] right-[-12%] -z-10 h-[30rem] w-[44rem] rounded-full border-t-2 border-[#ff4fa8]/70 bg-[#0c0810] shadow-[0_-24px_90px_8px_rgba(230,0,126,0.55)]"
      />

      <div className="grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* Text column */}
        <div className="px-6 pb-8 pt-8 sm:px-10 md:py-12 lg:pr-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55 sm:text-xs">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight text-balance text-[#ebe7ef] sm:text-4xl lg:text-5xl">
            {headline}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/68 sm:text-lg">
            {summary}
          </p>

          <ul className="mt-7 flex flex-wrap gap-2.5">
            {chips.map((chip, i) => {
              const Icon = CHIP_ICONS[i];
              return (
                <li
                  key={chip}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm",
                    i === 0
                      ? "border-[#e6007e]/60 bg-[#e6007e]/15 text-[#ebe7ef]"
                      : "border-white/15 bg-white/5 text-white/80",
                  )}
                >
                  {Icon ? (
                    <Icon
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-[#ff4fa8]"
                    />
                  ) : null}
                  {chip}
                </li>
              );
            })}
          </ul>

          <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white/75">
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-full bg-[#e6007e]"
            />
            {momoContent.status}
          </p>
        </div>

        {/* Visual column — fixed-height stage so the absolutely positioned
            layers can never overflow the band at any width. */}
        <div className="relative h-[27rem] sm:h-[30rem] md:h-auto md:min-h-[28rem]">
          <Sparkle className="right-[34%] top-[14%] h-4 w-4 text-[#ffd1ea]" />
          <Sparkle className="right-[6%] top-[42%] h-5 w-5 text-[#ff4fa8]" />
          <Sparkle className="left-[10%] top-[58%] h-3 w-3 text-white/70" />

          {/* Tilted phone: bleeds off the band's top edge from md up, as in
              the reference (kept inside the stage on mobile so it never
              covers the text above). */}
          <div className="absolute left-[14%] top-[4%] w-[56%] max-w-[19rem] origin-center -rotate-[7deg] sm:left-[18%] md:left-[10%] md:top-[-5%] md:w-[60%]">
            <ZoomImage
              src={primary.src}
              alt={primary.alt}
              width={primary.width}
              height={primary.height}
              crop={primary.crop}
              label={primary.caption}
              eager
              frameClassName="shadow-[0_30px_80px_-20px_rgba(230,0,126,0.7)] ring-1 ring-white/20"
            />
          </div>

          {/* Speech bubble — approved Solution headline as its copy. */}
          <div className="absolute right-[3%] top-[8%] w-[34%] max-w-[10.5rem] rotate-[5deg] rounded-2xl bg-[#ffc4e2] px-3 py-2.5 text-sm font-bold leading-snug text-[#a10059] shadow-lg shadow-[#e6007e]/30 sm:text-base">
            {bubble}
            <span
              aria-hidden="true"
              className="absolute -bottom-1.5 left-5 h-3.5 w-3.5 rotate-45 bg-[#ffc4e2]"
            />
          </div>

          {/* Piggy-bank mascot (cropped from approved Screen 1), softly
              faded into the glow instead of a hard card edge. */}
          <CropBadge
            src={primary.src}
            width={primary.width}
            height={primary.height}
            crop={{ x: 185, y: 905, w: 180, h: 180 }}
            className="absolute bottom-[5%] right-[3%] w-[30%] max-w-[9.5rem] drop-shadow-[0_10px_24px_rgba(230,0,126,0.55)] [mask-image:radial-gradient(closest-side,#000_82%,transparent_100%)]"
          />
        </div>
      </div>
    </header>
  );
}
