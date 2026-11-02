import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager, type ResourceConfig } from "@/components/admin/ResourceManager";
import { RequireModule } from "@/components/admin/ui";
import { formatDate, formatGHS, humanize } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/donations")({ component: Page });

const METHODS = ["cash", "mobile_money", "bank_transfer", "cheque", "in_kind", "other"] as const;

const config: ResourceConfig = {
  table: "donations",
  title: "Donations",
  singular: "Donation",
  description:
    "Record donations received, in Ghana cedis. This is a record book only — no payments are taken online and no PINs or bank passwords are ever collected.",
  orderBy: { column: "donation_date", ascending: false },
  columns: [
    { key: "donation_date", label: "Date", render: (r) => formatDate(r["donation_date"]) },
    {
      key: "donor_name",
      label: "Donor",
      render: (r) => <span className="font-semibold text-primary">{r["is_anonymous"] ? "Anonymous" : r["donor_name"] || "—"}</span>,
    },
    { key: "amount", label: "Amount", render: (r) => <span className="font-semibold tabular-nums">{formatGHS(r["amount"])}</span> },
    { key: "payment_method", label: "Method", render: (r) => humanize(r["payment_method"]), className: "hidden md:table-cell" },
    { key: "purpose", label: "Purpose", className: "hidden lg:table-cell" },
  ],
  fields: [
    { name: "donor_name", label: "Donor name", hint: "Leave blank or tick Anonymous for anonymous donors." },
    { name: "is_anonymous", label: "Anonymous donor", type: "checkbox" },
    { name: "amount", label: "Amount (GHS)", type: "number", required: true },
    { name: "donation_date", label: "Date received", type: "date", required: true },
    { name: "payment_method", label: "Payment method", type: "select", options: METHODS, required: true },
    { name: "reference", label: "Reference / receipt no." },
    { name: "purpose", label: "Purpose", full: true },
    { name: "notes", label: "Notes", type: "textarea", rows: 3 },
  ],
  searchKeys: ["donor_name", "purpose", "reference", "notes"],
  filters: [{ key: "payment_method", label: "Methods", options: METHODS }],
  archive: { type: "flag" },
  canCreate: true,
  defaults: { payment_method: "cash", currency: "GHS", donation_date: new Date().toISOString().slice(0, 10) },
  beforeSave: (v) => ({ ...v, currency: "GHS", donor_name: v["is_anonymous"] ? null : v["donor_name"] }),
  exportName: "donations",
};

function Page() {
  return (
    <RequireModule module="donations">
      <ResourceManager config={config} />
    </RequireModule>
  );
}
