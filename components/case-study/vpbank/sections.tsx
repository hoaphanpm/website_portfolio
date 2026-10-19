import {
  ArrowDown,
  ArrowRight,
  Bell,
  ChartColumn,
  ChartPie,
  CircleAlert,
  Coins,
  CreditCard,
  Database,
  EyeOff,
  FileText,
  Hourglass,
  ListChecks,
  ShoppingCart,
  SlidersHorizontal,
  TriangleAlert,
  Wallet,
  X,
} from "lucide-react";
import type { ComponentType } from "react";

import { cn } from "@/lib/utils";

import { Card, CropImage, Eyebrow, IconCircle, Pill, TONE, type Tone } from "./primitives";
import { IMAGES, vpbankContent } from "./vpbank-content";

type Icon = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>;

/* ───────────────────────── 01 Overview ───────────────────────── */

const JOURNEY_ICONS: [Icon, Tone][] = [
  [Coins, "green"],
  [CreditCard, "blue"],
  [Wallet, "orange"],
  [TriangleAlert, "red"],
];

function BalanceChart() {
  const c = vpbankContent.overview.context;
  const H = 170;
  return (
    <figure
      aria-label={`${c.chartTitle} ${c.chartSub}: ${c.bars.map((b) => `${b.year} ${b.label}`).join(", ")}. ${c.cagrLabel} ${c.cagr}.`}
      className="rounded-lg border border-white/[0.08] bg-[#131826] p-3.5"
    >
      <p className="text-[11px] font-bold tracking-wide text-[#4ade80]">
        {c.chartTitle} <span className="font-normal text-[#a7b0c0]">{c.chartSub}</span>
      </p>
      <div className="mt-3 flex gap-2">
        <div className="relative w-9 shrink-0" style={{ height: H }} aria-hidden="true">
          {c.axisTicks
            .filter((t) => t % 400 === 0)
            .map((t) => (
              <span
                key={t}
                className="absolute right-0 -translate-y-1/2 text-[10px] text-white/45"
                style={{ top: `${100 - (t / c.axisMax) * 100}%` }}
              >
                {t === 0 ? "0" : `${t.toLocaleString("en-US")}K`}
              </span>
            ))}
        </div>
        <div className="relative min-w-0 flex-1" style={{ height: H + 22 }}>
          <div className="absolute inset-x-0 top-0" style={{ height: H }} aria-hidden="true">
            {c.axisTicks
              .filter((t) => t % 400 === 0)
              .map((t) => (
                <span
                  key={t}
                  className="absolute inset-x-0 border-t border-white/[0.07]"
                  style={{ top: `${100 - (t / c.axisMax) * 100}%` }}
                />
              ))}
          </div>
          <div className="absolute inset-x-0 top-0 flex items-end justify-between gap-1 px-0.5" style={{ height: H }}>
            {c.bars.map((b) => (
              <div key={b.year} className="relative flex h-full w-full flex-col items-center justify-end">
                <span className="mb-0.5 text-[10px] font-semibold text-white/90">{b.label}</span>
                <span
                  className="w-full max-w-[2.8rem] rounded-t-sm bg-gradient-to-t from-[#16a34a] to-[#4ade80]"
                  style={{ height: `${(b.value / c.axisMax) * 100}%` }}
                />
              </div>
            ))}
          </div>
          <div className="absolute inset-x-0 flex justify-between gap-1 px-0.5" style={{ top: H + 5 }}>
            {c.bars.map((b) => (
              <span key={b.year} className="w-full text-center text-[10px] text-white/60">
                {b.year}
              </span>
            ))}
          </div>
          <div className="absolute left-[16%] top-1 rounded-md border border-dashed border-[#22c55e]/60 bg-[#131826] px-2.5 py-1 text-center">
            <p className="text-[9px] font-semibold text-[#a7b0c0]">{c.cagrLabel}</p>
            <p className="text-lg font-bold leading-tight text-[#4ade80]">{c.cagr}</p>
          </div>
        </div>
      </div>
      <p className="mt-2 text-[10px] text-white/40">{c.source}</p>
    </figure>
  );
}

