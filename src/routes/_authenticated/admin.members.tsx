import { createFileRoute } from "@tanstack/react-router";
import { DetailList, ResourceManager, type ResourceConfig } from "@/components/admin/ResourceManager";
import { RequireModule } from "@/components/admin/ui";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/members")({ component: Page });

const STATUSES = ["pending_review", "approved", "rejected", "info_requested", "archived"] as const;

const config: ResourceConfig = {
  table: "members",
  title: "Members",
  singular: "Member",
  description: "Membership applications from the website. New applications arrive as Pending Review.",
  columns: [
    { key: "full_name", label: "Name", render: (r) => <span className="font-semibold text-primary">{r["full_name"]}</span> },
    { key: "community", label: "Community" },
    { key: "phone", label: "Phone", className: "hidden md:table-cell" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Applied", render: (r) => formatDate(r.created_at), className: "hidden lg:table-cell" },
  ],
  fields: [
    { name: "full_name", label: "Full name", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "tel", required: true },
    { name: "community", label: "Community / area", required: true },
    { name: "occupation", label: "Occupation" },
    { name: "status", label: "Status", type: "select", options: STATUSES, required: true },
    { name: "interests", label: "Interests", type: "textarea", rows: 2 },
    { name: "motivation", label: "Why they want to join", type: "textarea", rows: 3 },
    { name: "admin_notes", label: "Internal notes (staff only)", type: "textarea", rows: 3 },
  ],
  searchKeys: ["full_name", "email", "phone", "community", "occupation"],
  statusField: "status",
  statusOptions: STATUSES,
  archive: { type: "status", value: "archived", restoreTo: "pending_review" },
  canCreate: true,
  defaults: { status: "pending_review", consent: true },
  quickStatuses: [
    { value: "approved", label: "Approve" },
    { value: "rejected", label: "Reject" },
    { value: "info_requested", label: "Request more info" },
  ],
  detail: (r) => <DetailList items={[["Consent given", r["consent"] ? "Yes" : "No"], ["Applied", formatDate(r.created_at, true)]]} />,
  exportName: "members",
};

function Page() {
  return (
    <RequireModule module="members">
      <ResourceManager config={config} />
    </RequireModule>
  );
}
