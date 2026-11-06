import { createFileRoute } from "@tanstack/react-router";
import { DetailList, ResourceManager, type ResourceConfig } from "@/components/admin/ResourceManager";
import { RequireModule } from "@/components/admin/ui";
import { FEEDBACK_CATEGORIES } from "@/lib/content";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/feedback")({ component: Page });

const STATUSES = ["new", "under_review", "referred", "resolved", "closed"] as const;
const CATS = FEEDBACK_CATEGORIES.map((c) => ({ value: c.value, label: c.label }));
const catLabel = (v: string) => CATS.find((c) => c.value === v)?.label ?? v;

const config: ResourceConfig = {
  table: "community_feedback",
  title: "Community feedback",
  singular: "Feedback",
  description: "Concerns raised by residents. Private to administrators. Internal notes are never shown publicly.",
  columns: [
    { key: "category", label: "Category", render: (r) => <span className="font-semibold text-primary">{catLabel(r["category"])}</span> },
    { key: "community", label: "Community" },
    {
      key: "description",
      label: "Summary",
      className: "hidden md:table-cell max-w-sm",
      render: (r) => <span className="line-clamp-2 text-muted-foreground">{r["description"]}</span>,
    },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Received", render: (r) => formatDate(r.created_at), className: "hidden lg:table-cell" },
  ],
  fields: [
    { name: "status", label: "Status", type: "select", options: STATUSES, required: true },
    { name: "category", label: "Category", type: "select", options: CATS, required: true },
    { name: "internal_notes", label: "Internal notes (staff only)", type: "textarea", rows: 4 },
  ],
  searchKeys: ["community", "description", "submitter_name", "category"],
  statusField: "status",
  statusOptions: STATUSES,
  filters: [{ key: "category", label: "Categories", options: CATS }],
  detail: (r) => (
    <DetailList
      items={[
        ["Community", r["community"]],
        ["Submitted by", r["submitter_name"] || "Anonymous"],
        ["Contact", r["submitter_contact"]],
        ["Received", formatDate(r.created_at, true)],
        ["What they reported", r["description"]],
      ]}
    />
  ),
  quickStatuses: [
    { value: "under_review", label: "Under review" },
    { value: "referred", label: "Referred" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ],
  canDelete: true,
  exportName: "community-feedback",
};

function Page() {
  return (
    <RequireModule module="feedback">
      <ResourceManager config={config} />
    </RequireModule>
  );
}
