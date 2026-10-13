import type { SVGProps } from "react";

/**
 * Small local inline icon set for the Hero/Footer social links (Milestone
 * 11 Phase B follow-up). lucide-react is installed but has no LinkedIn or
 * Substack brand icon and isn't used anywhere else in the app yet — using
 * local SVGs for all three keeps one consistent visual style instead of
 * mixing an installed library with ad-hoc marks for the other two.
 *
 * Purely decorative (aria-hidden): the accessible name for each link comes
 * from its own visible text label or aria-label, never from the icon.
 */

export function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="7.5" cy="7" r="0.75" fill="currentColor" stroke="none" />
      <line x1="7.5" y1="10.5" x2="7.5" y2="17" />
      <path d="M11 17v-4.2a2.2 2.2 0 0 1 4.4 0V17" />
      <line x1="11" y1="10.5" x2="11" y2="17" />
    </svg>
  );
}

export function SubstackIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <rect x="4" y="4" width="16" height="2.4" />
      <rect x="4" y="8.4" width="16" height="2.4" />
      <path d="M4 12.8h16l-8 7z" />
    </svg>
  );
}

export function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}
