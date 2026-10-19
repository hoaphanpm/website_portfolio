import type { Metadata } from "next";
import "./globals.css";

import {
  HOME_DESCRIPTION,
  HOME_SOCIAL_DESCRIPTION,
  HOME_TITLE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

// Site-wide default metadata (Milestone 6) — every actual page overrides
// this with its own <title>/description (app/(public)/page.tsx,
// app/admin/login/page.tsx's browser tab context, etc.); this is only the
// fallback if one ever doesn't. No custom web fonts — kept to the system
// font stack to avoid a build-time Google Fonts fetch.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  openGraph: {
    title: HOME_TITLE,
    description: HOME_SOCIAL_DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: HOME_TITLE,
    description: HOME_SOCIAL_DESCRIPTION,
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
