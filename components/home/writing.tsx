import { siteConfig } from "@/lib/site-config";

export function Writing() {
  return (
    <section id="writing" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h2 className="text-2xl font-semibold">{siteConfig.writing.heading}</h2>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {siteConfig.writing.articles.map((article) =>
          article.href ? (
            <a
              key={article.title}
              href={article.href}
              className="rounded-lg border border-border p-4 hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <p className="font-medium">{article.title}</p>
            </a>
          ) : (
            <div
              key={article.title}
              className="rounded-lg border border-border p-4"
            >
              <p className="font-medium text-muted-foreground">
                {article.title}
              </p>
            </div>
          ),
        )}
      </div>
    </section>
  );
}
