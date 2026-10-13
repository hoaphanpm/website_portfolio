/**
 * Centralized static site configuration.
 *
 * docs/product-requirements.md, HOMEPAGE SCOPE: "Hero, How I Think,
 * About/Journey, Writing and Contact are outside the case-study CMS scope
 * and may use centralized static site configuration." This is that one
 * source of truth — no homepage component hardcodes copy of its own.
 *
 * Milestone 11 Phase B: real launch content. Fields left as an empty
 * string ("") remain intentionally blank per the approved privacy
 * decisions — the components that use them hide themselves entirely
 * while empty; nothing renders a broken/dead link or a bracketed
 * placeholder.
 */

import cashFlowLendingImage from "@/public/images/writing/cash-flow-lending.png";
import techcombankMisaImage from "@/public/images/writing/techcombank-misa.png";

export const siteConfig = {
  name: "Hoa Phan",
  title: "Product Manager",

  nav: {
    // Anchor links only — no separate pages exist for these sections yet.
    links: [
      { label: "Writing", href: "#writing" },
      { label: "About", href: "#journey" },
    ],
  },

  hero: {
    headline:
      "I build products that solve real human problems—and create value that lasts.",
    subtext:
      "With a background in quality engineering, I combine systems thinking, user understanding, and product judgment to simplify complex journeys, remove friction, and connect customer value with business growth.",
  },

  // Milestone 11 decision: keep empty. No CV is published — the Download
  // CV button does not render at all while this is "".
  cvUrl: "",

  // Milestone 11 Phase B follow-up: the single source of truth for these
  // three external destinations. Hero, Footer, and the Recent Writing CTA
  // all read from here instead of each hardcoding (or separately
  // duplicating) the same URLs.
  social: {
    linkedinUrl: "https://www.linkedin.com/in/hoa-kim-phan-49372218a/",
    substackUrl: "https://hoaphanpm.substack.com/",
    email: "hoaphanpm@gmail.com",
  },

  howIThink: {
    heading: "How I Think About Product",
    items: [
      {
        title: "Start with the business problem.",
        description:
          "Products drive business growth only when they solve real user problems. I connect business goals to genuine human needs before deciding what to build.",
      },
      {
        title: "Monetization is a value exchange.",
        description:
          "Sustainable revenue comes from delivering value people are willing to pay for. Real growth happens when user satisfaction strengthens the business model.",
      },
      {
        title: "AI makes judgment more important.",
        description:
          "AI speeds up execution, but human judgment determines what is worth building. As creation gets easier, PMs must focus on trade-offs, trust, and real human impact.",
      },
    ],
  },

  journey: {
    heading: "My Journey",
    milestones: [
      {
        period: "2018–2025",
        title: "Learning How Products Work—and Where They Break",
        description:
          "For more than six years, I validated product quality, identified risks, and helped ensure product reliability. This experience shaped my foundation in systems thinking, disciplined execution, and user-centered quality.",
      },
      {
        period: "2026–Present",
        title: "Product Management — Turning Problems into Product Decisions",
        description:
          "I’m building on my Quality Control foundation through structured Product Management practice. Through PSPO II and independent product case studies, I work from problem framing and user insight to prioritization, product strategy, experimentation, and metrics.",
      },
    ],
  },

  // Milestone 11: "Recent Writing". Exactly 2 manually curated articles —
  // never fetched from Substack at runtime, never selected automatically.
  writing: {
    eyebrow: "PERSPECTIVES",
    heading: "Recent Writing",
    articles: [
      {
        category: "CASH-FLOW LENDING",
        title:
          "Muốn cho vay bằng “Dữ liệu Dòng tiền”? Trước hết phải nhìn thấy được Toàn cảnh Bức tranh đã!",
        excerpt:
          "Dữ liệu thanh toán chưa chắc phản ánh đầy đủ hoạt động của merchant. Trước khi xây credit-scoring model, ngân hàng cần kiểm chứng liệu mình đã nhìn thấy đủ dòng tiền để đưa ra quyết định tín dụng tốt hơn hay chưa.",
        href: "https://hoaphanpm.substack.com/p/muon-cho-vay-bang-du-lieu-dong-tien",
        image: {
          src: cashFlowLendingImage,
          alt: "Diagram showing a merchant's fragmented cash flow sources — QR, e-wallet, and cash — feeding a bank dashboard that only sees 30–40% of the full picture.",
        },
      },
      {
        category: "MERCHANT LENDING",
        title:
          "Techcombank × MISA: Làm thế nào để cạnh tranh trong mảng Merchant Lending?",
        excerpt:
          "Partnership giúp ngân hàng tiếp cận dữ liệu nhanh hơn, nhưng lợi thế dài hạn đến từ khả năng học qua kết quả cho vay thực tế—và kết hợp Digital Data với Field Intelligence để hiểu merchant sâu hơn.",
        href: "https://hoaphanpm.substack.com/p/techcombank-x-misa-lam-the-nao-e",
        image: {
          src: techcombankMisaImage,
          alt: "T-Shop mobile app mockup beside a merchant using her phone, illustrating Techcombank and MISA's merchant lending partnership.",
        },
      },
    ],
    // Destination for the section CTA now lives in `social.substackUrl`
    // above — reused, not duplicated.
    ctaLabel: "View all writing ↗",
  },

  contact: {
    heading: "Let's Build Something Useful.",
    // No replacement copy was supplied for this field in Milestone 11
    // Phase B — left empty rather than inventing marketing copy or
    // showing a bracketed placeholder. The section renders without this
    // line while it's "".
    subtext: "",
    // Email/LinkedIn destinations now live in `social` above — reused,
    // not duplicated.
  },

  footer: {
    tagline: "Turning complex problems into clear product decisions.",
  },
} as const;
