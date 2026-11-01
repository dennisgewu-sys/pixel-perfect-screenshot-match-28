import { createContext, useContext, type ReactNode } from "react";
import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "./roles";

export type StaffSession = {
  userId: string;
  email: string;
  fullName: string | null;
  isActive: boolean;
  roles: AppRole[];
  superAdminExists: boolean;
};

export const staffSessionQuery = queryOptions({
  queryKey: ["staff-session"],
  queryFn: async (): Promise<StaffSession | null> => {
    const { data: u } = await supabase.auth.getUser();
    const user = u.user;
    if (!user) return null;
    const [roles, profile, exists] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", user.id),
      supabase.from("user_profiles").select("full_name,is_active").eq("id", user.id).maybeSingle(),
      supabase.rpc("super_admin_exists"),
    ]);
    if (roles.error) throw roles.error;
    return {
      userId: user.id,
      email: user.email ?? "",
      fullName: profile.data?.full_name ?? null,
      isActive: profile.data?.is_active ?? true,
      roles: (roles.data ?? []).map((r) => r.role),
      superAdminExists: Boolean(exists.data),
    };
  },
  staleTime: 60_000,
});

const Ctx = createContext<StaffSession | null>(null);

export function StaffProvider({ value, children }: { value: StaffSession; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStaff(): StaffSession {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStaff must be used inside the admin area");
  return v;
}