export function OverviewModule() {
  const { context, journey } = vpbankContent.overview;
  return (
    <div className="space-y-3">
      <Card tone="green" className="p-4 sm:p-5">
        <div className="grid gap-4 @2xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] @2xl:items-center @2xl:gap-6">
          <div>
            <Pill tone="green">{context.tag}</Pill>
            <h3 className="mt-3 text-lg font-bold leading-snug text-white">{context.title}</h3>
            <p className="mt-1.5 text-sm leading-snug text-[#a7b0c0]">{context.sub}</p>
          </div>
          <BalanceChart />
        </div>
      </Card>

      <div className="flex justify-center" aria-hidden="true">
        <ArrowDown className="h-5 w-5 text-white/35" />
      </div>

      <Card tone="blue">
        <Pill tone="blue" className="whitespace-normal">
          {journey.tag}
        </Pill>
        <ol className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5 @2xl:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] @2xl:items-start">
          {journey.steps.map((title, i) => {
            const [I, tone] = JOURNEY_ICONS[i];
            return (
              <li key={title} className="contents">
                <div className="flex flex-col items-start gap-2 @2xl:items-center @2xl:text-center">
                  <IconCircle tone={tone} className="h-14 w-14">
                    <I className="h-6 w-6" />
                  </IconCircle>
                  <p className="text-sm font-semibold leading-snug text-white">{title}</p>
                </div>
                {i < journey.steps.length - 1 ? (
                  <ArrowRight aria-hidden="true" className="mt-4 hidden h-5 w-5 shrink-0 text-white/35 @2xl:block" />
                ) : null}
              </li>
            );
          })}
        </ol>
      </Card>
    </div>
  );
}

/* ───────────────────────── 02 Problem ───────────────────────── */

const PROBLEM_NODES: [Icon, Tone][] = [
  [FileText, "green"],
  [Database, "blue"],
  [ShoppingCart, "orange"],
  [CircleAlert, "orange"],
  [X, "red"],
];

