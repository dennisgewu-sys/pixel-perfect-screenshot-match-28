import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AppRole } from "./roles";

const VALID_ROLES: AppRole[] = [
  "super_admin",
  "foundation_admin",
  "programme_manager",
  "finance_officer",
  "volunteer_coordinator",
  "editor",
];

async function assertSuperAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "super_admin",
  });
  if (error || !data) throw new Error("Only a Super Admin can manage staff accounts.");
}

export const createStaffAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string; fullName: string; password: string; roles: AppRole[] }) => {
    const email = String(input.email ?? "").trim().toLowerCase();
    const fullName = String(input.fullName ?? "").trim();
    const password = String(input.password ?? "");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Enter a valid email address.");
    if (fullName.length < 2 || fullName.length > 120) throw new Error("Enter the staff member's full name.");
    if (password.length < 8) throw new Error("Temporary password must be at least 8 characters.");
    const roles = (input.roles ?? []).filter((r) => VALID_ROLES.includes(r));
    if (roles.length === 0) throw new Error("Choose at least one role.");
    return { email, fullName, password, roles };
  })
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Could not create the account.");
    const userId = created.user.id;
    await supabaseAdmin
      .from("user_profiles")
      .upsert({ id: userId, email: data.email, full_name: data.fullName, is_active: true });
    // Role rows go through the caller's own session so the audit log records who granted them.
    const { error: roleErr } = await context.supabase
      .from("user_roles")
      .insert(data.roles.map((role) => ({ user_id: userId, role })));
    if (roleErr) throw new Error(roleErr.message);
    return { userId };
  });

export const setStaffActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; active: boolean }) => {
    if (!/^[0-9a-f-]{36}$/i.test(String(input.userId))) throw new Error("Invalid user.");
    return { userId: String(input.userId), active: Boolean(input.active) };
  })
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    if (data.userId === context.userId && !data.active) {
      throw new Error("You can't deactivate your own account.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      ban_duration: data.active ? "none" : "876000h",
    });
    if (error) throw new Error(error.message);
    const { error: pErr } = await context.supabase
      .from("user_profiles")
      .update({ is_active: data.active })
      .eq("id", data.userId);
    if (pErr) throw new Error(pErr.message);
    return { ok: true };
  });
