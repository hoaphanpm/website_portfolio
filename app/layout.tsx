import type { Metadata } from "next";
import "./globals.css";

// Site-wide default metadata (Milestone 6) — every actual page overrides
// this with its own <title>/description (app/(public)/page.tsx,
// app/admin/login/page.tsx's browser tab context, etc.); this is only the
// fallback if one ever doesn't. No custom web fonts — kept to the system
// font stack to avoid a build-time Google Fonts fetch.
export const metadata: Metadata = {
  title: "Portfolio",
  description: "Product Manager portfolio and case studies.",
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
