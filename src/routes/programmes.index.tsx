import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Star } from "lucide-react";
import { PageHero, StatusBadge, EmptyState } from "@/components/site/blocks";
import { Button } from "@/components/ui/button";
import { programmesQuery } from "@/lib/public-queries";
import mentorship from "@/assets/mentorship.jpg";

export const Route = createFileRoute("/programmes/")({
  head: () => ({
    meta: [
      { title: "Programmes — Arise Ashaiman Foundation" },
      {
        name: "description",
        content: "Mentorship, youth empowerment, Women and Youth in Communication, civic education and community advocacy programmes.",
      },
      { property: "og:title", content: "Programmes — Arise Ashaiman Foundation" },
      { property: "og:description", content: "Explore our flagship Mentorship & Communication Clinic and planned community programmes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Programmes,
});

function Programmes() {
  const { data, isLoading, error } = useQuery(programmesQuery);
  const flagship = data?.find((p) => p.is_flagship);
  const others = data?.filter((p) => !p.is_flagship) ?? [];

  return (
    <>
      <PageHero
        eyebrow="Programmes"
        title="Programmes that grow people and places"
        intro="Programmes marked PLANNED have not yet launched. We'll update their status here as they begin."
      />
      <section className="container-page py-20">
        {isLoading && <div className="h-80 animate-pulse rounded-3xl bg-muted" />}
        {error && <EmptyState title="Programmes couldn't load">Please refresh the page to try again.</EmptyState>}
        {flagship && (
          <article className="grid overflow-hidden rounded-3xl border bg-card shadow-lift lg:grid-cols-2">
            <img src={mentorship} alt="" loading="lazy" className="h-full min-h-72 w-full object-cover" />
            <div className="p-8 md:p-12">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-foreground">
                  <Star className="h-3.5 w-3.5" /> Flagship
                </span>
                <StatusBadge status={flagship.status} />
                <StatusBadge status={flagship.registration_status} label={`Registration: ${flagship.registration_status === "coming_soon" ? "Coming Soon" : flagship.registration_status}`} />
              </div>
              <h2 className="text-3xl font-extrabold text-primary">{flagship.title}</h2>
              <p className="mt-4 text-lg text-muted-foreground">{flagship.summary}</p>
              <Button asChild size="lg" className="mt-8">
                <Link to="/programmes/mentorship-clinic">
                  View programme <ArrowRight />
                </Link>
              </Button>
            </div>
          </article>
        )}
        {others.length > 0 && (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {others.map((p) => (
              <article key={p.id} className="flex flex-col rounded-2xl border bg-card p-7 shadow-soft">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal">{p.category}</span>
                  <StatusBadge status={p.status} />
                </div>
                <h3 className="text-xl font-bold text-primary">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.summary}</p>
                {p.description && <p className="mt-3 whitespace-pre-line text-sm">{p.description}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
