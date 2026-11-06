import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ResourceManager, type ResourceConfig } from "@/components/admin/ResourceManager";
import { RequireModule } from "@/components/admin/ui";
import { CLINIC_PARTICIPANTS } from "@/lib/content";
import { programmeOptionsQuery } from "@/lib/admin/queries";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/applications")({ component: Page });

const STATUSES = ["new", "shortlisted", "accepted", "declined", "archived"] as const;

function Page() {
  const { data: programmes = [] } = useQuery(programmeOptionsQuery);
  const name = (id: string | null) => programmes.find((p) => p.value === id)?.label ?? "General interest";

  const config: ResourceConfig = {
    table: "programme_applications",
    title: "Programme applications",
    singular: "Application",
    description: "Interest and applications for programmes, including the Mentorship & Communication Clinic.",
    columns: [
      { key: "full_name", label: "Name", render: (r) => <span className="font-semibold text-primary">{r["full_name"]}</span> },
      { key: "programme_id", label: "Programme", render: (r) => name(r["programme_id"]) },
      { key: "participant_category", label: "Category", className: "hidden lg:table-cell" },
      { key: "status", label: "Status" },
      { key: "created_at", label: "Received", render: (r) => formatDate(r.created_at), className: "hidden md:table-cell" },
    ],
    fields: [
      { name: "full_name", label: "Full name", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Phone", type: "tel", required: true },
      { name: "programme_id", label: "Programme", type: "select", options: programmes },
      {
        name: "participant_category",
        label: "Participant category",
        type: "select",
        required: true,
        options: CLINIC_PARTICIPANTS.map((c) => ({ value: c, label: c })),
      },
      { name: "status", label: "Status", type: "select", options: STATUSES, required: true },
      { name: "institution", label: "School / organisation" },
      { name: "community", label: "Community" },
      { name: "motivation", label: "Motivation", type: "textarea", rows: 3 },
      { name: "admin_notes", label: "Internal notes (staff only)", type: "textarea", rows: 3 },
    ],
    searchKeys: ["full_name", "email", "phone", "institution", "community"],
    statusField: "status",
    statusOptions: STATUSES,
    filters: [{ key: "programme_id", label: "Programmes", options: programmes }],
    archive: { type: "status", value: "archived", restoreTo: "new" },
    canCreate: true,
    defaults: { status: "new", consent: true },
    quickStatuses: [
      { value: "shortlisted", label: "Shortlist" },
      { value: "accepted", label: "Accept" },
      { value: "declined", label: "Decline" },
    ],
    canDelete: true,
    exportName: "programme-applications",
  };

  return (
    <RequireModule module="applications">
      <ResourceManager config={config} />
    </RequireModule>
  );
}
