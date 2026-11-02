import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager, type ResourceConfig } from "@/components/admin/ResourceManager";
import { RequireModule } from "@/components/admin/ui";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/projects")({ component: Page });

const STATUSES = ["planned", "ongoing", "completed", "on_hold"] as const;

const config: ResourceConfig = {
  table: "projects",
  title: "Projects",
  singular: "Project",
  description: "Community projects shown on the public Projects & Impact page.",
  columns: [
    { key: "title", label: "Project", render: (r) => <span className="font-semibold text-primary">{r["title"]}</span> },
    { key: "location", label: "Location", className: "hidden md:table-cell" },
    { key: "category", label: "Category", className: "hidden lg:table-cell" },
    { key: "status", label: "Status" },
    { key: "start_date", label: "Start", render: (r) => formatDate(r["start_date"]), className: "hidden md:table-cell" },
  ],
  fields: [
    { name: "title", label: "Title", required: true, full: true },
    { name: "location", label: "Location" },
    { name: "category", label: "Category" },
    { name: "status", label: "Status", type: "select", options: STATUSES, required: true },
    { name: "image_url", label: "Image link", type: "url", hint: "Optional. A public https:// image address." },
    { name: "start_date", label: "Start date", type: "date" },
    { name: "completion_date", label: "Completion date", type: "date" },
    { name: "description", label: "Description", type: "textarea", rows: 5 },
  ],
  searchKeys: ["title", "location", "category", "description"],
  statusField: "status",
  statusOptions: STATUSES,
  archive: { type: "flag" },
  canCreate: true,
  defaults: { status: "planned" },
  exportName: "projects",
};

function Page() {
  return (
    <RequireModule module="projects">
      <ResourceManager config={config} />
    </RequireModule>
  );
}
