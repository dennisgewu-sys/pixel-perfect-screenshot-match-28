import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Download, Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPageHeader, RequireModule, selectClass } from "@/components/admin/ui";
import { downloadCsv } from "@/lib/admin/csv";
import { formatDate, humanize } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/audit")({ component: Page });

function Page() {
  return (
    <RequireModule module="audit">
      <Audit />
    </RequireModule>
  );
}

const ACTION = { insert: "Created", update: "Updated", delete: "Removed" } as Record<string, string>;

function describe(details: unknown): string {
  if (!details || typeof details !== "object") return "";
  const d = details as Record<string, unknown>;
  const parts: string[] = [];
  if (d["status_from"] !== undefined || d["status_to"] !== undefined) parts.push(`Status ${humanize(String(d["status_from"]))} → ${humanize(String(d["status_to"]))}`);
  if (d["archived"] !== undefined) parts.push(d["archived"] === "true" ? "Archived" : "Restored");
  if (d["role"]) parts.push(`Role: ${humanize(String(d["role"]))}`);
  if (Array.isArray(d["changed_fields"]) && parts.length === 0 && d["changed_fields"].length)
    parts.push(`Changed: ${(d["changed_fields"] as string[]).map(humanize).join(", ")}`);
  return parts.join(" · ");
}

function Audit() {
  const [search, setSearch] = useState("");
  const [entity, setEntity] = useState("");
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["admin", "audit_logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(1000);
      if (error) throw error;
      return data;
    },
  });
  const entities = useMemo(() => Array.from(new Set(data.map((d) => d.entity_type))).sort(), [data]);
  const q = search.trim().toLowerCase();
  const rows = data.filter(
    (r) => (!entity || r.entity_type === entity) && (!q || (r.actor_email ?? "").toLowerCase().includes(q) || (r.entity_id ?? "").includes(q)),
  );

  return (
    <div>
      <AdminPageHeader
        title="Audit log"
        description="Every staff change to Foundation records is logged automatically. The log can't be edited."
        actions={
          <Button
            variant="outline"
            disabled={!rows.length}
            onClick={() =>
              downloadCsv("audit-log", rows, [
                { label: "When", value: (r) => r.created_at },
                { label: "Staff", value: (r) => r.actor_email },
                { label: "Action", value: (r) => r.action },
                { label: "Record type", value: (r) => r.entity_type },
                { label: "Record ID", value: (r) => r.entity_id },
                { label: "Details", value: (r) => describe(r.details) },
              ])
            }
          >
            <Download /> Export CSV
          </Button>
        }
      />
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border bg-card p-3 shadow-soft md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Search audit log" placeholder="Search by staff email or record ID…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select aria-label="Filter by record type" className={cn(selectClass, "md:w-56")} value={entity} onChange={(e) => setEntity(e.target.value)}>
          <option value="">All record types</option>
          {entities.map((e) => (
            <option key={e} value={e}>{humanize(e)}</option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-card shadow-soft">
        {isLoading ? (
          <p className="flex items-center justify-center py-12 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…</p>
        ) : error ? (
          <p className="py-12 text-center text-sm text-destructive">{(error as Error).message}</p>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No activity recorded yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Staff</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Record</th>
                <th className="hidden px-4 py-3 md:table-cell">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">{formatDate(r.created_at, true)}</td>
                  <td className="px-4 py-2.5">{r.actor_email ?? "—"}</td>
                  <td className="px-4 py-2.5 font-medium">{ACTION[r.action] ?? r.action}</td>
                  <td className="px-4 py-2.5">{humanize(r.entity_type)}</td>
                  <td className="hidden px-4 py-2.5 text-xs text-muted-foreground md:table-cell">{describe(r.details)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
