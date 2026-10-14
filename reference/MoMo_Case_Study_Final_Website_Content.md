# MoMo Case Study — Final Website Content

**Content language:** English  
**Case type:** Take-home product strategy case  
**Status:** Proposed strategy and pilot — not tested  
**Implementation:** Static React/Tailwind case-study page; replace placeholders, preserve section IDs and existing Mixpanel tracking.

> **Evidence convention:** **Case data** = provided by the challenge brief; **Derived** = calculated from case inputs; **Proposed** = strategic judgment, product concept, or experiment target; **Not tested** = no actual pilot results. Do not present proposed or derived figures as realized business outcomes.

---

## HERO

**Eyebrow:** Product Strategy · Activation · Experimentation

**Headline:** Turning Payday Cash-Out Into a First Savings Habit

**Subtitle:** I compared three growth segments and designed a nine-week pilot to turn MoMo's payday cash-out behavior into a first savings habit.

**Tags (4):** Product Strategy · Growth Experimentation · Financial Inclusion · 9-Week Pilot

**Hero visual (implementation direction, not on-page copy):** Show the proposed salary/payment moment and a contextual savings prompt on a phone, followed by a first-deposit screen. Use existing authorized brand assets if available; otherwise build HTML/CSS mockups. Do not invent real product screenshots or imply this pilot shipped.

---

## 01 — OVERVIEW

**Section summary:** MoMo had strong payment engagement but limited financial-service adoption. The challenge: choose one growth segment and validate an opportunity within nine weeks and a 3B VND budget.

**Six metric cards:**

| Value | Label | Evidence type |
|---|---|---|
| 32M | Registered users | Case data |
| 68% | Monthly active rate | Case data |
| <15% | Overall FS adoption (brief definition) | Case data |
| 4M | Activatable Unbanked users | Case data |
| 3B VND | Maximum pilot budget | Case data |
| 9 weeks | Pilot decision window | Case data |

**Optional footnote:** FS = financial services. Overall FS adoption (<15%) is distinct from the First Payment → FS funnel conversion rates compared in Evidence.

---

## 02 — PROBLEM

**Section summary:** High payment activity wasn't translating into financial-service adoption. The challenge was to find a barrier that could be addressed and measured within a short pilot.

**Card 1 — High usage, low FS adoption**  
Frequent wallet transactions did not automatically lead to deeper financial engagement.

**Card 2 — Growth beyond payments**  
MoMo needed to convert existing payment relationships into meaningful financial-service usage.

**Card 3 — Different barriers, limited time**  
Three user segments faced different obstacles; one pilot could not solve them all.

**Guiding question (optional short callout):** Which segment offers the most testable path from payment to a first financial habit?

---

## 03 — EVIDENCE

**Section summary:** I compared audience scale, unit economics, funnel performance, and behavioral barriers before choosing where to test.

**Segment comparison (neutral table — NO highlighted row or preselected segment):**

| Criteria | U23 (18–23) | U40+ (40–55) | Unbanked Tier-3 (25–45) |
|---|---:|---:|---:|
| Activatable users | 990K | 2.0M | 4.0M |
| Current MoMo penetration | 34% | 14% | 5% |
| LTV / CAC | 10.2× | 10.0× | 5.3× |
| Gross profit / activated user | 379K VND | 1.332M VND | 252K VND |
| First Payment → FS | 18% | 22% | 8% |
| FS → Active 3+ months | 11% | 14% | 4% |
| Primary barrier | Savings habit gap | Trust / bank-link fear | No clear next step |
| Year-1 profit pool at 10% activation | 37.5B VND | 266.4B VND | 100.8B VND |

**Takeaway:** U40+ leads in near-term economics, while Unbanked has the largest activatable pool but the weakest funnel. No segment wins every dimension.

**Compact data note:** User counts, penetration, funnel rates, LTV and CAC are case inputs. Gross profit and Year-1 profit pools are derived under the brief's 10% activation scenario, not actual results. The brief's “monthly LTV” label conflicts with its instruction to use the values as 12-month LTV in Year-1 calculations; confirm this before an investment decision.

**Source detail retained for calculation traceability (not required in main UI):**

| Input | U23 | U40+ | Unbanked |
|---|---:|---:|---:|
| LTV input as provided | 420K VND | 1.48M VND | 310K VND |
| CAC | 41K VND | 148K VND | 58K VND |
| Direct competitors (case) | 4 | 3 | 0 |
| Activated users at 10% | 99K | 200K | 400K |