export function ProblemModule() {
  const { steps } = vpbankContent.problem;
  return (
    <Card className="p-5 sm:p-6">
      <ol className="grid gap-5 @md:grid-cols-2 @2xl:grid-cols-5">
        {steps.map((s, i) => {
          const [I, tone] = PROBLEM_NODES[i];
          return (
            <li key={s.title} className="relative flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <IconCircle tone={tone} className="h-14 w-14">
                  <I className="h-6 w-6" />
                </IconCircle>
                {i < steps.length - 1 ? (
                  <ArrowRight aria-hidden="true" className="hidden h-4 w-4 text-white/30 @2xl:block" />
                ) : null}
              </div>
              <p className="text-[15px] font-semibold leading-tight text-white">{s.title}</p>
              <p className="text-[13px] leading-snug text-[#a7b0c0]">{s.text}</p>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

/* ───────────────────────── 03 Evidence ───────────────────────── */

const STAGE_ICONS: Icon[] = [Coins, ShoppingCart, ListChecks, EyeOff, Hourglass];

export function EvidenceModule() {
  const { journey: j } = vpbankContent.evidence;
  const last = j.stages.length - 1;
  return (
    <Card className="p-4 sm:p-5">
      <Eyebrow tone="blue">{j.eyebrow}</Eyebrow>
      <h3 className="mt-1 text-lg font-bold leading-snug text-white">{j.title}</h3>

      {/* One grid: every stage card and its timeline point share a column,
          so each label is centred under its stage at every width. */}
      <ol className="mt-5 grid gap-x-3 gap-y-5 @2xl:grid-cols-[1fr_1fr_1fr_1.4fr_1fr]">
        {j.stages.map((st, i) => {
          const I = STAGE_ICONS[i];
          const risk = "questions" in st;
          const marker = j.timeline[i];
          const gap = i === 3;
          return (
            <li key={st.title} className="flex min-w-0 flex-col gap-3">
              <div
                className={cn(
                  "flex flex-1 flex-col gap-2.5 rounded-xl border p-3.5",
                  risk
                    ? "border-[#ef4444]/60 bg-[#ef4444]/[0.1] ring-1 ring-[#ef4444]/20"
                    : "border-white/[0.08] bg-white/[0.03]",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      risk ? TONE.red.chip : TONE.blue.chip,
                    )}
                  >
                    {i + 1}
                  </span>
                  <IconCircle tone={risk ? "red" : "blue"} className="h-9 w-9">
                    <I className="h-4 w-4" />
                  </IconCircle>
                </div>
                <p className={cn("text-sm font-semibold leading-snug @3xl:text-[15px]", risk ? "text-[#f87171]" : "text-white")}>
                  {st.title}
                </p>
                {"questions" in st ? (
                  <ul className="space-y-1.5 text-[13px] leading-snug text-white/85">
                    {st.questions.map((q) => (
                      <li key={q} className="flex gap-2">
                        <span aria-hidden="true" className="text-[#f87171]">
                          •
                        </span>
                        {q}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs leading-snug text-[#a7b0c0] @3xl:text-[13px]">{st.text}</p>
                )}
              </div>

              <div className="flex flex-col items-center gap-1.5 text-center">
                <div className="relative flex h-3 w-full items-center justify-center">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute top-1/2 hidden h-px bg-white/15 @2xl:block",
                      i === 0 ? "left-1/2 right-[-0.375rem]" : i === last ? "left-[-0.375rem] right-1/2" : "inset-x-[-0.375rem]",
                    )}
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative h-2.5 w-2.5 rounded-full",
                      gap ? "bg-[#ef4444] ring-4 ring-[#ef4444]/25" : "bg-white/40",
                    )}
                  />
                </div>
                <span className={cn("text-[11px] leading-tight", gap ? "font-bold text-[#f87171]" : "text-white/55")}>
                  {marker}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

/* ───────────────────────── 04 Insight ───────────────────────── */

/** Source-pixel boxes of the two original phone screens in 04-insight-01.png. */
const LOCK_SCREEN = { x: 96, y: 310, w: 334, h: 392 };
const APP_SCREEN = { x: 1030, y: 298, w: 416, h: 424 };

export function InsightModule() {
  const c = vpbankContent.insight;
  const img = IMAGES.insight;
  return (
    <div className="grid gap-4 @2xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.1fr)] @2xl:items-stretch">
      {/* Secondary: the old, insufficient approach — muted but readable. */}
      <Card tone="neutral" className="flex flex-col border-white/[0.06] bg-[#0b0e15]">
        <p className="text-[11px] font-bold tracking-[0.14em] text-white/35">{c.left.eyebrow}</p>
        <h3 className="mt-1 text-base font-semibold leading-snug text-white/55">{c.left.title}</h3>
        <p className="mt-3 text-[11px] font-bold tracking-[0.14em] text-white/35">{c.remindLabel}</p>
        <p className="text-sm italic text-white/45">{c.remindQuote}</p>
        <div className="mt-4 flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-[#b98d8d]"
          >
            <Bell className="h-[18px] w-[18px]" />
          </span>
          <div>
            <p className="text-sm font-bold text-white/55">{c.left.kind}</p>
            <p className="text-xs text-white/40">{c.left.kindText}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-[minmax(0,8.75rem)_1fr] items-start gap-4">
          <CropImage
            src={img.src}
            width={img.width}
            height={img.height}
            crop={LOCK_SCREEN}
            alt={c.notificationAlt}
            className="rounded-[1.4rem] opacity-55 saturate-50"
          />
          <ul className="space-y-1.5">
            {c.left.chain.map((s, i) => (
              <li key={s} className="flex flex-col items-start gap-1.5">
                <span className="w-full rounded-lg bg-white/[0.03] px-3 py-2 text-[13px] leading-snug text-white/45">
                  {s}
                </span>
                {i < c.left.chain.length - 1 ? (
                  <ArrowDown aria-hidden="true" className="ml-4 h-3.5 w-3.5 text-white/20" />
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <div className="flex items-center justify-center">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#22c55e]/15 text-xs font-bold text-[#4ade80]">
          vs.
        </span>
      </div>

      {/* Primary: decision support — high contrast. */}
      <Card
        tone="green"
        className="flex flex-col border-[#22c55e]/60 bg-[#22c55e]/[0.09] shadow-[0_0_0_1px_rgba(34,197,94,0.15)]"
      >
        <p className="text-[11px] font-bold tracking-[0.14em] text-[#60a5fa]">{c.right.eyebrow}</p>
        <h3 className="mt-1 text-xl font-bold leading-snug text-white">{c.right.title}</h3>
        <p className="mt-3 text-[11px] font-bold tracking-[0.14em] text-[#4ade80]">{c.decideLabel}</p>
        <p className="text-sm italic text-white/85">{c.decideQuote}</p>
        <div className="mt-4 flex items-center gap-2.5">
          <IconCircle tone="green">
            <ChartColumn className="h-[18px] w-[18px]" />
          </IconCircle>
          <div>
            <p className="text-sm font-bold text-[#4ade80]">{c.right.kind}</p>
            <p className="text-xs text-[#c4cbd8]">{c.right.kindText}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-[minmax(0,10rem)_1fr] items-start gap-4">
          <CropImage
            src={img.src}
            width={img.width}
            height={img.height}
            crop={APP_SCREEN}
            alt={c.appAlt}
            className="rounded-t-[1.6rem] ring-1 ring-[#22c55e]/50"
          />
          <ol>
            {c.right.steps.map((s, i) => (
              <li key={s.title}>
                <p className="text-[15px] font-semibold text-white">{s.title}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-[#c4cbd8]">{s.text}</p>
                {i < c.right.steps.length - 1 ? (
                  <ArrowDown aria-hidden="true" className="my-2 h-4 w-4 text-[#22c55e]" />
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </Card>
    </div>
  );
}

/* ───────────────────────── 05 Decision ───────────────────────── */

const OPTION_ICONS: Icon[] = [Bell, ChartPie, SlidersHorizontal, ChartColumn];

export function DecisionModule() {
  const d = vpbankContent.decision;
  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-5">
        <Eyebrow>{d.eyebrow}</Eyebrow>
        <h3 className="mt-1 text-lg font-bold leading-snug text-white">{d.title}</h3>
        <ul className="mt-4 grid gap-3 @md:grid-cols-2 @2xl:grid-cols-4">
          {d.options.map((o, i) => {
            const I = OPTION_ICONS[i];
            const tone = o.tone as Tone;
            const best = o.tone === "green";
            return (
              <li
                key={o.title}
                className={cn(
                  "flex flex-col gap-2 rounded-xl border p-3.5",
                  best ? "border-[#22c55e]/60 bg-[#22c55e]/[0.09]" : "border-white/[0.08] bg-white/[0.03]",
                )}
              >
                <div className="flex items-start gap-2.5">
                  <IconCircle tone={tone} className="h-9 w-9">
                    <I className="h-4 w-4" />
                  </IconCircle>
                  <p className="text-sm font-semibold leading-tight text-white">{o.title}</p>
                </div>
                <p className="text-xs leading-snug text-[#a7b0c0]">{o.text}</p>
                <Pill tone={tone} className="mt-auto normal-case tracking-normal">
                  {o.verdict}
                </Pill>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="grid gap-3 @2xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] @2xl:items-stretch">
        <Card tone="green" className="p-4 sm:p-5">
          <Pill tone="green">{d.phase1.tag}</Pill>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#4ade80]">{d.phase1.name}</p>
          <p className="mt-2 text-sm text-white/85">{d.phase1.text}</p>
        </Card>
        <div className="flex items-center justify-center">
          <ArrowRight aria-hidden="true" className="h-6 w-6 rotate-90 text-[#3b82f6] @2xl:rotate-0" />
        </div>
        <Card tone="blue" className="p-4 sm:p-5">
          <Pill tone="blue">{d.phase2.tag}</Pill>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#60a5fa]">{d.phase2.name}</p>
          <p className="mt-2 text-sm text-white/85">{d.phase2.text}</p>
        </Card>
      </div>
    </div>
  );
}
