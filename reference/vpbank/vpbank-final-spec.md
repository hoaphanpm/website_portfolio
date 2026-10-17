# VPBank Case Study — Final Static Page Specification

Status: **FINAL ARCHITECTURE — awaiting STEP 4 approval. Not implemented.**
Branch: `redesign/vpbank-case-study`
Case: `vpbank-ai-debt-management` (CMS draft, uuid `f192686e-a2db-4ae9-9d8e-9f6ec3b6654b`, left untouched)
Evidence convention: **CMS** = approved text in `vpbank-cms-export.json` · **Image** = text visible in an exported CMS image · **Ref** = visible only in the design reference · **Brief** = given in the STEP 3C/3D briefs · **Proposed** = target, not a result.

---

## 0. Architecture — FINAL

- VPBank is an **independent static page** with dedicated components, built the same way as MoMo (copy-and-rename architecture only; MoMo is neither a design nor a content source).
- **No CMS rendering, no hybrid.** The page does not read Supabase. The CMS draft stays unmodified, unpublished and unlisted; `vpbank-cms-export.json` is the approved content snapshot.
- Route: `app/(public)/case-studies/<slug>/page.tsx`, `noindex`, not linked from any listing. Working slug: `vpbank-ai-debt-management-v2` (a config constant; change is a one-line edit).
- Code: `components/case-study/vpbank/` only. Assets: `public/images/case-studies/vpbank/` only (originals never modified).
- Analytics: wired through the existing shared hook, **disabled** (`VPBANK_EVENTS_ENABLED = false`), still exactly the five approved events, no new events or properties. `case_id` is a placeholder until mapping is decided.
- Isolation: no imports from `components/case-study/momo`; allowed imports only `@/lib/*`, `@/components/analytics/*`, `@/components/ui/*`.
- Untouched: MoMo, CMS/Supabase, shared analytics, global styles, production routes, deployment config.

---

## 1. Source-of-truth hierarchy

| Priority | Source | Decides |
|---|---|---|
| 1 | `vpbank-design-reference.png` (724×2172) | Layout, composition, hierarchy, typography, spacing, dark theme |
| 2 | `vpbank-cms-export.json` | Approved headings/body, tags, prototype link, image metadata, order |
| 3 | 9 exported PNGs | Diagram content, product screens, numbers, labels |
| 4 | Briefs | Visible section names, Phase 2 URL, proposed targets |

Rules: copy conflict → CMS wins; layout conflict → reference wins; a reference element with no approved source (CMS, image or brief) is **excluded**, not guessed (see §9).
Reference limitation: 724 px wide, so small text is not reliably legible. Only copy verified in CMS/image/brief is final; unreadable reference sublines are omitted (§9).

---

## 2. Hero

| Field | Value | Source |
|---|---|---|
| Eyebrow | VPBank - AI-Assisted Debt Management | CMS |
| Headline | Helping borrowers avoid late payments before they happen. | CMS |
| Summary | A two-phase product strategy to help multi-loan customers first control repayment risk, then prevent it earlier. | CMS |
| Tags | Lending · JTBD · Product Discovery · Product Strategy · AI | CMS |
| CTA | "Explore prototype ↗" → Phase 1 URL (§7), new tab | CMS |
| Visual | from `00-hero-01.png` | CMS |

Layout (Ref): text left, visual right; sticky left nav with "← Back to homepage" and the nine section names. Mobile: text above visual; nav becomes a compact top bar.
Visual treatment (**C + A**): the two phone screens are cropped from `00-hero-01.png` and shown untouched inside a dark card; the surrounding labels are rebuilt in HTML — "REPAYMENT RISK" (red), Phase 1 CONTROL "Existing risk" Detect → Prioritize → Plan (green), Phase 2 PREVENT "Before risk appears" Protect → Simulate → Adjust (blue). Rotated phones carry a soft light halo; accepted, softened by rounded mask and a dark card behind.
Alt (CMS): "Two-phase product strategy for controlling and preventing repayment risk".

---

## 3. Section inventory and final image treatment

Treatment classes: **A** rebuild in HTML/CSS/SVG (all copy transcribed from the source image, nothing added) · **C** original raster phone screens, cropped only, never redrawn. Class **B** (recolored raster assets) is not used: no layered source exists, and inversion is prohibited, so A is the efficient dark-theme adaptation for every diagram.