---

## 04 — INSIGHT

**Section summary:** The opportunity wasn't simply another financial product. It was helping salary users move from receiving money to managing it.

**Card 1 — What the data shows**
- Unbanked: 4M activatable users, 5% current penetration.
- Only 8% convert from First Payment → FS.
- Just 4% remain FS-active for 3+ months.

**Card 2 — What users say (case-provided evidence, paraphrased)**
- Salary arrives in MoMo, then gets withdrawn.
- Users are unsure what to do next with their balance.
- Trust and perceived control shape willingness to try.

**Card 3 — Interpretation**
- Receiving salary does not automatically create a saving habit.
- Payday provides a relevant, recurring moment.
- The first action should feel small, clear, and reversible.

**Card 4 — Proposed product hypothesis**  
A timely, low-friction savings prompt after payday could increase first-time financial-service activation among eligible Unbanked salary users.

**Evidence boundary:** The hypothesis is proposed, not validated; the user statements are case evidence, not new interviews conducted for this portfolio.

---

## 05 — DECISION

**Section summary:** I chose Unbanked salary users because their barrier was more testable in nine weeks, accepting weaker near-term economics in exchange for a clearer learning opportunity.

**Decision scorecard (qualitative judgment, not measured scores):**

| Criteria | U23 | U40+ | Unbanked |
|---|---|---|---|
| Activatable user pool | Low | Medium | High |
| Near-term economics | Low | High | Medium |
| Barrier solvable in 9 weeks | Medium | Low | High |
| Strategic / inclusion fit | Medium | Medium | High |
| Competitive whitespace | Low | Medium | High |
| Overall | Efficient, limited headroom | Strong economics, hard trust barrier | **Chosen for pilot** |

**Selected growth segment:** Unbanked workers aged 25–45 receiving a fixed monthly salary through MoMo.

**Why this segment?**
- **Predictable moment:** Salary arrives regularly in MoMo.
- **Testable barrier:** A clearer next step can be piloted using existing touchpoints.
- **Growth headroom:** 4M activatable users and low current penetration.

**Key trade-off:** Unbanked offers a clearer test but lower value per activated user. Its scenario-based 100.8B VND Year-1 profit pool is below the case's 200B VND Year-1 cost assumption.

**Strongest argument against:** U40+ offers 2.6× the projected Year-1 profit pool. I did not prioritize it because its trust and bank-linking barrier would be harder to resolve credibly within nine weeks.

**Proposed early-adopter filter (small note, not validated):** Salary ≥5M VND/month; approximately 70–80% cash-out after payday; some wallet balance remains after essential spending. Validate eligibility and cohort size using transaction data before launch.

---

## 06 — SOLUTION

**Section summary:** After payday and an essential payment, MoMo suggests setting aside a small, editable amount in Túi Thần Tài.

**Solution headline:** One salary. One small decision.

**Phone A — Contextual entry point**
- **Title:** Payment successful
- **Trigger:** First eligible essential payment within 0–48 hours after salary receipt, with remaining balance.
- **Message:** “You have money left in MoMo. Want to set aside a small amount?”
- **Primary CTA:** Explore saving
- **Secondary CTA:** Later

**Phone B — First savings action**
- **Title:** Start with a small amount
- **Content:** Suggested amount based on eligible balance, editable before confirmation; show verified product terms, liquidity conditions, and any applicable risks.
- **Primary CTA:** Review and confirm

**Three design principles:**
- **Context over browsing:** One relevant next step.
- **Small and editable:** Users decide how much, if anything, to set aside.
- **Clarity before returns:** Explain access, withdrawal terms, and risks before benefits.

**Product-claim guardrail (implementation note):** Do not state “safer than cash,” “no bank account required,” “withdraw anytime without approval,” or “earn daily returns” as verified facts unless confirmed against the actual Túi Thần Tài terms. The screens are proposed concepts, not existing product UI.

---

## 07 — EXPERIENCE

**Section summary:** A nine-week pilot combines employer-led education, contextual prompts, and a guided first savings action.

**Journey title:** Post-Payday Activation Journey · 9 Weeks

| Stage | Objective | Main action |
|---|---|---|
| 1 · Before payday | Build awareness | Explain the concept through employer HR/payroll channels. |
| 2 · Salary arrives | Identify eligibility | Detect salary-linked users with a suitable remaining balance. |
| 3 · First action | Reduce friction | Show a contextual prompt and editable savings amount. |
| 4 · Learn & iterate | Validate behavior | Compare activation, retention, repeat saving, and guardrails. |

