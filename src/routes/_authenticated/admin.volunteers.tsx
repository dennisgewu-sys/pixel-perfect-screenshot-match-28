import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager, type ResourceConfig } from "@/components/admin/ResourceManager";
import { RequireModule } from "@/components/admin/ui";
import { VOLUNTEER_AREAS } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { badgeName } from "@/lib/referrals";

export const Route = createFileRoute("/_authenticated/admin/volunteers")({ component: Page });

const STATUSES = ["new", "under_review", "accepted", "declined", "archived"] as const;
const AREAS = VOLUNTEER_AREAS.map((a) => ({ value: a, label: a }));

const config: ResourceConfig = {
  table: "volunteer_applications",
  title: "Volunteers",
  singular: "Volunteer",
  description: "Volunteer applications with areas of interest, experience and availability.",
  columns: [
    { key: "full_name", label: "Name", render: (r) => <span className="font-semibold text-primary">{r["full_name"]}</span> },
    { key: "community", label: "Community" },
    {
      key: "areas_of_interest",
      label: "Areas",
      className: "hidden md:table-cell",
      render: (r) => <span className="text-xs text-muted-foreground">{(r["areas_of_interest"] ?? []).join(", ") || "—"}</span>,
    },
    {
      key: "referral_count",
      label: "Invites",
      render: (r) => (
        <span className="text-xs">
          {r["referral_count"] ?? 0} · {badgeName(r["badge_level"] ?? 0)}
        </span>
      ),
    },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Applied", render: (r) => formatDate(r.created_at), className: "hidden lg:table-cell" },
  ],
  fields: [
    { name: "full_name", label: "Full name", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "tel", required: true },
    { name: "community", label: "Community / location", required: true },
    { name: "availability", label: "Availability", required: true },
    { name: "status", label: "Status", type: "select", options: STATUSES, required: true },
    { name: "areas_of_interest", label: "Areas of interest", type: "multiselect", options: AREAS },
    { name: "experience", label: "Relevant experience", type: "textarea", rows: 3 },
    { name: "admin_notes", label: "Internal notes (staff only)", type: "textarea", rows: 3 },
  ],
  detail: (r) =>
    r["referral_code"] ? (
      <p className="text-sm">
        Invite code <strong className="font-mono">{r["referral_code"]}</strong> · {r["referral_count"] ?? 0} sign-ups ·{" "}
        {badgeName(r["badge_level"] ?? 0)}
      </p>
    ) : null,
  searchKeys: ["referral_code", "full_name", "email", "phone", "community", "availability"],
  statusField: "status",
  statusOptions: STATUSES,
  archive: { type: "status", value: "archived", restoreTo: "new" },
  canCreate: true,
  defaults: { status: "new", consent: true },
  quickStatuses: [
    { value: "under_review", label: "Under review" },
    { value: "accepted", label: "Accept" },
    { value: "declined", label: "Decline" },
  ],
  exportName: "volunteers",
};

function Page() {
  return (
    <RequireModule module="volunteers">
      <ResourceManager config={config} />
    </RequireModule>
  );
}
