import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager, type ResourceConfig } from "@/components/admin/ResourceManager";
import { RequireModule } from "@/components/admin/ui";
import { badgeName } from "@/lib/referrals";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/rewards")({ component: Page });

const STATUSES = ["pending", "approved", "paid", "declined"] as const;

const config: ResourceConfig = {
  table: "volunteer_rewards",
  title: "Referral rewards",
  singular: "Reward",
  description:
    "A GHS 100 reward is created automatically each time a volunteer's invite link brings in another 4 sign-ups. Check the sign-ups, then mark the reward paid.",
  select: "*, volunteer:volunteer_applications(full_name, phone, referral_count)",
  columns: [
    { key: "volunteer_name", label: "Volunteer", render: (r) => <span className="font-semibold text-primary">{r["volunteer"]?.full_name}</span> },
    { key: "level", label: "Badge", render: (r) => badgeName(r["level"]) },
    { key: "amount", label: "Amount", render: (r) => `GHS ${Number(r["amount"]).toFixed(2)}` },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Earned", render: (r) => formatDate(r.created_at), className: "hidden lg:table-cell" },
  ],
  detail: (r) => (
    <p className="text-sm">
      <strong>{r["volunteer"]?.full_name}</strong> · {r["volunteer"]?.phone} · {r["volunteer"]?.referral_count} total sign-ups
    </p>
  ),
  fields: [
    { name: "status", label: "Status", type: "select", options: STATUSES, required: true },
    { name: "paid_on", label: "Paid on", type: "date" },
    { name: "payment_method", label: "Payment method", placeholder: "e.g. Cash, Mobile money" },
    { name: "reference", label: "Reference / receipt no." },
    { name: "notes", label: "Notes", type: "textarea", rows: 3 },
  ],
  searchKeys: ["status", "reference", "payment_method"],
  statusField: "status",
  statusOptions: STATUSES,
  archive: { type: "flag" },
  canCreate: false,
  quickStatuses: [
    { value: "approved", label: "Approve" },
    { value: "paid", label: "Mark paid" },
    { value: "declined", label: "Decline" },
  ],
  beforeSave: (v) => {
    const { volunteer: _v, ...rest } = v as Record<string, unknown>;
    return rest;
  },
  exportName: "referral-rewards",
};

function Page() {
  return (
    <RequireModule module="rewards">
      <ResourceManager config={config} />
    </RequireModule>
  );
}
