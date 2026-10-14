import { ArrowRight, Check, Lightbulb, MessageSquare, Target } from "lucide-react";

import { cn } from "@/lib/utils";

import { momoContent } from "./momo-content";
import {
  BulletList,
  Card,
  IconBadge,
  ScrollTable,
  StatCard,
} from "./primitives";
import { ZoomImage } from "./zoom-image";

const c = momoContent.sections;

const TH = "px-4 py-3 text-left text-xs font-semibold text-white/62";
const TD = "px-4 py-3 text-sm text-white/75";
/** Opaque so the sticky first column doesn't show scrolled cells through it. */
const STICKY = "sticky left-0 bg-[#130d1a]";

/** Small "Proposed" / "Case data"-style label. */
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-white/20 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-white/62">
      {children}
    </span>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="text-xs leading-relaxed text-white/55">{children}</p>;
}

/* 01 */
export function OverviewModule() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {c.overview.stats.map((s) => (
          <StatCard key={s.label} value={s.value} label={s.label} />
        ))}
      </div>
      <div className="flex flex-wrap items-start gap-2">
        <Tag>{c.overview.typeLabel}</Tag>
        <p className="min-w-0 flex-1 basis-64 text-xs leading-relaxed text-white/55">
          {c.overview.footnote}
        </p>
      </div>
    </div>
  );
}

/* 02 */
export function ProblemModule() {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-3">
        {c.problem.cards.map((card) => (
          <Card key={card.title}>
            {/* Icon and title share one top row; pt-2 centers the title's
                first line on the 40px icon. */}
            <div className="flex items-start gap-3">
              <IconBadge>
                <Target className="h-5 w-5" />
              </IconBadge>
              <h3 className="min-w-0 pt-2 font-semibold leading-6 text-[#ebe7ef]">
                {card.title}
              </h3>
            </div>
            <p className="mt-3 text-sm text-white/62">{card.body}</p>
          </Card>
        ))}
      </div>
      <Card className="py-4">
        <p className="text-sm text-white/75">
          <span className="font-semibold text-[#ebe7ef]">Guiding question: </span>
          {c.problem.question}
        </p>
      </Card>
    </div>
  );
}

