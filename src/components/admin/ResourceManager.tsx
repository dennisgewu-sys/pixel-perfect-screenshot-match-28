import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, ArchiveRestore, ChevronLeft, ChevronRight, Download, Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/site/blocks";
import { AdminPageHeader, selectClass } from "./ui";
import { downloadCsv } from "@/lib/admin/csv";
import { humanize, isValidPhone } from "@/lib/format";
import { cn } from "@/lib/utils";

// Generic table access: each config names its own table; the database rules decide what the user may do.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as unknown as { from: (t: string) => any };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = {
  id: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  is_archived?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};
export type Option = { value: string; label: string };

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "email" | "tel" | "number" | "date" | "datetime" | "select" | "checkbox" | "multiselect" | "url";
  options?: readonly (string | Option)[];
  required?: boolean;
  readOnly?: boolean;
  full?: boolean;
  hint?: string;
  placeholder?: string;
  rows?: number;
};

export type ColumnDef = { key: string; label: string; render?: (row: Row) => ReactNode; className?: string };

export type ResourceConfig = {
  table: string;
  title: string;
  singular: string;
  description?: ReactNode;
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  columns: ColumnDef[];
  fields: FieldDef[];
  searchKeys: string[];
  statusField?: string;
  statusOptions?: readonly string[];
  filters?: { key: string; label: string; options: readonly (string | Option)[] }[];
  archive?: { type: "flag" } | { type: "status"; value: string; restoreTo: string };
  canCreate?: boolean;
  defaults?: Record<string, unknown>;
  beforeSave?: (values: Record<string, unknown>, isNew: boolean) => Record<string, unknown>;
  /** Read-only information shown above the edit form (e.g. what the applicant wrote). */
  detail?: (row: Row) => ReactNode;
  /** One-click status changes shown in the record view. */
  quickStatuses?: { value: string; label: string }[];
  exportName: string;
  headerExtra?: ReactNode;
};

