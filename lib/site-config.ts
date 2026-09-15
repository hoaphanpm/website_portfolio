/**
 * Centralized static site configuration.
 *
 * docs/product-requirements.md, HOMEPAGE SCOPE: "Hero, How I Think,
 * About/Journey, Writing and Contact are outside the case-study CMS scope
 * and may use centralized static site configuration." This is that one
 * source of truth — no homepage component hardcodes copy of its own.
 *
 * EVERY value below is a placeholder, not real content (Milestone 6
 * decision #9). Anything wrapped in [brackets] must be replaced before
 * launch. Fields left as an empty string ("") are intentionally blank —
 * the components that use them (Download CV, Email me, LinkedIn) hide
 * themselves entirely until a real value is set here; nothing renders a
 * broken/dead link because a placeholder was forgotten.
 */

export const siteConfig = {
  // REPLACE ME — shown in the navbar, hero eyebrow, and footer.
  name: "[Your Name]",

  nav: {
    // Anchor links only — no separate pages exist for these sections yet.
    links: [
      { label: "Writing", href: "#writing" },
      { label: "About", href: "#journey" },
    ],
  },

  hero: {
    // REPLACE ME
    eyebrow: "Hi, I'm [Your Name]",
    // REPLACE ME — your one-line positioning statement.
    headline: "[Add your one-line positioning statement here]",
    // REPLACE ME — one supporting sentence about how you work.
    subtext: "[Add a short supporting sentence about how you work]",
  },

  // REPLACE ME — set to a real path (e.g. "/cv.pdf") or external URL once
  // you have a CV to link. Left empty on purpose: the Download CV button
  // does not render at all while this is "" (Milestone 6 decision #5).
  cvUrl: "",

  howIThink: {
    heading: "How I Think About Product",
    items: [
      {
        // REPLACE ME
        title: "[Principle 1 title]",
        // REPLACE ME
        description: "[One or two sentences about this principle]",
      },
      {
        // REPLACE ME
        title: "[Principle 2 title]",
        // REPLACE ME
        description: "[One or two sentences about this principle]",
      },
      {
        // REPLACE ME
        title: "[Principle 3 title]",
        // REPLACE ME
        description: "[One or two sentences about this principle]",
      },
    ],
  },

  journey: {
    heading: "My Journey",
    milestones: [
      {
        // REPLACE ME — e.g. "2018 – 2024"
        period: "[Start year] – [End year]",
        // REPLACE ME — e.g. "Quality Engineering"
        title: "[Milestone 1 title]",
        // REPLACE ME
        description: "[One or two sentences about this period]",
      },
      {
        // REPLACE ME — e.g. "2025 – Now"
        period: "[Start year] – Now",
        // REPLACE ME — e.g. "Product"
        title: "[Milestone 2 title]",
        // REPLACE ME
        description: "[One or two sentences about this period]",
      },
    ],
  },

  writing: {
    heading: "Thinking Out Loud",
    // REPLACE ME — real article title + URL (e.g. a Substack post). An
    // entry with href "" renders as plain, non-linked placeholder text
    // rather than a dead link.
    articles: [
      { title: "[Article 1 title / topic]", href: "" },
      { title: "[Article 2 title / topic]", href: "" },
      { title: "[Article 3 title / topic]", href: "" },
    ],
  },

  contact: {
    heading: "Let's Build Something Useful.",
    // REPLACE ME
    subtext: "[Add a short line about what you're currently exploring]",
    // REPLACE ME — used for the "Email me" link (mailto:). Left empty on
    // purpose: that button does not render while this is "".
    email: "",
    // REPLACE ME — used for the "LinkedIn" link. Left empty on purpose:
    // that link does not render while this is "".
    linkedinUrl: "",
  },

  footer: {
    // REPLACE ME
    tagline: "[Your title, e.g. Product Manager]",
  },
} as const;