/* 03 — neutral: no row, column or cell is emphasized. */
export function EvidenceModule() {
  const { segments, criteria, takeaway, dataNoteShort, dataNoteTitle, dataNote } =
    c.evidence;
  return (
    <div className="space-y-3">
      <ScrollTable label="Segment comparison table">
        <table className="w-full min-w-[42rem] border-collapse tabular-nums">
          <thead className="bg-white/5">
            <tr>
              <th scope="col" className={cn(TH, STICKY, "w-[15rem]")}>
                Criteria
              </th>
              {segments.map((seg) => (
                <th key={seg} scope="col" className={TH}>
                  {seg}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((row) => (
              <tr key={row.label} className="border-t border-white/10">
                <th
                  scope="row"
                  className={cn(TD, STICKY, "py-3.5 text-left font-semibold")}
                >
                  {row.label}
                </th>
                {row.values.map((value, i) => (
                  <td key={i} className={cn(TD, "py-3.5")}>
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollTable>
      <Card className="flex items-start gap-3 py-4">
        <IconBadge>
          <Lightbulb className="h-5 w-5" />
        </IconBadge>
        <p className="pt-2 text-sm text-white/75">{takeaway}</p>
      </Card>
      <Note>{dataNoteShort}</Note>
      <details className="group rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
        <summary className="cursor-pointer list-none text-white/72 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e6007e] [&::-webkit-details-marker]:hidden">
          <span className="font-semibold text-[#ebe7ef]">{dataNoteTitle}</span>
          <span
            aria-hidden="true"
            className="ml-2 text-xs text-white/50 group-open:hidden"
          >
            Show
          </span>
          <span
            aria-hidden="true"
            className="ml-2 hidden text-xs text-white/50 group-open:inline"
          >
            Hide
          </span>
        </summary>
        <p className="mt-3 leading-relaxed text-white/68">{dataNote}</p>
      </details>
    </div>
  );
}

/* 04 */
export function InsightModule() {
  const icons = [Target, MessageSquare, Lightbulb];
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {c.insight.cards.map((card, i) => {
          const Icon = icons[i];
          return (
            <Card key={card.title}>
              <div className="flex items-center gap-2">
                <IconBadge>
                  <Icon className="h-5 w-5" />
                </IconBadge>
                <h3 className="font-semibold text-[#ebe7ef]">{card.title}</h3>
              </div>
              {"caption" in card ? (
                <p className="mt-2 text-xs text-white/55">{card.caption}</p>
              ) : null}
              <div className="mt-4">
                <BulletList items={card.bullets} />
              </div>
            </Card>
          );
        })}
        <Card highlighted>
          <h3 className="font-semibold text-[#ebe7ef]">
            {c.insight.hypothesis.title}
          </h3>
          <div className="mt-2">
            <Tag>{c.insight.hypothesis.tag}</Tag>
          </div>
          <p className="mt-3 text-sm text-white/75">
            {c.insight.hypothesis.body}
          </p>
        </Card>
      </div>
      <Note>{c.insight.boundary}</Note>
    </div>
  );
}

/* 05 — the only section that emphasizes the selected segment. */
export function DecisionModule() {
  const d = c.decision;
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <ScrollTable label="Decision scorecard">
          <table className="w-full min-w-[34rem] border-collapse">
            <thead className="bg-white/5">
              <tr>
                <th scope="col" className={cn(TH, STICKY)}>
                  Criteria
                </th>
                {d.options.map((opt, i) => (
                  <th
                    key={opt}
                    scope="col"
                    className={cn(
                      TH,
                      i === d.chosenIndex && "bg-[#e6007e]/15 text-[#ff4fa8]",
                    )}
                  >
                    {opt}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.criteria.map((row) => (
                <tr key={row.label} className="border-t border-white/10">
                  <th
                    scope="row"
                    className={cn(TD, STICKY, "text-left font-medium")}
                  >
                    {row.label}
                  </th>
                  {row.values.map((value, i) => (
                    <td
                      key={i}
                      className={cn(
                        TD,
                        i === d.chosenIndex && "bg-[#e6007e]/10",
                      )}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-white/10">
                <th
                  scope="row"
                  className={cn(TD, STICKY, "text-left font-semibold")}
                >
                  Overall
                </th>
                {d.overall.map((value, i) => (
                  <td
                    key={i}
                    className={cn(
                      "px-4 py-3 text-sm",
                      i === d.chosenIndex
                        ? "bg-[#e6007e] font-semibold text-[#ebe7ef]"
                        : "text-white/62",
                    )}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </ScrollTable>
        <Note>{d.scorecardNote}</Note>
      </div>

      <Card highlighted>
        <h3 className="font-semibold text-[#ebe7ef]">{d.selected.title}</h3>
        <p className="mt-2 text-base text-white/80">{d.selected.body}</p>
      </Card>

      <div className="grid items-start gap-3 md:grid-cols-2">
        <Card>
          <h3 className="font-semibold text-[#ebe7ef]">{d.tradeoff.title}</h3>
          <p className="mt-2 text-sm text-white/72">{d.tradeoff.body}</p>
        </Card>
        <Card>
          <h3 className="font-semibold text-[#ebe7ef]">{d.against.title}</h3>
          <p className="mt-2 text-sm text-white/72">{d.against.body}</p>
        </Card>
      </div>
    </div>
  );
}

/* 06 — the two approved screens in two separate, equal-weight cards: no
   overlap, no tilt. Widths are derived from the screens' aspect ratios
   (0.615 : 0.567) so both render at the same height. Display-only crop;
   the enlarged view shows the complete original file. */
export function SolutionModule() {
  const s = c.solution;
  const maxWidths = ["max-w-[21rem]", "max-w-[19.35rem]"];

  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <h3 className="text-xl font-semibold text-[#ebe7ef]">{s.headline}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/68">
          {s.phoneA.trigger}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {s.images.map((img, i) => (
          <figure
            key={img.src}
            className="flex min-w-0 flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
          >
            <div className={cn("w-full", maxWidths[i])}>
              <ZoomImage
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                crop={img.crop}
                filter={"filter" in img ? img.filter : undefined}
                label={img.caption}
                frameClassName="shadow-[0_18px_44px_-18px_rgba(230,0,126,0.45)] ring-1 ring-white/15"
              />
            </div>
            <figcaption className="mt-5 text-center text-sm font-medium leading-snug text-white/72">
              {img.caption}
            </figcaption>
          </figure>
        ))}
      </div>

      <ul className="grid gap-3 md:grid-cols-3">
        {s.principles.map((p) => (
          <li
            key={p.title}
            className="min-w-0 break-words rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm"
          >
            <span className="block font-semibold text-[#ebe7ef]">{p.title}</span>
            <span className="mt-1 block text-white/62">{p.body}</span>
          </li>
        ))}
      </ul>

      <Note>{s.conceptNote}</Note>
    </div>
  );
}

/* 07 — light and visual: journey, one inline constraints note, GTM
   visuals. The strategy image is dominant; the creative is supporting and
   deliberately NOT forced to the same height. */
export function ExperienceModule() {
  const { title, steps, constraints, images, visualsNote } = c.experience;
  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-3 font-semibold text-[#ebe7ef]">{title}</h3>
        <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="relative">
              <Card className="h-full">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e6007e] text-sm font-bold text-[#ebe7ef]">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#ebe7ef]">
                      {step.title}
                    </p>
                    <p className="text-xs text-[#ff4fa8]">{step.subtitle}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-white/62">{step.body}</p>
              </Card>
              {i < steps.length - 1 ? (
                <ArrowRight
                  aria-hidden="true"
                  className="absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-[#e6007e] xl:block"
                />
              ) : null}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-white/62">{constraints.body}</p>
      </div>

      {/* Asymmetric ~68 / 32 split, top-aligned. Each visual sits in its
          own card at its natural aspect ratio — heights are NOT forced
          equal. Stacks (strategy first) below lg. */}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
        {[images.strategy, images.creative].map((img, i) => (
          <figure
            key={img.src}
            className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4"
          >
            <div className={cn(i === 1 && "mx-auto max-w-sm lg:max-w-none")}>
              <ZoomImage
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                label={img.caption}
              />
            </div>
            <figcaption className="mt-3 text-sm leading-snug text-white/68">
              {img.caption}
            </figcaption>
          </figure>
        ))}
      </div>

      <Note>{visualsNote}</Note>
    </div>
  );
}

/* 08 — a proposed pilot: what is measured, why it matters, when to scale
   vs. pivot. Rendered full-width (see `wide` in momo-case-study.tsx) so the
   three cards get real room. Cards share one height; rows inside each card
   distribute evenly, so no card ends with dead space. No results, no
   progress bar. */
function GroupLabel({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-wide",
        accent ? "text-[#ff4fa8]" : "text-white/55",
      )}
    >
      {children}
    </p>
  );
}

export function MeasureModule() {
  const m = c.measure;
  const { experiment, priority, rule } = m.cards;

  return (
    <div className="space-y-4">
      <p className="inline-block rounded-md border border-[#e6007e]/60 bg-[#e6007e]/10 px-3 py-1.5 text-sm font-semibold text-[#ebe7ef]">
        {m.statusLabel}
      </p>

      <div className="grid items-stretch gap-3 md:grid-cols-2 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,1.2fr)]">
        <Card className="flex flex-col">
          <h3 className="font-semibold text-[#ebe7ef]">{experiment.title}</h3>
          <ul className="mt-4 flex flex-1 flex-col divide-y divide-white/10 text-sm text-white/62">
            {experiment.bullets.map((b) => (
              <li key={b} className="flex flex-1 items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#e6007e]"
                />
                {b}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="flex flex-col">
          <h3 className="font-semibold text-[#ebe7ef]">{priority.title}</h3>
          <ol className="mt-4 flex flex-1 flex-col divide-y divide-white/10">
            {priority.items.map((item, i) => (
              <li
                key={item.title}
                className="flex flex-1 items-center gap-3 py-3 text-sm first:pt-0 last:pb-0"
              >
                <span
                  aria-hidden="true"
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e6007e]/20 text-xs font-bold text-[#ff4fa8]"
                >
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-[#ebe7ef]">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-white/62">{item.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </Card>

        {/* Spans both columns at md (two internal columns), single column
            at lg where it becomes the third card. */}
        <Card className="flex flex-col md:col-span-2 lg:col-span-1">
          <h3 className="font-semibold text-[#ebe7ef]">{rule.title}</h3>
          <div className="mt-4 grid flex-1 gap-4 md:grid-cols-2 lg:grid-cols-1">
            <div>
              <GroupLabel accent>{rule.scaleIf.label}</GroupLabel>
              <div className="mt-2">
                <BulletList items={rule.scaleIf.bullets} />
              </div>
            </div>
            <div className="border-t border-white/10 pt-4 md:border-l md:border-t-0 md:pl-4 md:pt-0 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-4">
              <GroupLabel>{rule.pivotIf.label}</GroupLabel>
              <div className="mt-2">
                <BulletList items={rule.pivotIf.bullets} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Note>{m.note}</Note>
    </div>
  );
}

/* 09 */
export function ReflectionModule() {
  const { learned, next, closing } = c.reflection;
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2">
            <IconBadge>
              <Check className="h-5 w-5" />
            </IconBadge>
            <h3 className="font-semibold text-[#ebe7ef]">{learned.title}</h3>
          </div>
          <div className="mt-4">
            <BulletList items={learned.bullets} />
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-2">
            <IconBadge>
              <ArrowRight className="h-5 w-5" />
            </IconBadge>
            <h3 className="font-semibold text-[#ebe7ef]">{next.title}</h3>
          </div>
          <div className="mt-4">
            <BulletList items={next.bullets} />
          </div>
        </Card>
      </div>
      <p className="text-sm italic leading-relaxed text-white/72">{closing}</p>
    </div>
  );
}
