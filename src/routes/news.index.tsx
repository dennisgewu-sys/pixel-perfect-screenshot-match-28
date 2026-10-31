import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Newspaper } from "lucide-react";
import { PageHero, EmptyState } from "@/components/site/blocks";
import { newsListQuery } from "@/lib/public-queries";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/news/")({
  head: () => ({
    meta: [
      { title: "News & Updates — Arise Ashaiman Foundation" },
      { name: "description", content: "Official news, announcements and community development updates from Arise Ashaiman Foundation." },
      { property: "og:title", content: "News & Updates — Arise Ashaiman" },
      { property: "og:description", content: "Announcements and community development updates from Ashaiman." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: News,
});

function News() {
  const { data, isLoading, error } = useQuery(newsListQuery());
  return (
    <>
      <PageHero eyebrow="News & updates" title="From the Foundation" intro="Official announcements and community development updates." />
      <section className="container-page py-16">
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : error ? (
          <EmptyState title="News couldn't load">Please refresh the page to try again.</EmptyState>
        ) : !data?.length ? (
          <EmptyState icon={Newspaper} title="No articles published yet">
            Official news and announcements will appear here once published by our communications team.
          </EmptyState>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.map((n) => (
              <Link
                key={n.id}
                to="/news/$slug"
                params={{ slug: n.slug }}
                className="group overflow-hidden rounded-2xl border bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
              >
                {n.featured_image_url ? (
                  <img src={n.featured_image_url} alt="" loading="lazy" className="aspect-video w-full object-cover" />
                ) : (
                  <div className="aspect-video bg-teal-gradient" />
                )}
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-teal">{n.category}</p>
                  <h2 className="mt-2 text-lg font-bold leading-snug text-primary group-hover:underline">{n.title}</h2>
                  {n.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{n.excerpt}</p>}
                  <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" /> {formatDate(n.published_at)}
                    {n.author_name && ` · ${n.author_name}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