**Pilot constraints:** 9 weeks · ≤3B VND · eligible Unbanked salary users aged 25–45.

**Growth levers (small note):** Employer HR/payroll, workplace communication, QR/deep links, in-app prompt, and permission-based reminder. Limit retargeting to one relevant reminder for users who did not act.

---

## 08 — MEASURE

**Section summary:** A controlled pilot will test incremental activation, sustained saving behavior, and unit economics before scale.

**Card 1 — Experiment design**
- **Audience:** Eligible Unbanked salary users across multiple employer partners.
- **Treatment:** Employer education + contextual prompt + at most one eligible reminder.
- **Control:** Comparable eligible users following the existing experience.
- **Duration:** 9 weeks, with D30 measurement restricted to sufficiently mature cohorts or completed in a follow-up observation window.

**Card 2 — Primary outcome**
- **Primary metric:** Incremental 7-day first-FS activation lift = treatment activation rate − concurrent control activation rate, in percentage points.
- **Rate definition:** Eligible users completing their first qualifying FS activation within 7 days of the defined entry event / all eligible users in that experiment arm. Define the same entry event and eligibility criteria for both arms before launch.
- **Historical context:** 8% First Payment → FS conversion in the case brief; not a measured control rate and not necessarily directly comparable until funnel definitions align.
- **Proposed treatment target:** ≥16% 7-day first-FS activation, subject to confirming equivalent measurement definitions. This is a goal, not a result or guaranteed +8pp lift.
- **Product-specific indicator:** First successful Túi Thần Tài deposit rate.

**Card 3 — Scale decision**
- **Behavior:** Positive incremental activation, stronger D30 retention and next-cycle repeat saving versus control.
- **Business:** Acceptable acquisition cost and retained balance economics; results replicate across employer partners.
- **Guardrails:** No material deterioration in rapid full withdrawal, opt-outs, negative feedback, or transaction issues.
- **Decision:** Scale only if behavior, trust, and economics support it; otherwise iterate the trigger, amount, message, or audience.

**Additional indicators (optional detail, not all need to appear in UI):** Prompt exposure → click → successful deposit; incremental new FS users; Day-30 retained balance; cost per incremental activated user; 48-hour full-withdrawal rate; opt-out rate.

**Status label — always visible:** **Proposed pilot · Not yet tested · No actual results**.

**Important:** 100.8B VND and 200B VND are scenario-based Year-1 economics from the Decision analysis, not pilot outcomes. Do not display them as an experiment result progress bar.

---

## 09 — REFLECTION

**Section summary (personal voice):** This case reminded me that the biggest opportunity on paper isn't always the best place to start.

**Card 1 — What the case taught me**
- A large market does not guarantee a solvable user problem.
- Short-term economics matter, but so does what a pilot can realistically prove.
- A first deposit is not the same as a lasting saving habit.

**Card 2 — What I would explore next**
- Check whether the assumed 70–80% cash-out pattern is common enough.
- Test whether users understand the savings terms and feel in control.
- Revisit cohort size, retention, and economics before expanding.

**Optional closing line:** I'd keep the decision provisional until the evidence shows that users come back to save—not just try it once.

---

## CLAUDE IMPLEMENTATION NOTES — NOT WEBSITE COPY

1. Replace placeholder text in the existing static MoMo React/Tailwind page. Do not reintroduce the CMS or modify other case studies.
2. Keep the nine section IDs and existing Mixpanel events/visibility thresholds, and preserve the sidebar's active-section behavior.
3. Use the short section summaries and cards as visible UI copy. Treat optional notes and source-detail tables as implementation guidance, footnotes, or content to retain outside the main visual hierarchy.
4. Evidence must remain neutral: no selected row, pink highlight, or winner language. Emphasize the selected Unbanked segment only in Decision.
5. Mark proposed hypothesis, early-adopter filter, pilot targets, and not-tested status clearly. Do not invent results, quotes, or product claims.
6. On mobile, make the Evidence table horizontally scrollable or use accessible stacked cards; preserve all comparisons.
7. Keep hero and solution visuals as HTML/CSS/React mockups or authorized assets, not a flattened screenshot of the whole case study.
8. Do not change global styling, navigation, routes, production case-study content, or analytics schemas unless explicitly approved.
9. Verify responsive rendering, accessibility, typecheck/build, and section-level tracking wiring. Report modified files and any missing source assets.