| # | key | Visible name | CMS heading | Image | Treatment |
|---|---|---|---|---|---|
| 01 | overview | At a Glance | Growth creates value — and more repayment complexity. | `01-overview-01.png` | **A** (chart in SVG/HTML) |
| 02 | problem | The Challenge | The problem was not another repayment reminder. | `02-problem-01.png` | **A** |
| 03 | evidence | Finding the Real Problem | I treated the initial problem as a hypothesis. | `03-evidence-01.png` | **A** |
| 04 | insight | Key Insight | Repayment risk starts before the due date. | `04-insight-01.png` | **A + C** (two phone crops) |
| 05 | decision | Product Decision | Control first. Prevent next. | `05-decision-01.png` | **A** |
| 06 | solution | The Solution | Two connected experiences: Control → Prevent | `06-solution-01.png`, `06-solution-02.png` | **A + C** (10 phone crops) |
| 07 | experience | Experiment | — (no CMS section; brief + Ref) | none | **A** |
| 08 | measure | Validation & Metrics | Measure behavior change, not feature usage. | `08-measure-01.png` | **A** |
| 09 | reflection | Reflection | The product opportunity moved upstream. | none | **A** |

Section headings and bodies are the CMS strings verbatim (line breaks kept). Internal keys unchanged; "Experiment" is a page-local label for `experience`.
Overview heading: CMS wording is used (rule §1). Section 05 chrome reads "05 · Product Decision" (reference typo "03 / Product Problem" is not copied).
Alt text for `08-measure-01.png` on the page: "Proposed validation targets by phase" (the CMS alt says "funnel" and does not match the image; CMS untouched).

