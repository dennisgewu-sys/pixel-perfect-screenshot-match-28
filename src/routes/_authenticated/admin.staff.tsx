import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { AdminPageHeader, RequireModule } from "@/components/admin/ui";
import { ROLES, canManageStaff, roleLabel, type AppRole } from "@/lib/admin/roles";
import { useStaff } from "@/lib/admin/staff-context";
import { createStaffAccount, setStaffActive } from "@/lib/admin/staff.functions";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/staff")({ component: Page });

function Page() {
  return (
    <RequireModule module="staff">
      <Staff />
    </RequireModule>
  );
}

type StaffRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
  roles: AppRole[];
};

function Staff() {
  const me = useStaff();
  const manage = canManageStaff(me.roles);
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [confirm, setConfirm] = useState<{ row: StaffRow; active: boolean } | null>(null);
  const toggleActive = useServerFn(setStaffActive);

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["admin", "staff"],
    queryFn: async (): Promise<StaffRow[]> => {
      const [p, r] = await Promise.all([
        supabase.from("user_profiles").select("id,email,full_name,is_active,created_at").order("created_at"),
        supabase.from("user_roles").select("user_id,role"),
      ]);
      if (p.error) throw p.error;
      if (r.error) throw r.error;
      return p.data.map((u) => ({ ...u, roles: r.data.filter((x) => x.user_id === u.id).map((x) => x.role) }));
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({ userId, role, grant }: { userId: string; role: AppRole; grant: boolean }) => {
      const { error } = grant
        ? await supabase.from("user_roles").insert({ user_id: userId, role })
        : await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(`${roleLabel(v.role)} ${v.grant ? "granted" : "removed"}.`);
      qc.invalidateQueries({ queryKey: ["admin", "staff"] });
      if (v.userId === me.userId) qc.invalidateQueries({ queryKey: ["staff-session"] });
    },
    onError: (e: Error) => toast.error(e.message.includes("Super Admin must remain") ? "At least one Super Admin must remain." : e.message),
  });

  const activeMutation = useMutation({
    mutationFn: (v: { userId: string; active: boolean }) => toggleActive({ data: v }),
    onSuccess: (_d, v) => {
      toast.success(v.active ? "Account reactivated." : "Account deactivated. They can no longer sign in.");
      qc.invalidateQueries({ queryKey: ["admin", "staff"] });
      setConfirm(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <AdminPageHeader
        title="Staff accounts"
        description={
          manage
            ? "Create staff logins and choose what each person can manage. There is no public sign-up."
            : "Only the Super Admin can create accounts or change roles."
        }
        actions={
          manage && (
            <Button onClick={() => setCreating(true)}>
              <UserPlus /> Add staff member
            </Button>
          )
        }
      />

      {isLoading ? (
        <p className="flex items-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{(error as Error).message}</p>
      ) : (
        <div className="space-y-4">
          {data.map((u) => (
            <div key={u.id} className={cn("rounded-2xl border bg-card p-5 shadow-soft", !u.is_active && "opacity-70")}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-bold text-primary">
                    {u.full_name || u.email}
                    {u.id === me.userId && <span className="ml-2 text-xs font-medium text-muted-foreground">(you)</span>}
                  </p>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Added {formatDate(u.created_at)} · {u.is_active ? "Active" : "Deactivated"}
                  </p>
                </div>
                {manage && u.id !== me.userId && (
                  <Button
                    size="sm"
                    variant={u.is_active ? "outline" : "teal"}
                    className={u.is_active ? "text-destructive hover:text-destructive" : ""}
                    onClick={() => setConfirm({ row: u, active: !u.is_active })}
                  >
                    {u.is_active ? "Deactivate" : "Reactivate"}
                  </Button>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {ROLES.map((r) => {
                  const has = u.roles.includes(r.value);
                  if (!manage) {
                    return has ? (
                      <span key={r.value} className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                        {r.label}
                      </span>
                    ) : null;
                  }
                  return (
                    <label
                      key={r.value}
                      className={cn(
                        "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        has ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary",
                      )}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={has}
                        disabled={roleMutation.isPending}
                        onChange={(e) => roleMutation.mutate({ userId: u.id, role: r.value, grant: e.target.checked })}
                      />
                      {r.label}
                    </label>
                  );
                })}
                {!manage && u.roles.length === 0 && <span className="text-xs text-muted-foreground">No role assigned</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {creating && <CreateStaffDialog onClose={() => setCreating(false)} />}

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm?.active ? "Reactivate" : "Deactivate"} {confirm?.row.full_name || confirm?.row.email}?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.active
                ? "They will be able to sign in again with their existing password and roles."
                : "They will be signed out and blocked from signing in. Their records and history are kept."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (confirm) activeMutation.mutate({ userId: confirm.row.id, active: confirm.active });
              }}
            >
              {activeMutation.isPending && <Loader2 className="animate-spin" />} Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CreateStaffDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const create = useServerFn(createStaffAccount);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [error, setError] = useState<string | null>(null);

  const m = useMutation({
    mutationFn: () => create({ data: { fullName, email, password, roles } }),
    onSuccess: () => {
      toast.success("Staff account created. Share the temporary password with them privately.");
      qc.invalidateQueries({ queryKey: ["admin", "staff"] });
      onClose();
    },
    onError: (e: Error) => setError(e.message),
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    if (m.isPending) return;
    setError(null);
    m.mutate();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-primary">Add staff member</DialogTitle>
          <DialogDescription>
            They sign in at the staff sign-in page with this email and temporary password, then can change it using “Forgot password?”.
          </DialogDescription>
        </DialogHeader>
        <form id="create-staff" onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="s-name">Full name</Label>
            <Input id="s-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-email">Email</Label>
            <Input id="s-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-pw">Temporary password</Label>
            <Input id="s-pw" type="text" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} />
            <p className="text-xs text-muted-foreground">At least 8 characters. Avoid common passwords — leaked passwords are rejected.</p>
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold">Roles</legend>
            {ROLES.map((r) => (
              <label key={r.value} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 accent-primary"
                  checked={roles.includes(r.value)}
                  onChange={(e) => setRoles((x) => (e.target.checked ? [...x, r.value] : x.filter((y) => y !== r.value)))}
                />
                <span>
                  <span className="font-medium">{r.label}</span>
                  <span className="block text-xs text-muted-foreground">{r.summary}</span>
                </span>
              </label>
            ))}
          </fieldset>
          {error && <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="create-staff" disabled={m.isPending}>
            {m.isPending && <Loader2 className="animate-spin" />} Create account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
