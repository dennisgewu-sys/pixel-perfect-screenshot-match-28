import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { ResourceManager, type ResourceConfig } from "@/components/admin/ResourceManager";
import { RequireModule } from "@/components/admin/ui";
import { StatusBadge } from "@/components/site/blocks";
import { slugify } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/programmes")({ component: Page });

const STATUSES = ["planned", "active", "paused", "completed"] as const;
const REG = ["open", "closed", "coming_soon"] as const;

const config: ResourceConfig = {
  table: "programmes",
  title: "Programmes",
  singular: "Programme",
  description: "Programmes shown on the public Programmes page. Archived programmes are hidden from the website.",
  orderBy: { column: "sort_order", ascending: true },
  columns: [
    {
      key: "title",
      label: "Programme",
      render: (r) => (
        <span className="flex items-center gap-1.5 font-semibold text-primary">
          {r["is_flagship"] && <Star className="h-3.5 w-3.5 fill-gold text-gold" aria-label="Flagship" />}
          {r["title"]}
        </span>
      ),
    },
    { key: "category", label: "Category", className: "hidden md:table-cell" },
    { key: "status", label: "Status" },
    { key: "registration_status", label: "Registration", render: (r) => <StatusBadge status={r["registration_status"]} /> },
    { key: "sort_order", label: "Order", className: "hidden lg:table-cell" },
  ],
  fields: [
    { name: "title", label: "Title", required: true, full: true },
    { name: "slug", label: "Web address (slug)", hint: "Leave blank to create from the title.", placeholder: "e.g. digital-skills" },
    { name: "category", label: "Category" },
    { name: "status", label: "Status", type: "select", options: STATUSES, required: true },
    { name: "registration_status", label: "Registration", type: "select", options: REG, required: true },
    { name: "sort_order", label: "Display order", type: "number" },
    { name: "is_flagship", label: "Flagship programme", type: "checkbox" },
    { name: "summary", label: "Short summary", type: "textarea", rows: 2, hint: "Up to 500 characters." },
    { name: "description", label: "Full description", type: "textarea", rows: 5 },
  ],
  searchKeys: ["title", "category", "summary"],
  statusField: "status",
  statusOptions: STATUSES,
  archive: { type: "flag" },
  canCreate: true,
  defaults: { status: "planned", registration_status: "coming_soon", sort_order: 100, is_flagship: false },
  beforeSave: (v) => ({ ...v, slug: slugify(String(v["slug"] || v["title"] || "")), sort_order: v["sort_order"] ?? 100 }),
  exportName: "programmes",
};

function Page() {
  return (
    <RequireModule module="programmes">
      <ResourceManager config={config} />
    </RequireModule>
  );
}