const PAGE = 25;
const norm = (o: string | Option): Option => (typeof o === "string" ? { value: o, label: humanize(o) } : o);
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function toInput(field: FieldDef, v: unknown): unknown {
  if (v === null || v === undefined) return field.type === "checkbox" ? false : field.type === "multiselect" ? [] : "";
  if (field.type === "datetime" && typeof v === "string") {
    const d = new Date(v);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  if (field.type === "date" && typeof v === "string") return v.slice(0, 10);
  return v;
}

function fromInput(field: FieldDef, v: unknown): unknown {
  if (field.type === "checkbox") return Boolean(v);
  if (field.type === "multiselect") return Array.isArray(v) ? v : [];
  if (typeof v === "string") {
    const t = v.trim();
    if (t === "") return null;
    if (field.type === "number") return Number(t);
    if (field.type === "datetime") return new Date(t).toISOString();
    return t;
  }
  return v;
}

export function validate(fields: FieldDef[], values: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    if (f.readOnly) continue;
    const v = values[f.name];
    const empty = v === null || v === undefined || (typeof v === "string" && v.trim() === "") || (Array.isArray(v) && v.length === 0);
    if (f.required && empty && f.type !== "checkbox") {
      errors[f.name] = `${f.label} is required.`;
      continue;
    }
    if (empty || typeof v !== "string") continue;
    if (f.type === "email" && !EMAIL.test(v.trim())) errors[f.name] = "Enter a valid email address.";
    if (f.type === "tel" && !isValidPhone(v)) errors[f.name] = "Enter a valid phone number.";
    if (f.type === "number" && (!Number.isFinite(Number(v)) || Number(v) < 0)) errors[f.name] = "Enter a valid amount.";
    if (f.type === "url" && !/^https?:\/\//i.test(v.trim())) errors[f.name] = "Links must start with https://";
  }
  return errors;
}

export function ResourceManager({ config }: { config: ResourceConfig }) {
  const qc = useQueryClient();
  const key = ["admin", config.table];
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [extra, setExtra] = useState<Record<string, string>>({});
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [confirmArchive, setConfirmArchive] = useState<Row | null>(null);

  const { data: rows = [], isLoading, error } = useQuery({
    queryKey: key,
    queryFn: async (): Promise<Row[]> => {
      const order = config.orderBy ?? { column: "created_at", ascending: false };
      const { data, error } = await db
        .from(config.table)
        .select(config.select ?? "*")
        .order(order.column, { ascending: order.ascending ?? false })
        .limit(2000);
      if (error) throw error;
      return data as Row[];
    },
  });

  const isArchived = (r: Row) =>
    config.archive?.type === "flag" ? Boolean(r.is_archived) : config.archive?.type === "status" ? r.status === config.archive.value : false;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (!showArchived && isArchived(r)) return false;
      if (status && config.statusField && r[config.statusField] !== status) return false;
      for (const [k, v] of Object.entries(extra)) if (v && String(r[k] ?? "") !== v) return false;
      if (!q) return true;
      return config.searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(q));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, search, status, extra, showArchived]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * PAGE, current * PAGE + PAGE);

  const archiveMutation = useMutation({
    mutationFn: async ({ row, restore }: { row: Row; restore: boolean }) => {
      const a = config.archive!;
      const patch = a.type === "flag" ? { is_archived: !restore } : { status: restore ? a.restoreTo : a.value };
      const { error } = await db.from(config.table).update(patch).eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(v.restore ? `${config.singular} restored.` : `${config.singular} archived.`);
      qc.invalidateQueries({ queryKey: key });
      setConfirmArchive(null);
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function exportCsv() {
    const cols = [
      { label: "ID", value: (r: Row) => r.id },
      ...config.fields.map((f) => ({ label: f.label, value: (r: Row) => r[f.name] })),
      { label: "Created", value: (r: Row) => r.created_at },
    ];
    downloadCsv(config.exportName, filtered, cols);
  }

  return (
    <div>
      <AdminPageHeader
        title={config.title}
        description={config.description}
        actions={
          <>
            {config.headerExtra}
            <Button variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>
              <Download /> Export CSV
            </Button>
            {config.canCreate && (
              <Button onClick={() => setEditing("new")}>
                <Plus /> New {config.singular.toLowerCase()}
              </Button>
            )}
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border bg-card p-3 shadow-soft md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label={`Search ${config.title.toLowerCase()}`}
            placeholder="Search…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-9"
          />
        </div>
        {config.statusField && config.statusOptions && (
          <select
            aria-label="Filter by status"
            className={cn(selectClass, "md:w-48")}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All statuses</option>
            {config.statusOptions.map((s) => (
              <option key={s} value={s}>
                {humanize(s)}
              </option>
            ))}
          </select>
        )}
        {config.filters?.map((f) => (
          <select
            key={f.key}
            aria-label={`Filter by ${f.label}`}
            className={cn(selectClass, "md:w-48")}
            value={extra[f.key] ?? ""}
            onChange={(e) => {
              setExtra((x) => ({ ...x, [f.key]: e.target.value }));
              setPage(0);
            }}
          >
            <option value="">All {f.label.toLowerCase()}</option>
            {f.options.map(norm).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ))}
        {config.archive && (
          <label className="flex shrink-0 items-center gap-2 px-1 text-sm text-muted-foreground">
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="h-4 w-4 accent-primary" />
            Show archived
          </label>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
          </div>
        ) : error ? (
          <p className="px-6 py-12 text-center text-sm text-destructive">
            Couldn't load records: {(error as Error).message}
          </p>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-semibold text-primary">{rows.length === 0 ? `No ${config.title.toLowerCase()} yet` : "No matching records"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {rows.length === 0
                ? config.canCreate
                  ? `Use “New ${config.singular.toLowerCase()}” to add the first one.`
                  : "New submissions from the website will appear here."
                : "Try a different search or filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  {config.columns.map((c) => (
                    <th key={c.key} scope="col" className={cn("px-4 py-3 font-semibold", c.className)}>
                      {c.label}
                    </th>
                  ))}
                  <th scope="col" className="px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {visible.map((r) => (
                  <tr key={r.id} className={cn("hover:bg-muted/40", isArchived(r) && "opacity-60")}>
                    {config.columns.map((c) => (
                      <td key={c.key} className={cn("px-4 py-3 align-top", c.className)}>
                        {c.render ? c.render(r) : c.key === config.statusField ? <StatusBadge status={r[c.key]} /> : (r[c.key] ?? "—")}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right align-top">
                      <Button size="sm" variant="outline" onClick={() => setEditing(r)}>
                        Open
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > PAGE && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
            <span>
              {current * PAGE + 1}–{Math.min(filtered.length, (current + 1) * PAGE)} of {filtered.length}
            </span>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" aria-label="Previous page" disabled={current === 0} onClick={() => setPage(current - 1)}>
                <ChevronLeft />
              </Button>
              <Button size="icon" variant="ghost" aria-label="Next page" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>
                <ChevronRight />
              </Button>
            </div>
          </div>
        )}
      </div>
      {!isLoading && rows.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Showing {filtered.length} of {rows.length} records.
        </p>
      )}

      {editing && (
        <RecordDialog
          config={config}
          row={editing === "new" ? null : editing}
          archived={editing !== "new" && isArchived(editing)}
          onClose={() => setEditing(null)}
          onArchive={(r) => setConfirmArchive(r)}
          onRestore={(r) => archiveMutation.mutate({ row: r, restore: true })}
        />
      )}

      <AlertDialog open={!!confirmArchive} onOpenChange={(o) => !o && setConfirmArchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this {config.singular.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>
              It will be hidden from lists{config.archive?.type === "flag" ? " and the public website" : ""}. Nothing is deleted — you can
              restore it any time with “Show archived”.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (confirmArchive) archiveMutation.mutate({ row: confirmArchive, restore: false });
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {archiveMutation.isPending && <Loader2 className="animate-spin" />} Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RecordDialog({
  config,
  row,
  archived,
  onClose,
  onArchive,
  onRestore,
}: {
  config: ResourceConfig;
  row: Row | null;
  archived: boolean;
  onClose: () => void;
  onArchive: (r: Row) => void;
  onRestore: (r: Row) => void;
}) {
  const qc = useQueryClient();
  const isNew = row === null;
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const base: Record<string, unknown> = {};
    for (const f of config.fields) base[f.name] = toInput(f, row ? row[f.name] : config.defaults?.[f.name]);
    return base;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = useMutation({
    mutationFn: async (override?: Record<string, unknown>) => {
      let payload: Record<string, unknown> = {};
      for (const f of config.fields) if (!f.readOnly) payload[f.name] = fromInput(f, values[f.name]);
      if (isNew && config.defaults) payload = { ...config.defaults, ...Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== null)) };
      if (override) payload = { ...payload, ...override };
      if (config.beforeSave) payload = config.beforeSave(payload, isNew);
      const q = isNew ? db.from(config.table).insert(payload) : db.from(config.table).update(payload).eq("id", row!.id);
      const { error } = await q;
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(isNew ? `${config.singular} created.` : `${config.singular} saved.`);
      qc.invalidateQueries({ queryKey: ["admin", config.table] });
      qc.invalidateQueries({ queryKey: ["public"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
      onClose();
    },
    onError: (e: Error) => toast.error(friendlyError(e.message)),
  });

  function submit(override?: Record<string, unknown>) {
    if (save.isPending) return;
    const errs = validate(config.fields, values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    save.mutate(override);
  }

  const set = (name: string, v: unknown) => setValues((x) => ({ ...x, [name]: v }));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary">{isNew ? `New ${config.singular.toLowerCase()}` : `${config.singular} record`}</DialogTitle>
          {!isNew && row?.created_at && (
            <DialogDescription>
              Created {new Date(row.created_at).toLocaleString("en-GB")}
              {row.updated_at ? ` · Updated ${new Date(row.updated_at).toLocaleString("en-GB")}` : ""}
            </DialogDescription>
          )}
        </DialogHeader>

        {!isNew && config.detail && <div className="rounded-xl border bg-muted/40 p-4 text-sm">{config.detail(row!)}</div>}

        {!isNew && config.quickStatuses && config.statusField && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick action:</span>
            {config.quickStatuses.map((s) => (
              <Button
                key={s.value}
                size="sm"
                variant={row![config.statusField!] === s.value ? "default" : "outline"}
                disabled={save.isPending}
                onClick={() => {
                  set(config.statusField!, s.value);
                  submit({ [config.statusField!]: s.value });
                }}
              >
                {s.label}
              </Button>
            ))}
          </div>
        )}

        <form
          id="record-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="grid gap-4 sm:grid-cols-2"
        >
          {config.fields.map((f) => (
            <FieldInput key={f.name} field={f} value={values[f.name]} error={errors[f.name]} onChange={(v) => set(f.name, v)} />
          ))}
        </form>

        <DialogFooter className="gap-2 sm:justify-between">
          <div>
            {!isNew && config.archive &&
              (archived ? (
                <Button type="button" variant="outline" onClick={() => onRestore(row!)}>
                  <ArchiveRestore /> Restore
                </Button>
              ) : (
                <Button type="button" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => onArchive(row!)}>
                  <Archive /> Archive
                </Button>
              ))}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form="record-form" disabled={save.isPending}>
              {save.isPending && <Loader2 className="animate-spin" />} {isNew ? "Create" : "Save changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function friendlyError(msg: string) {
  if (msg.includes("row-level security")) return "Your role isn't allowed to make this change.";
  if (msg.includes("duplicate key") && msg.includes("slug")) return "That web address (slug) is already used. Choose another.";
  if (msg.includes("violates check constraint")) return "One of the values isn't allowed. Check lengths and formats.";
  return msg;
}

export function FieldInput({
  field: f,
  value,
  error,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  error?: string | undefined;
  onChange: (v: unknown) => void;
}) {
  const id = `f-${f.name}`;
  const common = { id, "aria-invalid": !!error, "aria-describedby": error ? `${id}-err` : undefined, disabled: f.readOnly };
  const full = f.full || f.type === "textarea" || f.type === "multiselect";
  let input: ReactNode;
  switch (f.type) {
    case "textarea":
      input = <Textarea {...common} rows={f.rows ?? 4} value={String(value ?? "")} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "select":
      input = (
        <select {...common} className={selectClass} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          {!f.required && <option value="">—</option>}
          {f.required && value === "" && <option value="">Choose…</option>}
          {(f.options ?? []).map(norm).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "checkbox":
      return (
        <label className={cn("flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2.5 text-sm", full && "sm:col-span-2")}>
          <input type="checkbox" className="h-4 w-4 accent-primary" checked={Boolean(value)} disabled={f.readOnly} onChange={(e) => onChange(e.target.checked)} />
          <span className="font-medium">{f.label}</span>
          {f.hint && <span className="text-xs text-muted-foreground">— {f.hint}</span>}
        </label>
      );
    case "multiselect": {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      input = (
        <div className="flex flex-wrap gap-2">
          {(f.options ?? []).map(norm).map((o) => (
            <label key={o.value} className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs">
              <input
                type="checkbox"
                className="accent-primary"
                checked={arr.includes(o.value)}
                disabled={f.readOnly}
                onChange={(e) => onChange(e.target.checked ? [...arr, o.value] : arr.filter((x) => x !== o.value))}
              />
              {o.label}
            </label>
          ))}
        </div>
      );
      break;
    }
    default:
      input = (
        <Input
          {...common}
          type={f.type === "datetime" ? "datetime-local" : f.type === "number" ? "number" : f.type === "tel" ? "tel" : f.type ?? "text"}
          step={f.type === "number" ? "0.01" : undefined}
          min={f.type === "number" ? 0 : undefined}
          value={String(value ?? "")}
          placeholder={f.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
  return (
    <div className={cn("space-y-1.5", full && "sm:col-span-2")}>
      <Label htmlFor={id} className="text-sm font-semibold">
        {f.label}
        {f.required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {input}
      {f.hint && !error && <p className="text-xs text-muted-foreground">{f.hint}</p>}
      {error && (
        <p id={`${id}-err`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function DetailList({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
      {items.map(([k, v]) => (
        <div key={k} className={cn(typeof v === "string" && v.length > 80 && "sm:col-span-2")}>
          <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{k}</dt>
          <dd className="mt-0.5 whitespace-pre-wrap break-words text-foreground">{v === null || v === undefined || v === "" ? "—" : v}</dd>
        </div>
      ))}
    </dl>
  );
}
