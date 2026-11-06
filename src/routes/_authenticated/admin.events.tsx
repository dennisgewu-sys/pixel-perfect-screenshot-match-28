import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ResourceManager, type ResourceConfig } from "@/components/admin/ResourceManager";
import { RequireModule } from "@/components/admin/ui";
import { StatusBadge } from "@/components/site/blocks";
import { programmeOptionsQuery } from "@/lib/admin/queries";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/events")({ component: Page });

const STATUSES = ["scheduled", "postponed", "cancelled", "completed"] as const;
const REG = ["open", "closed", "coming_soon"] as const;

function Page() {
  const { data: programmes = [] } = useQuery(programmeOptionsQuery);

  const config: ResourceConfig = {
    table: "events",
    title: "Events",
    singular: "Event",
    description: "Upcoming programme dates and events. Events with registration Open accept sign-ups on the website.",
    orderBy: { column: "start_at", ascending: false },
    columns: [
      { key: "title", label: "Event", render: (r) => <span className="font-semibold text-primary">{r["title"]}</span> },
      { key: "start_at", label: "Date", render: (r) => formatDate(r["start_at"], true) },
      { key: "location", label: "Location", className: "hidden md:table-cell" },
      { key: "status", label: "Status" },
      { key: "registration_status", label: "Registration", render: (r) => <StatusBadge status={r["registration_status"]} />, className: "hidden md:table-cell" },
    ],
    fields: [
      { name: "title", label: "Title", required: true, full: true },
      { name: "start_at", label: "Starts", type: "datetime", required: true },
      { name: "end_at", label: "Ends", type: "datetime" },
      { name: "location", label: "Location" },
      { name: "programme_id", label: "Programme", type: "select", options: programmes },
      { name: "status", label: "Status", type: "select", options: STATUSES, required: true },
      { name: "registration_status", label: "Registration", type: "select", options: REG, required: true },
      { name: "capacity", label: "Capacity", type: "number", hint: "Leave blank for no limit." },
      { name: "description", label: "Description", type: "textarea", rows: 4 },
    ],
    searchKeys: ["title", "location", "description"],
    statusField: "status",
    statusOptions: STATUSES,
    archive: { type: "flag" },
    canCreate: true,
    defaults: { status: "scheduled", registration_status: "closed" },
    beforeSave: (v) => ({ ...v, capacity: v["capacity"] ? Math.round(Number(v["capacity"])) : null }),
    canDelete: true,
    exportName: "events",
  };

  return (
    <RequireModule module="events">
      <ResourceManager config={config} />
    </RequireModule>
  );
}
