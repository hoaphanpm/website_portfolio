import { VPBANK_IMAGE_BASE } from "./vpbank-config";

/**
 * All VPBank page copy. Section introductions are the approved STEP 4A.2
 * wording; diagram copy is transcribed
 * from the exported CMS images. Image URLs live only here.
 *
 * Specification: reference/vpbank/vpbank-final-spec.md
 */

export type NavItem = {
  id: string;
  label: string;
  /** False until the section ships (STEP 4B): shown in the nav, not linked. */
  available: boolean;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { id: "overview", label: "Overview", available: true },
  { id: "problem", label: "Problem", available: true },
  { id: "evidence", label: "Evidence", available: true },
  { id: "insight", label: "Insight", available: true },
  { id: "decision", label: "Decision", available: true },
  { id: "solution", label: "Solution", available: true },
  { id: "experiment", label: "Experiment", available: true },
  { id: "measure", label: "Measure", available: true },
  { id: "reflection", label: "Reflection", available: true },
];

export const heroImage = {
  src: `${VPBANK_IMAGE_BASE}/en/hero-final-en.png`,
  width: 1188,
  height: 860,
  alt: "Two-phase product strategy for controlling and preventing repayment risk",
} as const;

export const vpbankContent = {
  hero: {
    eyebrow: "VPBank - AI-Assisted Debt Management",
    headline: "Protect Loan Portfolio Quality by Preventing Missed Payments",
    summary:
      "To reduce repayment risk and protect loan portfolio quality, I proposed a two-phase product strategy to help multi-loan customers first manage repayment risks, then prevent future missed payments.",
    tags: ["Lending", "Product Strategy", "AI Assistant"],
    phase1: { tag: "PHASE 1 — CONTROL", sub: "Existing risk", steps: ["Detect", "Prioritize", "Plan"] },
    phase2: { tag: "PHASE 2 — PREVENT", sub: "Before risk appears", steps: ["Protect", "Simulate", "Adjust"] },
    riskLabel: "REPAYMENT RISK",
  },

  overview: {
    intro:
      "As lending relationships grew, customers had more repayment obligations to manage at once. That made visibility—not reminders—the problem worth investigating.",
    context: {
      tag: "BUSINESS CONTEXT",
      title: "VPBank’s retail lending portfolio continues to grow.",
      sub: "More customers are managing multiple repayment obligations at the same time.",
      chartTitle: "VPBANK CREDIT OUTSTANDING BALANCE",
      chartSub: "(End of Year)",
      cagrLabel: "CAGR (2020–2025)",
      cagr: "24%",
      source: "Sources: VPBank Annual Reports & Financial Statements",
      axisMax: 1200,
      axisTicks: [0, 200, 400, 600, 800, 1000, 1200],
      bars: [
        { year: "2020", value: 320, label: "~320K" },
        { year: "2021", value: 384, label: "384K" },
        { year: "2022", value: 480, label: "480K" },
        { year: "2023", value: 636, label: "636K" },
        { year: "2024", value: 710, label: "~710K" },
        { year: "2025", value: 961, label: "961K" },
      ],
    },
    journey: {
      tag: "FROM GROWTH TO A MORE COMPLEX REPAYMENT JOURNEY",
      steps: [
        "Growing lending relationships",
        "Multiple repayment obligations",
        "Limited visibility",
        "Shortfall discovered late",
      ],
    },
  },

  problem: {
    intro:
      "Customers could track each loan and still lose sight of the full repayment picture. The next question was where that visibility broke down.",
    steps: [
      { title: "Multiple loans across providers", text: "Customers had loans from different financial providers." },
      { title: "Fragmented information", text: "Repayment dates, balances and terms were scattered across multiple channels." },
      { title: "Unexpected spending", text: "Daily expenses and unexpected costs disrupted their financial plan." },
      { title: "Shortfall discovered late", text: "Many only realized a lack of funds close to the due date." },
      { title: "Poor repayment decisions", text: "This led to last-minute borrowing, late fees or missed payments." },
    ],
  },

  evidence: {
    intro:
      "The repayment journey revealed a visibility gap before payment became urgent, when options were already narrowing. That shifted the problem from awareness to earlier decision support.",
    journey: {
      eyebrow: "CUSTOMER REPAYMENT JOURNEY",
      title: "Where customers lose visibility before repayment becomes urgent.",
      stages: [
        { title: "Borrow across products", text: "Take multiple loans over time." },
        { title: "Spend & manage money", text: "Spend and pay for daily needs." },
        { title: "Track repayments separately", text: "See each loan separately." },
        {
          title: "Lose the full picture",
          questions: [
            "How much do I owe in total?",
            "Do I have enough money?",
            "What should I prioritize?",
          ],
        },
        { title: "Repayment becomes urgent", text: "Limited options, higher risk." },
      ],
      timeline: ["Loan taken", "Time passes", "Approaching due dates", "Visibility gap", "Payment due"],
    },
  },

  insight: {
    intro:
      "A reminder can flag a payment, but it cannot prevent a cash shortfall. Customers needed to see risk, understand it, and act earlier.",
    remindLabel: "REMIND",
    remindQuote: "“Your payment is due.”",
    decideLabel: "DECIDE",
    decideQuote: "“You may be short. Here is what needs attention first.”",
    left: {
      eyebrow: "FROM AWARENESS",
      title: "A repayment reminder is often too late.",
      kind: "REMINDER",
      kindText: "Tells customers that payment is due.",
      chain: [
        "Your payment is due soon.",
        "But the money may have already been spent.",
        "Too late to make a meaningful decision.",
      ],
    },
    right: {
      eyebrow: "TO DECISION SUPPORT",
      title: "Give visibility and a clear next action, before it’s too late.",
      kind: "DECISION SUPPORT",
      kindText: "Helps customers understand the risk and what to do next.",
      steps: [
        { title: "See the risk early", text: "You may be short 2,000,000 VND." },
        { title: "Understand what to do", text: "Here is what needs attention first." },
        { title: "Take action", text: "Create a plan or adjust spending before it becomes urgent." },
      ],
    },
    notificationAlt: "Lock-screen repayment reminder: VPBank — Your payment is due soon",
    appAlt: "VPBank app showing a possible shortfall of 2,000,000 VND and what needs attention first",
  },

  decision: {
    intro:
      "Decision support was the narrowest useful starting point: first help users manage an existing repayment shortfall, then move upstream to prevent the next one.",
    eyebrow: "OPTIONS CONSIDERED",
    title: "Several directions were evaluated before deciding where to focus.",
    options: [
      { title: "More reminders", text: "Notify customers about upcoming due dates.", verdict: "Not enough", tone: "red" },
      { title: "Full personal finance management", text: "Help customers manage all income and spending.", verdict: "Too broad", tone: "red" },
      { title: "Default automation", text: "Auto-pay or auto-allocation.", verdict: "Limited fit", tone: "orange" },
      { title: "Decision support", text: "Show risk, prioritize actions and suggest a realistic plan.", verdict: "Best starting point", tone: "green" },
    ],
    phase1: {
      tag: "PHASE 1",
      name: "CONTROL",
      text: "Manage a repayment risk that already exists.",
    },
    phase2: {
      tag: "PHASE 2",
      name: "PREVENT",
      text: "Intervene before repayment money is spent.",
    },
  },

  solution: {
    intro:
      "The solution became two connected experiences: Control existing repayment risk, then Prevent new shortfalls earlier—with Phase 1 as the fallback if prevention fails.",
    phase1: {
      tag: "PHASE 1 — CONTROL",
      name: "Debt Management",
      steps: ["Early risk detection", "Shortfall preview", "Priority suggestion", "Minimal decision flow", "Recovery flow"],
    },
    limitation: {
      label: "What Phase 1 does not solve",
      text: "It helps when risk is visible, but it cannot prevent shortfalls caused by new spending.",
    },
    phase2: {
      tag: "PHASE 2 — PREVENT",
      name: "AI Financial Assistant",
      steps: ["Safe-to-Spend", "Commitments", "Simulation", "Smart action", "Phase 1 handoff"],
    },
    relation: { label: "Connected experience", flow: ["Phase 2", "Shortfall occurs", "Phase 1"] },
    alt: [
      "Early risk detection screen: repayment shortfall alert on the home screen",
      "Shortfall preview screen: total due, balance and loan breakdown",
      "Priority suggestion screen: loans ranked by what to handle first",
      "Minimal decision flow screen: choose how to handle the loan",
      "Recovery flow screen: quick summary and what to handle now",
      "Safe-to-Spend screen: money with purpose summary and AI assistant check",
      "Commitments screen: fixed commitment breakdown",
      "Simulation screen: expected impact of a spending decision",
      "Smart action screen: suggested actions to protect repayment money",
      "Protective guardrail screen: transaction made, with a prompt to review the repayment plan (Phase 1 handoff)",
    ],
  },

  experiment: {
    intro:
      "I built one interactive prototype for each phase to test whether earlier visibility could change repayment or spending decisions.",
    status: "Prototype · not yet user-tested",
    cards: [
      {
        tone: "green",
        tag: "PHASE 1 PROTOTYPE",
        title: "Phase 1 — Debt Management",
        text: "Test whether earlier risk visibility leads to appropriate repayment actions.",
        flow: ["Detect", "Prioritize", "Plan"],
        cta: "Try Phase 1 prototype",
        href: "https://claude.ai/public/artifacts/00fc3440-5c48-4877-bd1e-6472e0d224f3",
      },
      {
        tone: "blue",
        tag: "PHASE 2 PROTOTYPE",
        title: "Phase 2 — AI Risk Prevention",
        text: "Test whether repayment impact changes spending decisions.",
        flow: ["Safe-to-Spend", "Simulation", "Warning", "Decision Change"],
        cta: "Try Phase 2 prototype",
        href: "https://claude.ai/public/artifacts/a4de6acd-5d97-4f5b-a74c-92b244b06d9e",
      },
    ],
  },

  measure: {
    intro:
      "Success should be measured by earlier behavior change and better repayment outcomes—not feature usage alone. All targets remain proposed, not achieved.",
    proposed: "Proposed target",
    phase1: {
      tone: "green",
      title: "Phase 1 — Control (Existing Risk)",
      rows: [
        { kind: "North Star metric", name: "Repayment Plan Success Rate", target: "≥65%" },
        { kind: "Primary metric", name: "Delinquency Roll Rate Reduction", target: "≥10–15%", note: "vs baseline" },
        { kind: "Guardrail metric", name: "Ignore Rate", target: "<20%" },
      ],
    },
    phase2: {
      tone: "blue",
      title: "Phase 2 — Prevent (Before Risk Appears)",
      rows: [
        { kind: "North Star metric", name: "Post-warning Behavior Change Rate", target: "≥10–15%" },
        { kind: "Primary metric", name: "Shortfall Case Reduction", target: "≥15–20%", note: "vs control" },
        { kind: "Guardrail metric", name: "Alert Fatigue Rate", target: "<15%" },
      ],
    },
  },

  reflection: {
    intro:
      "This case reminded me that solving repayment risk is not only about reacting earlier. The stronger opportunity may be helping customers avoid the shortfall before it happens.",
    learned: {
      title: "What the case taught me",
      bullets: [
        "Better visibility helps, but visibility alone does not prevent a shortfall.",
        "A useful first step is to help customers manage existing repayment risk before expanding into prevention.",
        "Prevention still needs a recovery path when risk happens.",
      ],
    },
    next: {
      title: "What I would explore next",
      bullets: [
        "Test whether Safe-to-Spend changes real spending decisions before repayment is due.",
        "Learn which financial commitments users are willing to share and how reliable those inputs are.",
        "Measure whether earlier decisions lead to fewer shortfalls and better repayment outcomes over time.",
      ],
    },
  },
} as const;

