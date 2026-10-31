import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Newspaper } from "lucide-react";
import { EmptyState } from "@/components/site/blocks";
import { Button } from "@/components/ui/button";
import { newsPostQuery } from "@/lib/public-queries";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/news/$slug")({
  head: () => ({
    meta: [
      { title: "News article — Arise Ashaiman Foundation" },
      { name: "description", content: "An update from Arise Ashaiman Foundation." },
      { property: "og:title", content: "News — Arise Ashaiman Foundation" },
      { property: "og:description", content: "An update from Arise Ashaiman Foundation." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Article,
});

function Article() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery(newsPostQuery(slug));

  if (isLoading)
    return (
      <div className="container-page max-w-3xl py-20">
        <div className="h-10 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );

  if (!data)
    return (
      <div className="container-page max-w-3xl py-20">
        <EmptyState icon={Newspaper} title="Article not found">
          This article may have been removed or is not yet published.
        </EmptyState>
        <div className="mt-6 text-center">
          <Button asChild variant="outline">
            <Link to="/news">Back to news</Link>
          </Button>
        </div>
      </div>
    );

  return (
    <article className="container-page max-w-3xl py-16">
      <Link to="/news" className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline">
        <ArrowLeft className="h-4 w-4" /> All news
      </Link>
      <p className="eyebrow">{data.category}</p>
      <h1 className="mt-2 text-4xl font-extrabold leading-tight text-primary md:text-5xl">{data.title}</h1>
      <p className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <CalendarDays className="h-4 w-4" /> {formatDate(data.published_at)}
        {data.author_name && ` · By ${data.author_name}`}
      </p>
      {data.featured_image_url && (
        <img src={data.featured_image_url} alt="" className="mt-8 aspect-video w-full rounded-2xl object-cover shadow-lift" />
      )}
      {data.excerpt && <p className="mt-8 text-xl leading-relaxed text-foreground/80">{data.excerpt}</p>}
      <div className="mt-6 space-y-5 text-lg leading-relaxed text-foreground/90">
        {data.content.split(/\n{2,}/).map((para, i) => (
          <p key={i} className="whitespace-pre-line">
            {para}
          </p>
        ))}
      </div>
    </article>
  );
}
