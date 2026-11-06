import { createFileRoute } from "@tanstack/react-router";
import { DetailList, ResourceManager, type ResourceConfig } from "@/components/admin/ResourceManager";
import { RequireModule } from "@/components/admin/ui";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/enquiries")({ component: Page });

const STATUSES = ["new", "in_progress", "resolved", "archived"] as const;
const TYPES = ["general", "partnership", "media", "other"] as const;

const config: ResourceConfig = {
  table: "contact_enquiries",
  title: "Contact enquiries",
  singular: "Enquiry",
  description: "Messages and partnership requests sent through the website.",
  columns: [
    { key: "full_name", label: "From", render: (r) => <span className="font-semibold text-primary">{r["full_name"]}</span> },
    { key: "subject", label: "Subject", className: "max-w-xs" },
    { key: "enquiry_type", label: "Type", className: "hidden md:table-cell" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Received", render: (r) => formatDate(r.created_at), className: "hidden lg:table-cell" },
  ],
  fields: [
    { name: "status", label: "Status", type: "select", options: STATUSES, required: true },
    { name: "enquiry_type", label: "Type", type: "select", options: TYPES, required: true },
    { name: "admin_notes", label: "Internal notes (staff only)", type: "textarea", rows: 4 },
  ],
  searchKeys: ["full_name", "email", "subject", "message", "organisation"],
  statusField: "status",
  statusOptions: STATUSES,
  filters: [{ key: "enquiry_type", label: "Types", options: TYPES }],
  archive: { type: "status", value: "archived", restoreTo: "new" },
  detail: (r) => (
    <DetailList
      items={[
        ["Name", r["full_name"]],
        ["Organisation", r["organisation"]],
        ["Email", r["email"] ? <a className="text-teal underline" href={`mailto:${r["email"]}`}>{r["email"]}</a> : null],
        ["Phone", r["phone"]],
        ["Subject", r["subject"]],
        ["Message", r["message"]],
      ]}
    />
  ),
  quickStatuses: [
    { value: "in_progress", label: "In progress" },
    { value: "resolved", label: "Resolved" },
  ],
  canDelete: true,
  exportName: "contact-enquiries",
};

function Page() {
  return (
    <RequireModule module="enquiries">
      <ResourceManager config={config} />
    </RequireModule>
  );
}
