import { ArrowDown, ArrowRight, ArrowUpRight, FlaskConical, Lightbulb } from "lucide-react";
import { Fragment } from "react";

import { cn } from "@/lib/utils";

import { Card, IconCircle, Pill, TONE, type Tone } from "./primitives";
import { PreviewShot, PhoneStrip } from "./screenshots";
import { PHONE_SHOTS, vpbankContent } from "./vpbank-content";

/* ───────────────────────── 06 Solution ───────────────────────── */

function shotsFor(group: "phase1" | "phase2", titles: readonly string[], alts: readonly string[]) {
  return PHONE_SHOTS[group].map((p, i) => ({ ...p, title: titles[i], alt: alts[i] }));
}

export function SolutionModule() {
  const { phase1, phase2, limitation, relation, alt } = vpbankContent.solution;
  return (
    <div className="space-y-3">
      <Card tone="green">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4ade80]">
          {phase1.tag} <span className="text-white/50">· {phase1.name}</span>
        </p>
        <div className="mt-4">
          <PhoneStrip
            tone="green"
            steps={phase1.steps}
            shots={shotsFor("phase1", phase1.steps, alt.slice(0, 5))}
          />
        </div>
      </Card>

      <div className="flex flex-col items-center gap-2">
        <ArrowDown aria-hidden="true" className="h-5 w-5 text-white/35" />
        <div className="w-full rounded-xl border border-dashed border-[#f59e0b]/50 bg-[#f59e0b]/10 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#fbbf24]">{limitation.label}</p>
          <p className="mt-1 text-sm leading-snug text-[#d7dce6]">{limitation.text}</p>
        </div>
        <ArrowDown aria-hidden="true" className="h-5 w-5 text-white/35" />
      </div>

      <Card tone="blue">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#60a5fa]">
          {phase2.tag} <span className="text-white/50">· {phase2.name}</span>
        </p>
        <div className="mt-4">
          <PhoneStrip
            tone="blue"
            steps={phase2.steps}
            shots={shotsFor("phase2", phase2.steps, alt.slice(5))}
          />
        </div>
      </Card>

      <div className="rounded-xl border border-white/[0.09] bg-[#0e121b] p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">{relation.label}</p>
        <ol className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold">
          {relation.flow.map((f, i) => {
            const tone: Tone = i === 0 ? "blue" : i === 1 ? "red" : "green";
            return (
              <Fragment key={f}>
                <li className={cn("rounded-lg border px-3 py-1.5", TONE[tone].border, TONE[tone].bg, TONE[tone].text)}>
                  {f}
                </li>
                {i < relation.flow.length - 1 ? (
                  <li aria-hidden="true">
                    <ArrowRight className="h-4 w-4 text-white/40" />
                  </li>
                ) : null}
              </Fragment>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/* ───────────────────────── 07 Experiment ───────────────────────── */

export function ExperimentModule() {
  const { cards, status } = vpbankContent.experience;
  const previews = [
    { shot: PHONE_SHOTS.phase1[2], title: "Priority suggestion", alt: "Phase 1 prototype preview: priority suggestion screen" },
    { shot: PHONE_SHOTS.phase2[2], title: "Simulation", alt: "Phase 2 prototype preview: spending simulation screen" },
  ];
  return (
    <div className="grid gap-3 @2xl:grid-cols-2">
      {cards.map((c, i) => {
        const tone = c.tone as Tone;
        const pv = previews[i];
        return (
          <Card key={c.title} tone={tone} className="flex h-full flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={tone}>{c.tag}</Pill>
              <span className="inline-flex items-center gap-1 text-[11px] text-white/55">
                <FlaskConical aria-hidden="true" className="h-3 w-3" />
                {status}
              </span>
            </div>
            <h3 className="mt-3 text-lg font-bold leading-snug text-white">{c.title}</h3>
            <p className="mt-1.5 text-sm leading-snug text-[#a7b0c0]">{c.text}</p>
            <div className="mt-4 flex flex-1 items-center justify-center">
              <PreviewShot
                tone={tone}
                shot={{ ...pv.shot, title: pv.title, alt: pv.alt }}
                className="w-[14rem]"
              />
            </div>
            <ol className="mt-4 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-xs font-semibold text-white/85">
              {c.flow.map((f, j) => (
                <Fragment key={f}>
                  <li>{f}</li>
                  {j < c.flow.length - 1 ? (
                    <li aria-hidden="true">
                      <ArrowRight className={cn("h-3 w-3", TONE[tone].solid)} />
                    </li>
                  ) : null}
                </Fragment>
              ))}
            </ol>
            <a
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#07090f] transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#07090f]"
            >
              {c.cta}
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </a>
          </Card>
        );
      })}
    </div>
  );
}

/* ───────────────────────── 08 Measure ───────────────────────── */

type MetricRow = { kind: string; name: string; target: string; note?: string };

function MetricsCard({
  tone,
  title,
  rows,
}: {
  tone: Tone;
  title: string;
  rows: readonly MetricRow[];
}) {
  const { proposed } = vpbankContent.measure;
  return (
    <Card tone={tone} className="h-full">
      <h3 className={cn("text-sm font-bold", TONE[tone].text)}>{title}</h3>
      <ul className="mt-3 space-y-2">
        {rows.map((r) => {
          const primary = r.kind === "North Star metric";
          const guard = r.kind.startsWith("Guardrail");
          return (
            <li
              key={r.name}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5",
                primary
                  ? [TONE[tone].border, "bg-black/20"]
                  : guard
                    ? "border-[#f59e0b]/30 bg-[#f59e0b]/[0.06]"
                    : "border-white/[0.07] bg-black/20",
              )}
            >
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.12em]",
                    guard ? "text-[#fbbf24]" : primary ? TONE[tone].text : "text-white/50",
                  )}
                >
                  {r.kind}
                </p>
                <p className={cn("mt-0.5 leading-snug text-white", primary ? "text-[15px] font-bold" : "text-sm font-medium")}>
                  {r.name}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-white/45">{proposed}</p>
                <p className={cn("font-bold leading-tight", primary ? "text-xl" : "text-lg", TONE[tone].text)}>
                  {r.target}
                </p>
                {r.note ? <p className="text-[11px] text-[#a7b0c0]">{r.note}</p> : null}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export function MeasureModule() {
  const { phase1, phase2 } = vpbankContent.measure;
  return (
    <div className="space-y-3">
      <div className="grid gap-3 @3xl:grid-cols-2">
        <MetricsCard tone="green" title={phase1.title} rows={phase1.rows} />
        <MetricsCard tone="blue" title={phase2.title} rows={phase2.rows} />
      </div>
    </div>
  );
}

/* ───────────────────────── 09 Reflection ───────────────────────── */

function Bullets({ items, dot }: { items: readonly string[]; dot: string }) {
  return (
    <ul className="space-y-2.5 text-sm leading-relaxed text-white/72">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5">
          <span aria-hidden="true" className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", dot)} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ReflectionModule() {
  const { learned, next } = vpbankContent.reflection;
  return (
    <div className="grid gap-3 @2xl:grid-cols-2">
      <Card tone="neutral" className="h-full">
        <div className="flex items-center gap-3">
          <IconCircle tone="green" className="h-10 w-10">
            <Lightbulb className="h-5 w-5" />
          </IconCircle>
          <h3 className="font-semibold text-white">{learned.title}</h3>
        </div>
        <div className="mt-4">
          <Bullets items={learned.bullets} dot="bg-[#4ade80]" />
        </div>
      </Card>
      <Card tone="neutral" className="h-full">
        <div className="flex items-center gap-3">
          <IconCircle tone="blue" className="h-10 w-10">
            <ArrowRight className="h-5 w-5" />
          </IconCircle>
          <h3 className="font-semibold text-white">{next.title}</h3>
        </div>
        <div className="mt-4">
          <Bullets items={next.bullets} dot="bg-[#60a5fa]" />
        </div>
      </Card>
    </div>
  );
}