### 3.1 01 At a Glance
CMS body as lede. Module (A): left card "BUSINESS CONTEXT — VPBank's retail lending portfolio continues to grow. More customers are managing multiple repayment obligations at the same time." with the bar chart **VPBANK CREDIT OUTSTANDING BALANCE (End of Year)**: 2020 ~320K · 2021 384K · 2022 480K · 2023 636K · 2024 ~710K · 2025 961K, CAGR (2020–2025) 24%, axis 0–1,200K, "Sources: VPBank Annual Reports & Financial Statements". Values, "~" markers and the source line are reproduced exactly; no unit is added because the image gives none. Right: "FROM GROWTH TO A MORE COMPLEX REPAYMENT JOURNEY" — More lending relationships → Multiple loans at the same time → Limited visibility → Shortfall discovered late (with the image's one-line captions); below it "PRODUCT SOLUTION" — Phase 1 — CONTROL "Manage a repayment risk that already exists." (Early Risk Detection · Shortfall Preview · Priority Suggestion · Minimal Plan · Recovery) → Phase 2 — PREVENT "Protect repayment money before risk appears." (Money with Purpose · Commitments Detection · Safe-to-Spend · Simulation · Smart Action). This delivers the growth → complexity → two-phase connection.

### 3.2 02 The Challenge (A)
Five nodes, copy exactly as in the image: Multiple loans across providers — "Customers had loans from different banks and financial providers." → Fragmented information — "Repayment dates, balances and terms were scattered across multiple channels." → Unexpected spending — "Daily expenses and sudden costs disrupted their financial plan." → Shortfall discovered late — "Many only realized a lack of funds close to the due date." → Poor repayment decisions — "This led to last-minute borrowing, late fees or missed payments." Accents: green, blue, orange, orange→red, red.

### 3.3 03 Finding the Real Problem (A)
Module = the CUSTOMER REPAYMENT JOURNEY from the image: title "Where customers lose visibility before repayment becomes urgent."; stages 1 Borrow & use · 2 Manage day to day · 3 Check loan by loan · 4 Limited visibility (red-highlighted, four questions + "Shortfall may only become visible near the due date.") · 5 Repayment becomes urgent; timeline Loan taken · Time passes · Approaching due dates · **Visibility gap** · Payment due. VND amounts and due dates exactly as in the image.
Reference research elements — only where source exists:
- **Included:** three finding cards named from the CMS body — *Fragmented visibility*, *Late awareness*, *Weak prioritization* — each with a one-line description taken only from the journey image ("Hard to see the full picture"; "Shortfall may only become visible near the due date"; "Which one to prioritize?").
- **Excluded (no approved source):** the five research-method chips (Journey / Customer Forces / Alternatives / Segmentation / JTBD), the JTBD statement, the "Research artifacts" thumbnails, and the sentence "I conducted a lean research process".

### 3.4 04 Key Insight (A + C)
Left card (muted/red): "FROM AWARENESS — A repayment reminder is often too late." REMINDER "Tells customers that payment is due." with the lock-screen notification crop (C) and the chain Your payment is due soon → But the money may have already been spent. → Too late to make a meaningful decision. Right card (green): "TO DECISION SUPPORT — Give visibility and a clear next action, before it's too late." with the VPBank app crop (C) and See the risk early ("You may be short 2,000,000 VND.") → Understand what to do ("Here is what needs attention first.") → Take action ("Create a plan or adjust spending before it becomes urgent."). CMS body REMIND/DECIDE and "See the risk → Understand it → Act early" rendered as the reference's step list. Phone figures are illustrative mock data and are not reconciled or altered.

### 3.5 05 Product Decision (A)
"OPTIONS CONSIDERED — Several directions were evaluated before deciding where to focus." Four cards: More reminders (Notify customers about upcoming due dates.) — *Not enough* · Full personal finance management (Help customers manage all income and spending.) — *Too broad* · Default automation (Auto-pay or auto-allocation.) — *Limited fit* · Decision support (Show risk, prioritize actions and suggest a realistic plan.) — *Best starting point* (green emphasis). Below, **Phase 1 CONTROL** "Manage a repayment risk that already exists." Detect risk → Preview shortfall → Prioritize repayment → Create plan → Recover, with the red LIMITATION "The shortfall has already been created. Phase 1 helps customers react and manage, but it cannot recover money that has already been spent." → **Phase 2 PREVENT** "Intervene before repayment money is spent." Protect money → Confirm commitments → Calculate safe-to-spend → Simulate impact → Adjust spending.

### 3.6 06 The Solution (A + C)
Two stacked panels, per the reference:
1. **PHASE 1 — CONTROL · DEBT MANAGEMENT** (green): strapline "Detect, prioritize and act on an existing repayment risk — so customers avoid late fees and keep their repayment status stable." Five steps — 1 Early Risk Detection · 2 Shortfall Preview · 3 Priority Suggestion · 4 Minimal Decision Flow · 5 Recovery Flow — each = HTML number/title + one cropped phone from `06-solution-01.png` (C), with HTML arrows between.
2. **Transition block "What Phase 1 does not solve"** (HTML): Spending (Daily expenses) → Shortfall (Not enough for repayments) → Phase 1 Control existing risk, with dashed "Move intervention here" pointing to Phase 2 Prevent — before it happens. Supporting sentence, from the Image (`05-decision-01.png` limitation): "It cannot recover money that has already been spent."
3. **PHASE 2 — PREVENT · AI FINANCIAL ASSISTANT** (blue): five steps — 1 Money with Purpose Summary · 2 Fixed Commitment Intelligence · 3 Spending Simulation · 4 Smart Action Suggestions · 5 Protective Guardrail & Phase 1 Handoff — phones cropped from `06-solution-02.png` (C). Steps 3 and 5 are red/orange in the source (risk/warning) and stay so.
4. **Relationship strip**: Phase 2 → Shortfall occurs → Phase 1 (CMS: "If prevention fails: Phase 2 → Shortfall → Phase 1").
Crops: five equal column rectangles per image at original resolution (exact pixel boxes determined and recorded in the implementation step); no scaling up, no recoloring, no redrawing. Click-to-zoom shows the crop at full resolution.

### 3.7 07 Experiment (A)
Heading (page-local, since no CMS section exists): "From product hypothesis to testable experience." Lede: "I built interactive prototypes for both phases, designed to be tested with target users." — no statement that testing happened; a small tag "Prototype · not yet user-tested" on each card.
- **Card 1 — Phase 1 prototype — Debt management** (green): "Designed to test whether risk visibility leads to repayment action." Flow: Risk alert → Shortfall → Priority → Plan. Button "Try Phase 1 prototype ↗" → `https://claude.ai/public/artifacts/00fc3440-5c48-4877-bd1e-6472e0d224f3`
- **Card 2 — Phase 2 prototype — AI risk prevention** (blue): "Designed to test whether repayment impact changes spending behavior." Flow: Safe-to-Spend → Simulation → Warning → Decision change. Button "Try Phase 2 prototype ↗" → `https://claude.ai/public/artifacts/a4de6acd-5d97-4f5b-a74c-92b244b06d9e`
Each card shows one phone crop already used in §3.6 (Phase 1: step 3; Phase 2: step 3); both buttons `target="_blank" rel="noopener noreferrer"`.

### 3.8 08 Validation & Metrics (A)
- Banner (always visible): **"Proposed validation targets — not actual results."**
- CMS body as lede ("…these concepts have not been launched…").
- **Behavior change funnel** (Ref composition): Exposure → Understand risk → Takes action → Behavior change → Repayment outcome. Step captions are rendered only where they are legible/verified (§9); the five step names are final.
- **Two columns** (Phase 1 green / Phase 2 blue). Each column has three **targeted** rows (Image, exact values) and the reference's metrics that have **no defined target**, shown with a muted "No target defined" chip:

| Phase | Tier | Metric | Proposed target |
|---|---|---|---|
| 1 | North Star / Primary | Repayment Plan Success Rate | ≥65% |
| 1 | Business Impact | Delinquency Roll Rate Reduction | ≥10–15% vs baseline |
| 1 | Counter Metric | Ignore Rate | <20% |
| 1 | Leading (Ref) | Priority Acceptance Rate | No target defined |
| 1 | Outcome / Guardrail (Ref) | Fewer late payments · Wrong Priority Suggestion | No target defined |
| 2 | North Star / Primary | Post-warning Behavior Change Rate | ≥10–15% |
| 2 | Business Impact | Shortfall Case Reduction | ≥15–20% vs control |
| 2 | Counter Metric | Alert Fatigue Rate | <15% |
| 2 | Leading (Ref) | Post-simulation Adjustment | No target defined |
| 2 | Outcome / Guardrail (Ref) | Fewer shortfalls created · Prediction / Simulation Error | No target defined |

Targets are never attached to a metric whose name differs from the image's. No baseline, sample size or timeline is added.

### 3.9 09 Reflection (A)
Layout follows the reference: heading + the CMS first-person reflection, split at its existing sentences into the reference's text column and highlighted closing statement ("I would still need real customer behavior to prove whether that assumption is true."), with the red/orange→green "upstream" motif. No lessons, findings or results added. Reference-only cards are excluded (§9).

---

## 4. Image-to-section mapping

| Local file | Section | Dims | Use |
|---|---|---|---|
| `00-hero-01.png` | Hero | 2006×784 | C: two phone crops |
| `01-overview-01.png` | 01 | 1672×941 | A: reference for rebuild (data preserved) |
| `02-problem-01.png` | 02 | 2056×765 | A |
| `03-evidence-01.png` | 03 | 2006×784 | A |
| `04-insight-01.png` | 04 | 2006×784 | A + C (2 phone crops) |
| `05-decision-01.png` | 05 | 2006×784 | A |
| `06-solution-01.png` | 06 Phase 1 | 2006×784 | C: 5 phone crops |
| `06-solution-02.png` | 06 Phase 2 | 2006×784 | C: 5 phone crops |
| `08-measure-01.png` | 08 | 1672×941 | A: targets source |

Originals stay in place unmodified. Crops are produced in the build step as separate files (e.g. `…/crops/06-solution-01-step-1.png`) or via CSS `object-position`; either way originals are byte-identical (SHA-256 check against `vpbank-image-manifest.json`).
Rasters that were not rebuilt (00, 04, 06 crops) are screens only — no white diagram is displayed inline on a dark card. Full originals are available only through an explicit "View original" lightbox.

---

## 5. Dark theme tokens (page-scoped; no global style edits)

| Token | Value | Use |
|---|---|---|
| `--vp-bg` | `#07090f` | page |
| `--vp-nav` | `#0a0d14` | left nav |
| `--vp-surface` / `-2` | `#0e121b` / `#131826` | cards / nested |
| `--vp-border` | `rgba(255,255,255,.08)` | card borders |
| `--vp-text` / `-2` / `-3` | `#f3f5f8` / `#a7b0c0` / `#6f7a8c` | headings / body / captions |
| `--vp-green` (+tint `rgba(34,197,94,.12)`) | `#22c55e` | Phase 1 |
| `--vp-blue` (+tint `rgba(59,130,246,.14)`) | `#3b82f6` | Phase 2 |
| `--vp-red` / `--vp-orange` (+tints) | `#ef4444` / `#f59e0b` | risk, warning, caution |
| CTA | white pill, dark text | primary buttons |

Values are starting points matched by eye to the reference and verified during visual comparison. Not MoMo pink. Rules: no `invert`/`hue-rotate`/blend tricks; body text ≥4.5:1; icons from `lucide-react`; each rebuilt diagram is real text (screen-reader friendly); 5-step rows become scroll-snap on mobile with phones never scaled below legibility.

---

## 6. Left navigation and tracking behaviour

Nav items: At a Glance · The Challenge · Finding the Real Problem · Key Insight · Product Decision · The Solution · Experiment · Validation & Metrics · Reflection. Active state follows scroll. Analytics mirrors the MoMo wiring pattern (events default disabled), completion section = `reflection`.

---

## 7. Prototype URLs

| Card | URL | Source |
|---|---|---|
| Phase 1 | https://claude.ai/public/artifacts/00fc3440-5c48-4877-bd1e-6472e0d224f3 | CMS + brief |
| Phase 2 | https://claude.ai/public/artifacts/a4de6acd-5d97-4f5b-a74c-92b244b06d9e | brief |

Hero CTA reuses Phase 1.

---

## 8. Implementation sequence

1. **Scaffold:** `vpbank-config.ts` (slug, case id placeholder, events disabled), `vpbank-content.ts` (all copy/URLs; image paths only here), route `page.tsx` (noindex), nav, section shell, theme tokens.
2. **Primitives and hero:** card/pill/arrow/step primitives; hero with phone crops.
3. **Sections 01–03:** chart + flows (A).
4. **Sections 04–05:** insight + decision.
5. **Section 06:** phone-crop steps, transition block, relationship strip.
6. **Sections 07–09:** experiment cards, metrics/funnel, reflection.
7. **Hardening:** responsive pass, a11y, lightbox, analytics wiring (disabled).
8. **Verification:** typecheck, lint, build; isolation grep; image hashes; route/image 200; visual comparison against the reference; transcription diff against the images.
Each step reported separately, committed only on request.

---

## 9. Excluded reference elements and verification holds

Not blockers — the page ships without them, and each is added only if the author later supplies approved text.

| Element | Reason |
|---|---|
| Research-method chips, JTBD statement, "Research artifacts" thumbnails, "lean research process" sentence | No approved source; thumbnails never exported |
| Reflection before/after question, three "Key learnings", three "Open questions" | Not in CMS; text illegible at 724 px; "do not invent lessons" |
| Metric one-line definitions under each reference metric row; funnel step sub-captions | Illegible at 724 px; names are used, definition sublines omitted until text is supplied |
| "Move intervention here ↗" hover/CTA | Not an interactive element in the source; rendered as a static label |

Known facts carried as-is, not changed: VND figures in journey/phone mockups are illustrative; the overview chart has no stated unit; the Phase 2 URL has not been opened from this environment.

---

## 10. Acceptance criteria (static page)

**Architecture / isolation**
- [ ] No CMS/Supabase reads; page renders from `vpbank-content.ts` only; CMS draft unmodified and unpublished.
- [ ] Changes confined to `components/case-study/vpbank/`, `app/(public)/case-studies/<slug>/`, `public/images/case-studies/vpbank/` (crops only) and `reference/vpbank/`.
- [ ] `git grep -n "case-study/momo\|case-studies/momo" -- components/case-study/vpbank` empty.
- [ ] No diffs in MoMo files, shared analytics, global styles, production routes, CMS, Supabase or deployment config.
- [ ] Page `noindex`, unlisted; events disabled; no new events/properties.

**Content**
- [ ] Hero + 9 sections in order; "Experiment" visible name for `experience`.
- [ ] CMS headings/bodies verbatim; no invented copy, numbers or results.
- [ ] All diagram text and numbers match their source image (transcription diff passes), including chart values, CAGR 24% and source line.
- [ ] Six targets exactly as §3.8, labelled proposed; metrics without targets marked "No target defined"; no "achieved/improved" language anywhere.
- [ ] Experiment: two buttons, correct URLs, new tab, no claim of completed user testing.
- [ ] Section 06 contains "What Phase 1 does not solve" and Phase 2 → Shortfall occurs → Phase 1.
- [ ] Excluded elements (§9) absent.

**Design**
- [ ] Dark theme, white headings, light body text, Phase 1 green, Phase 2 blue, risk red/orange, consistent borders/spacing.
- [ ] Left section navigation; hero text left, visual right.
- [ ] No inline white-background diagram on a dark card; no inversion filters; phone screens only as cropped originals.
- [ ] Matches reference composition ≥1280 px; usable at 375 px without page-level horizontal scroll.

**Quality**
- [ ] Original PNGs byte-identical (hash check); crops lossless.
- [ ] Typecheck, lint, build pass; page and image URLs 200; keyboard/focus/contrast checks pass.
