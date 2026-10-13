import type { Metadata } from "next";
import "./globals.css";

// Site-wide metadata (Milestone 6, real content in Milestone 11 Phase B).
// The public case-study route still overrides title/description per case
// via its own generateMetadata (app/(public)/work/[case_id]/page.tsx); the
// homepage now inherits this directly rather than redeclaring it. The
// Open Graph/Twitter image itself comes from the file-based convention in
// app/(public)/opengraph-image.tsx and twitter-image.tsx, which Next.js
// wires up automatically — no `images` field is set here. No custom web
// fonts — kept to the system font stack to avoid a build-time Google
// Fonts fetch.
const title = "Hoa Phan | Product Manager";
const description =
  "Product Manager with a quality engineering background, exploring fintech, lending, product strategy, and customer-centered growth through case studies and writing.";
// Distinct, slightly shorter copy for social cards, as specified.
const socialDescription =
  "Product case studies and writing on fintech, lending, customer behavior, and turning complex business problems into clear product decisions.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description: socialDescription,
    siteName: "Hoa Phan Portfolio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: socialDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
