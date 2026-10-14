/**
 * Final website copy for the MoMo v2 page, from
 * reference/MoMo_Case_Study_Final_Website_Content.md (approved content
 * source). Nothing here is added beyond that file.
 *
 * Evidence convention (kept visible on the page where it matters):
 * Case data = provided by the challenge brief; Derived = calculated from
 * case inputs; Proposed = strategic judgment / concept / target;
 * Not tested = no actual pilot results.
 */

export const momoContent = {
  status: "Proposed strategy and pilot — not tested",
  hero: {
    eyebrow: "Product Strategy · Activation · Experimentation",
    headline: "Turning Payday Cash-Out Into a First Savings Habit",
    summary:
      "I compared three growth segments and designed a nine-week pilot to turn MoMo's payday cash-out behavior into a first savings habit.",
    chips: [
      "Product Strategy",
      "Growth Experimentation",
      "Financial Inclusion",
      "9-Week Pilot",
    ],
  },
  sections: {
    overview: {
      blurb:
        "MoMo had strong payment engagement but limited financial-service adoption. The challenge: choose one growth segment and validate an opportunity within nine weeks and a 3B VND budget.",
      stats: [
        { value: "32M", label: "Registered users" },
        { value: "68%", label: "Monthly active rate" },
        { value: "<15%", label: "Overall FS adoption (brief definition)" },
        { value: "3", label: "Growth segments evaluated" },
        { value: "3B VND", label: "Maximum pilot budget" },
        { value: "9 weeks", label: "Pilot decision window" },
      ],
      typeLabel: "Case data",
      footnote:
        "FS = financial services. Overall FS adoption (<15%) is distinct from the First Payment → FS funnel conversion rates compared in Evidence.",
    },
    problem: {
      blurb:
        "High payment activity wasn't translating into financial-service adoption. The challenge was to find a barrier that could be addressed and measured within a short pilot.",
      cards: [
        {
          title: "High usage, low FS adoption",
          body: "Frequent wallet transactions did not automatically lead to deeper financial engagement.",
        },
        {
          title: "Growth beyond payments",
          body: "MoMo needed to convert existing payment relationships into meaningful financial-service usage.",
        },
        {
          title: "Different barriers, limited time",
          body: "Three user segments faced different obstacles; one pilot could not solve them all.",
        },
      ],
      question:
        "Which segment offers the most testable path from payment to a first financial habit?",
    },
    evidence: {
      blurb:
        "I compared audience scale, unit economics, funnel performance, and behavioral barriers before choosing where to test.",
      // Neutral by design: no highlighted row/column, no preselected segment.
      segments: ["U23 (18–23)", "U40+ (40–55)", "Unbanked Tier-3 (25–45)"],
      criteria: [
        { label: "Activatable users", values: ["990K", "2.0M", "4.0M"] },
        { label: "Current MoMo penetration", values: ["34%", "14%", "5%"] },
        { label: "LTV / CAC", values: ["10.2×", "10.0×", "5.3×"] },
        {
          label: "Gross profit / activated user",
          values: ["379K VND", "1.332M VND", "252K VND"],
        },
        { label: "First Payment → FS", values: ["18%", "22%", "8%"] },
        { label: "FS → Active 3+ months", values: ["11%", "14%", "4%"] },
        {
          label: "Hypothesized barrier",
          values: [
            "Savings habit gap",
            "Trust / bank-link fear",
            "No clear next step",
          ],
        },
        {
          label: "Year-1 profit pool at 10% activation",
          values: ["37.5B VND", "266.4B VND", "100.8B VND"],
        },
      ],
      takeaway:
        "U40+ leads in near-term economics, while Unbanked has the largest activatable pool but the weakest funnel. No segment wins every dimension.",
      // Short visible line; the full methodology (incl. the unresolved LTV
      // label inconsistency) lives in the disclosure below the table.
      dataNoteShort:
        "Case inputs and scenario-based calculations, not actual pilot results.",
      dataNoteTitle: "Methodology and open assumptions",
      dataNote:
        "User counts, penetration, funnel rates, LTV and CAC are case inputs. Gross profit and Year-1 profit pools are derived under the brief's 10% activation scenario, not actual results. The brief's “monthly LTV” label conflicts with its instruction to use the values as 12-month LTV in Year-1 calculations; confirm this before an investment decision.",
    },
    insight: {
      blurb:
        "The opportunity wasn't simply another financial product. It was helping salary users move from receiving money to managing it.",
      cards: [
        {
          title: "What the data shows",
          bullets: [
            "Unbanked: 4M activatable users, 5% current penetration.",
            "Only 8% convert from First Payment → FS.",
            "Just 4% remain FS-active for 3+ months.",
          ],
        },
        {
          title: "User signals from case brief",
          caption: "Case-provided evidence, paraphrased",
          bullets: [
            "Salary arrives in MoMo, then gets withdrawn.",
            "Users are unsure what to do next with their balance.",
            "Trust and perceived control shape willingness to try.",
          ],
        },
        {
          title: "Interpretation",
          bullets: [
            "Receiving salary does not automatically create a saving habit.",
            "Payday provides a relevant, recurring moment.",
            "The first action should feel small, clear, and reversible.",
          ],
        },
      ],
      hypothesis: {
        title: "Product hypothesis",
        tag: "Proposed · not validated",
        body: "A timely, low-friction savings prompt after payday could increase first-time financial-service activation among eligible Unbanked salary users.",
      },
      boundary:
        "The hypothesis is proposed, not validated; the user statements are case evidence, not new interviews conducted for this portfolio.",
    },
    decision: {
      blurb:
        "I chose Unbanked salary users because their barrier was more testable in nine weeks, accepting weaker near-term economics in exchange for a clearer learning opportunity.",
      scorecardNote: "Qualitative judgment, not measured scores.",
      options: ["U23", "U40+", "Unbanked"],
      chosenIndex: 2,
      criteria: [
        { label: "Activatable user pool", values: ["Low", "Medium", "High"] },
        { label: "Near-term economics", values: ["Low", "High", "Medium"] },
        {
          label: "Barrier solvable in 9 weeks",
          values: ["Medium", "Low", "High"],
        },
        {
          label: "Strategic / inclusion fit",
          values: ["Medium", "Medium", "High"],
        },
        { label: "Competitive whitespace", values: ["Low", "Medium", "High"] },
      ],
      overall: [
        "Efficient, limited headroom",
        "Strong economics, hard trust barrier",
        "Chosen for pilot",
      ],
      selected: {
        title: "Selected growth segment",
        body: "Unbanked workers aged 25–45 receiving a fixed monthly salary through MoMo.",
      },
      // `why` and `filter` are retained verbatim but not rendered
      // (Step 8.2 simplification: the matrix already carries the reasoning).
      why: {
        title: "Why this segment?",
        items: [
          {
            title: "Predictable moment",
            body: "Salary arrives regularly in MoMo.",
          },
          {
            title: "Testable barrier",
            body: "A clearer next step can be piloted using existing touchpoints.",
          },
          {
            title: "Growth headroom",
            body: "4M activatable users and low current penetration.",
          },
        ],
      },
      tradeoff: {
        title: "Key trade-off",
        body: "Unbanked offers a clearer test but lower value per activated user. Its scenario-based 100.8B VND Year-1 profit pool is below the case's 200B VND Year-1 cost assumption.",
      },
      against: {
        title: "Strongest argument against",
        body: "U40+ offers 2.6× the projected Year-1 profit pool. I did not prioritize it because its trust and bank-linking barrier would be harder to resolve credibly within nine weeks.",
      },
      filter: {
        title: "Proposed early-adopter filter",
        tag: "Not validated",
        body: "Salary ≥5M VND/month; approximately 70–80% cash-out after payday; some wallet balance remains after essential spending. Validate eligibility and cohort size using transaction data before launch.",
      },
    },
    solution: {
      blurb:
        "After payday and an essential payment, MoMo suggests setting aside a small, editable amount in Túi Thần Tài.",
      headline: "One salary. One small decision.",
      conceptNote:
        "Proposed concept screens — not existing MoMo UI or shipped functionality. Product terms, returns and withdrawal wording shown in the screens are illustrative and unverified.",
      images: [
        {
          src: "/images/case-studies/momo/solution/screen-1-notification.png",
          width: 1075,
          height: 1463,
          // Display crop: device only (drops dark margin + baked-in label).
          crop: { x: 140, y: 105, w: 835, h: 1358, radius: "7% / 4.4%" },
          caption: "Screen 1 — Contextual prompt after payment",
          alt: "Proposed concept: a MoMo payment-successful screen with a savings prompt overlay offering to save 350,000 VND in Túi Thần Tài, with Later and Save now buttons.",
        },
        {
          src: "/images/case-studies/momo/solution/screen-2-bottom-sheet.png",
          width: 964,
          height: 1631,
          crop: { x: 40, y: 105, w: 865, h: 1526, radius: "10.5% / 6%" },
          // Presentation only: re-themes the approved light screen to dark
          // (partial invert + hue-rotate keeps hues and keeps the CTA a
          // saturated pink with legible label). Content is unchanged.
          filter: "invert(0.9) hue-rotate(180deg)",
          caption: "Screen 2 — Guided first saving action",
          alt: "Proposed concept: an in-app bottom sheet titled Save 350,000 VND in Túi, listing three benefit messages above a Save now button.",
        },
      ],
      phoneA: {
        caption: "Contextual entry point",
        title: "Payment successful",
        message:
          "You have money left in MoMo. Want to set aside a small amount?",
        primary: "Explore saving",
        secondary: "Later",
        trigger:
          "Trigger: first eligible essential payment within 0–48 hours after salary receipt, with remaining balance.",
      },
      phoneB: {
        caption: "First savings action",
        title: "Start with a small amount",
        rows: [
          "Suggested amount based on eligible balance, editable before confirmation",
          "Verified product terms, liquidity conditions, and any applicable risks",
        ],
        primary: "Review and confirm",
      },
      principles: [
        {
          title: "Context over browsing",
          body: "One relevant next step.",
        },
        {
          title: "Small and editable",
          body: "Users decide how much, if anything, to set aside.",
        },
        {
          title: "Clarity before returns",
          body: "Explain access, withdrawal terms, and risks before benefits.",
        },
      ],
    },
    experience: {
      blurb:
        "A nine-week pilot combines employer-led education, contextual prompts, and a guided first savings action.",
      title: "Post-Payday Activation Journey · 9 Weeks",
      steps: [
        {
          title: "Before payday",
          subtitle: "Build awareness",
          body: "Explain the concept through employer HR/payroll channels.",
        },
        {
          title: "Salary arrives",
          subtitle: "Identify eligibility",
          body: "Detect salary-linked users with a suitable remaining balance.",
        },
        {
          title: "First action",
          subtitle: "Reduce friction",
          body: "Show a contextual prompt and editable savings amount.",
        },
        {
          title: "Learn & iterate",
          subtitle: "Validate behavior",
          body: "Compare activation, retention, repeat saving, and guardrails.",
        },
      ],
      visualsNote:
        "Proposed pilot materials — illustrative concepts, not launched campaigns.",
      images: {
        strategy: {
          src: "/images/case-studies/momo/gtm/gtm-strategy.png",
          width: 1672,
          height: 941,
          caption: "GTM strategy — proposed activation and distribution approach",
          alt: "Proposed GTM strategy infographic in three stages: workplace communication before payday, an in-app contextual nudge at the right moment, and gentle retargeting if there is no action, with expected outcomes below.",
        },
        creative: {
          src: "/images/case-studies/momo/gtm/gtm-creative.png",
          width: 1122,
          height: 1402,
          caption: "GTM creative — proposed campaign communication asset",
          alt: "Proposed campaign creative: a poster titled One salary, one small decision, a new way to keep money, showing three app screens for setting aside, confirming and completing a saving in Túi Thần Tài.",
        },
      },
      // `constraints` is shown as one inline note. `levers` is retained
      // verbatim for future use but not rendered (the GTM strategy image
      // already covers channels) — do not delete.
      constraints: {
        title: "Pilot constraints",
        body: "9 weeks · ≤3B VND · eligible Unbanked salary users aged 25–45.",
      },
      levers: {
        title: "Growth levers",
        body: "Employer HR/payroll, workplace communication, QR/deep links, in-app prompt, and permission-based reminder. Limit retargeting to one relevant reminder for users who did not act.",
      },
    },
    measure: {
      blurb:
        "This pilot should answer three questions: Did we create real uplift, is the impact meaningful, and does the behavior continue after first activation?",
      statusLabel: "Proposed pilot · Not yet tested · No actual results",
      // Visible copy for Section 08 (Step 8.3 rewrite).
      cards: {
        experiment: {
          title: "Experiment",
          bullets: [
            "Eligible Unbanked salary users",
            "Treatment vs. control",
            "Nine-week pilot",
          ],
        },
        priority: {
          title: "Priority metrics",
          items: [
            {
              title: "Incremental FS activation rate",
              body: "Measures whether the pilot creates uplift vs. control.",
            },
            {
              title: "Incremental new FS users",
              body: "Shows whether the uplift is meaningful in absolute user volume.",
            },
            {
              title: "30-day retention rate",
              body: "Checks whether first activation turns into continued behavior.",
            },
          ],
        },
        rule: {
          title: "Scale / pivot rule",
          scaleIf: {
            label: "Scale if:",
            bullets: [
              "activation uplift is meaningful,",
              "new FS users are material,",
              "30-day retention improves,",
              "and guardrails remain healthy.",
            ],
          },
          pivotIf: {
            label: "Pivot / stop if:",
            bullets: [
              "there is no meaningful uplift vs. control,",
              "users fully withdraw within 48 hours and do not return,",
              "30-day retention is not better than control,",
              "or results work only at one employer partner.",
            ],
          },
        },
      },
      note: "Fast full withdrawal is a warning sign of trial without habit formation.",
      // Everything below (`design`, `outcome`, `scale`, `indicators`,
      // `economicsNote`) is the earlier full measurement definition,
      // retained verbatim for future use but NOT rendered — do not delete.
      design: {
        title: "Experiment design",
        rows: [
          [
            "Audience",
            "Eligible Unbanked salary users across multiple employer partners.",
          ],
          [
            "Treatment",
            "Employer education + contextual prompt + at most one eligible reminder.",
          ],
          [
            "Control",
            "Comparable eligible users following the existing experience.",
          ],
          [
            "Duration",
            "9 weeks, with D30 measurement restricted to sufficiently mature cohorts or completed in a follow-up observation window.",
          ],
        ],
      },
      outcome: {
        title: "Primary outcome",
        metricLabel: "Primary metric",
        metric:
          "Incremental 7-day first-FS activation lift = treatment activation rate − concurrent control activation rate, in percentage points.",
        definitionLabel: "Rate definition",
        definition:
          "Eligible users completing their first qualifying FS activation within 7 days of the defined entry event / all eligible users in that experiment arm. Define the same entry event and eligibility criteria for both arms before launch.",
        historicalLabel: "Historical context",
        historical:
          "8% First Payment → FS conversion in the case brief; not a measured control rate and not necessarily directly comparable until funnel definitions align.",
        targetLabel: "Proposed treatment target",
        target: "≥16% 7-day first-FS activation",
        targetNote:
          "Subject to confirming equivalent measurement definitions. This is a goal, not a result or guaranteed +8pp lift.",
        indicatorLabel: "Product-specific indicator",
        indicator: "First successful Túi Thần Tài deposit rate.",
      },
      scale: {
        title: "Scale decision",
        groups: [
          {
            label: "Behavior",
            body: "Positive incremental activation, stronger D30 retention and next-cycle repeat saving versus control.",
          },
          {
            label: "Business",
            body: "Acceptable acquisition cost and retained balance economics; results replicate across employer partners.",
          },
          {
            label: "Guardrails",
            body: "No material deterioration in rapid full withdrawal, opt-outs, negative feedback, or transaction issues.",
          },
        ],
        decision:
          "Scale only if behavior, trust, and economics support it; otherwise iterate the trigger, amount, message, or audience.",
      },
      indicators:
        "Also tracked: prompt exposure → click → successful deposit; incremental new FS users; Day-30 retained balance; cost per incremental activated user; 48-hour full-withdrawal rate; opt-out rate.",
      economicsNote:
        "100.8B VND and 200B VND are scenario-based Year-1 economics from the Decision analysis, not pilot outcomes.",
    },
    reflection: {
      blurb:
        "This case reminded me that the biggest opportunity on paper isn't always the best place to start.",
      learned: {
        title: "What the case taught me",
        bullets: [
          "A large market does not guarantee a solvable user problem.",
          "Short-term economics matter, but so does what a pilot can realistically prove.",
          "A first deposit is not the same as a lasting saving habit.",
        ],
      },
      next: {
        title: "What I would explore next",
        bullets: [
          "Check whether the assumed 70–80% cash-out pattern is common enough.",
          "Test whether users understand the savings terms and feel in control.",
          "Revisit cohort size, retention, and economics before expanding.",
        ],
      },
      closing:
        "I'd keep the decision provisional until the evidence shows that users come back to save—not just try it once.",
    },
  },
} as const;
