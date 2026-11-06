import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager, type ResourceConfig } from "@/components/admin/ResourceManager";
import { RequireModule } from "@/components/admin/ui";
import { formatDate, formatGHS } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/expenses")({ component: Page });

const METHODS = ["cash", "mobile_money", "bank_transfer", "cheque", "other"] as const;

const config: ResourceConfig = {
  table: "expenses",
  title: "Expenses",
  singular: "Expense",
  description: "Record Foundation spending in Ghana cedis.",
  orderBy: { column: "expense_date", ascending: false },
  columns: [
    { key: "expense_date", label: "Date", render: (r) => formatDate(r["expense_date"]) },
    { key: "description", label: "Description", render: (r) => <span className="font-semibold text-primary">{r["description"]}</span> },
    { key: "amount", label: "Amount", render: (r) => <span className="font-semibold tabular-nums">{formatGHS(r["amount"])}</span> },
    { key: "category", label: "Category", className: "hidden md:table-cell" },
    { key: "payee", label: "Payee", className: "hidden lg:table-cell" },
  ],
  fields: [
    { name: "description", label: "Description", required: true, full: true },
    { name: "amount", label: "Amount (GHS)", type: "number", required: true },
    { name: "expense_date", label: "Date", type: "date", required: true },
    { name: "category", label: "Category", placeholder: "e.g. Transport, Venue, Printing" },
    { name: "payee", label: "Paid to" },
    { name: "payment_method", label: "Payment method", type: "select", options: METHODS, required: true },
    { name: "reference", label: "Reference / receipt no." },
    { name: "notes", label: "Notes", type: "textarea", rows: 3 },
  ],
  searchKeys: ["description", "category", "payee", "reference", "notes"],
  filters: [{ key: "payment_method", label: "Methods", options: METHODS }],
  archive: { type: "flag" },
  canCreate: true,
  defaults: { payment_method: "cash", currency: "GHS", expense_date: new Date().toISOString().slice(0, 10) },
  beforeSave: (v) => ({ ...v, currency: "GHS" }),
  canDelete: true,
  exportName: "expenses",
};

function Page() {
  return (
    <RequireModule module="expenses">
      <ResourceManager config={config} />
    </RequireModule>
  );
}
