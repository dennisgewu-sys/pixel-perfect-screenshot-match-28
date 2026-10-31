import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CalendarDays, FolderKanban, MapPin } from "lucide-react";
import { PageHero, StatusBadge, EmptyState } from "@/components/site/blocks";
import { projectsQuery } from "@/lib/public-queries";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects & Community Impact — Arise Ashaiman Foundation" },
      { name: "description", content: "Follow Arise Ashaiman Foundation's community projects — planned, ongoing and completed." },
      { property: "og:title", content: "Projects & Community Impact — Arise Ashaiman" },
      { property: "og:description", content: "A directory of community projects across Ashaiman." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Projects,
});

const FILTERS = [
  { value: "all", label: "All" },
  { value: "planned", label: "Planned" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
];

function Projects() {
  const { data, isLoading, error } = useQuery(projectsQuery);
  const [filter, setFilter] = useState("all");
  const list = useMemo(() => (data ?? []).filter((p) => filter === "all" || p.status === filter), [data, filter]);

  return (
    <>
      <PageHero
        eyebrow="Projects & community impact"
        title="Work in the community, tracked openly"
        intro="Every project listed here is entered by our team and updated as it progresses."
      />
      <section className="container-page py-16">
        <div role="tablist" aria-label="Filter by status" className="mb-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              role="tab"
              aria-selected={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition",
                filter === f.value ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : error ? (
          <EmptyState title="Projects couldn't load">Please refresh the page to try again.</EmptyState>
        ) : list.length === 0 ? (
          <EmptyState icon={FolderKanban} title={data?.length ? "No projects with this status" : "Projects coming soon"}>
            {data?.length
              ? "Try another filter."
              : "Our community projects will be listed here as they are planned and launched. Check back soon."}
          </EmptyState>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <article key={p.id} className="overflow-hidden rounded-2xl border bg-card shadow-soft">
                {p.image_url ? (
                  <img src={p.image_url} alt="" loading="lazy" className="aspect-video w-full object-cover" />
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-teal-gradient">
                    <FolderKanban className="h-10 w-10 text-teal-foreground/70" />
                  </div>
                )}
                <div className="p-6">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal">{p.category ?? "Project"}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <h2 className="text-lg font-bold text-primary">{p.title}</h2>
                  {p.description && <p className="mt-2 line-clamp-4 text-sm text-muted-foreground">{p.description}</p>}
                  <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                    {p.location && (
                      <p className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" /> {p.location}
                      </p>
                    )}
                    <p className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" /> {formatDate(p.start_date)}
                      {p.completion_date && ` – ${formatDate(p.completion_date)}`}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
