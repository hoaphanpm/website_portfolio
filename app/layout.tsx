import type { Metadata } from "next";
import "./globals.css";

// Milestone 2 scope: admin auth only. No public marketing content, no
// custom web fonts (kept to the system font stack to avoid a build-time
// Google Fonts fetch for what is, for now, an admin-only utility area).
export const metadata: Metadata = {
  title: "Portfolio Admin",
  description: "Admin area for the portfolio site.",
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
