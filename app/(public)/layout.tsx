import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";

// Scoped to this route group only — /admin/** and /media/[image_id] render
// under the root layout directly and are unaffected. /work/[case_id] will
// be added inside this same group in Milestone 7, reusing this chrome.
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div id="top" className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