/** Source-pixel boxes for the original phone screens (crops only). */
export const IMAGES = {
  hero: heroImage,
  insight: {
    src: `${VPBANK_IMAGE_BASE}/04-insight-01.png`,
    width: 2006,
    height: 784,
  },
} as const;

/**
 * Final high-resolution English phone screenshots (used as-is: no crop,
 * resample or recolor). Dimensions are each file's native pixel size.
 */
const EN_FINAL = `${VPBANK_IMAGE_BASE}/en-final`;

export const PHONE_SHOTS = {
  phase1: [
    { n: "phase1-01", width: 905, height: 1738 },
    { n: "phase1-02", width: 914, height: 1721 },
    { n: "phase1-03", width: 902, height: 1743 },
    { n: "phase1-04", width: 918, height: 1714 },
    { n: "phase1-05", width: 910, height: 1728 },
  ].map(({ n, ...d }) => ({ src: `${EN_FINAL}/${n}.png`, ...d })),
  phase2: [
    { n: "phase2-01", width: 933, height: 1685 },
    { n: "phase2-02", width: 918, height: 1713 },
    { n: "phase2-03", width: 923, height: 1703 },
    { n: "phase2-04", width: 925, height: 1701 },
    { n: "phase2-05", width: 934, height: 1684 },
  ].map(({ n, ...d }) => ({ src: `${EN_FINAL}/${n}.png`, ...d })),
} as const;

/** Uniform display aspect (w/h) for thumbnails; native ratios vary by ±3%. */
export const SHOT_THUMB_ASPECT = 0.538;
